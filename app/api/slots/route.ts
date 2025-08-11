import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { SlotModel } from '@/lib/models';
import { CreateSlotForm } from '@/types';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'doctor') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Get weekly recurring slots (not date-specific appointments)
    const slots = await SlotModel.find({ 
      doctorId: session.user.doctorId,
      // Assuming we store recurring slots with dayOfWeek field
      dayOfWeek: { $exists: true }
    }).sort({ dayOfWeek: 1, startTime: 1 });

    return NextResponse.json({
      success: true,
      data: slots
    });

  } catch (error) {
    console.error('Error fetching slots:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'doctor') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const body: CreateSlotForm = await request.json();

    // Validate required fields for weekly recurring slots
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

    // Check for overlapping weekly slots on the same day and time
    const endTime = calculateEndTime(body.startTime, body.duration);
    
    // Convert times to minutes for easier comparison
    const newStartMinutes = timeToMinutes(body.startTime);
    const newEndMinutes = timeToMinutes(endTime);
    
    // Get all slots for this day
    const existingSlots = await SlotModel.find({
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

    // Create the weekly recurring slot
    const slot = new SlotModel({
      doctorId: session.user.doctorId,
      dayOfWeek: body.dayOfWeek,
      startTime: body.startTime,
      duration: body.duration,
      type: body.type,
      address: body.address,
      price: price,
      isActive: true
    });

    await slot.save();

    return NextResponse.json({
      success: true,
      data: slot,
      message: 'Weekly slot created successfully'
    });

  } catch (error) {
    console.error('Error creating slot:', error);
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