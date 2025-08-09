import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { SlotModel, AppointmentModel } from '@/lib/models';
import { CreateSlotForm } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'doctor') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const slot = await SlotModel.findOne({
      _id: params.id,
      doctorId: session.user.doctorId
    });

    if (!slot) {
      return NextResponse.json({
        success: false,
        error: 'Slot not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...slot.toObject(),
        id: slot._id.toString()
      }
    });

  } catch (error) {
    console.error('Error fetching slot:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'doctor') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const body: CreateSlotForm = await request.json();

    // Validate required fields for weekly slots
    if (body.dayOfWeek === undefined || !body.startTime || !body.duration || !body.type || body.price === undefined) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Validate price is a valid number
    const price = Number(body.price);
    if (isNaN(price) || price < 0) {
      return NextResponse.json({
        success: false,
        error: 'Price must be a valid positive number'
      }, { status: 400 });
    }

    // Find the existing slot
    const existingSlot = await SlotModel.findOne({
      _id: params.id,
      doctorId: session.user.doctorId
    });

    if (!existingSlot) {
      return NextResponse.json({
        success: false,
        error: 'Slot not found'
      }, { status: 404 });
    }

    // Check for overlapping weekly slots (exclude current slot)
    const endTime = calculateEndTime(body.startTime, body.duration);
    
    // Convert times to minutes for easier comparison
    const newStartMinutes = timeToMinutes(body.startTime);
    const newEndMinutes = timeToMinutes(endTime);
    
    // Get all other slots for this day (excluding current slot)
    const existingSlots = await SlotModel.find({
      _id: { $ne: params.id },
      doctorId: session.user.doctorId,
      dayOfWeek: body.dayOfWeek
    });
    
    // Check for overlaps manually
    const overlappingSlots = existingSlots.filter(slot => {
      const existingStartMinutes = timeToMinutes(slot.startTime);
      const existingEndMinutes = existingStartMinutes + slot.duration;
      
      // Check if slots overlap
      return (newStartMinutes < existingEndMinutes && newEndMinutes > existingStartMinutes);
    });

    if (overlappingSlots.length > 0) {
      const conflictingSlot = overlappingSlots[0];
      const conflictEndTime = calculateEndTime(conflictingSlot.startTime, conflictingSlot.duration);
      
      return NextResponse.json({
        success: false,
        error: `Time slot conflicts with existing slot from ${conflictingSlot.startTime} to ${conflictEndTime}. Please choose a different time.`,
        details: {
          conflictingSlot: {
            startTime: conflictingSlot.startTime,
            endTime: conflictEndTime,
            duration: conflictingSlot.duration,
            type: conflictingSlot.type
          }
        }
      }, { status: 409 }); // 409 Conflict status code
    }

    // Update the weekly slot
    const updatedSlot = await SlotModel.findByIdAndUpdate(
      params.id,
      {
        dayOfWeek: body.dayOfWeek,
        startTime: body.startTime,
        duration: body.duration,
        type: body.type,
        address: body.address,
        price: price
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      data: {
        ...updatedSlot?.toObject(),
        id: updatedSlot?._id.toString()
      },
      message: 'Slot updated successfully'
    });

  } catch (error) {
    console.error('Error updating slot:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'doctor') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Find the slot
    const slot = await SlotModel.findOne({
      _id: params.id,
      doctorId: session.user.doctorId
    });

    if (!slot) {
      return NextResponse.json({
        success: false,
        error: 'Slot not found'
      }, { status: 404 });
    }

    // Check if slot has appointments
    const appointments = await AppointmentModel.find({
      slotId: params.id,
      status: { $nin: ['cancelled', 'completed'] }
    });

    if (appointments.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete slot with active appointments'
      }, { status: 400 });
    }

    // Delete the slot
    await SlotModel.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      message: 'Slot deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting slot:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

function calculateEndTime(startTime: string, duration: number): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const startDate = new Date();
  startDate.setHours(hours, minutes, 0, 0);
  
  const endDate = new Date(startDate.getTime() + duration * 60 * 1000);
  
  return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
}

function timeToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}