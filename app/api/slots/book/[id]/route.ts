import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { SlotBookingModel, SlotModel, PatientModel } from '@/lib/models';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const booking = await SlotBookingModel.findById(params.id);
    
    if (!booking) {
      return NextResponse.json({
        success: false,
        error: 'Booking not found'
      }, { status: 404 });
    }

    // Populate slot and patient details
    const slot = await SlotModel.findById(booking.slotId);
    const patient = booking.patientId ? await PatientModel.findById(booking.patientId) : null;

    const bookingResponse = {
      ...booking.toObject(),
      id: booking._id.toString(),
      slot: slot ? {
        ...slot.toObject(),
        id: slot._id.toString()
      } : null,
      patient: patient ? {
        ...patient.toObject(),
        id: patient._id.toString()
      } : null
    };

    return NextResponse.json({
      success: true,
      data: bookingResponse
    });

  } catch (error) {
    console.error('Error fetching booking:', error);
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
    await connectToDatabase();

    const body = await request.json();
    const { status } = body;

    const booking = await SlotBookingModel.findById(params.id);
    
    if (!booking) {
      return NextResponse.json({
        success: false,
        error: 'Booking not found'
      }, { status: 404 });
    }

    // Update status
    if (status && ['booked', 'cancelled', 'completed'].includes(status)) {
      booking.status = status;
      await booking.save();
    }

    // Populate slot and patient details
    const slot = await SlotModel.findById(booking.slotId);
    const patient = booking.patientId ? await PatientModel.findById(booking.patientId) : null;

    const bookingResponse = {
      ...booking.toObject(),
      id: booking._id.toString(),
      slot: slot ? {
        ...slot.toObject(),
        id: slot._id.toString()
      } : null,
      patient: patient ? {
        ...patient.toObject(),
        id: patient._id.toString()
      } : null
    };

    return NextResponse.json({
      success: true,
      data: bookingResponse,
      message: 'Booking updated successfully'
    });

  } catch (error) {
    console.error('Error updating booking:', error);
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
    await connectToDatabase();

    const booking = await SlotBookingModel.findById(params.id);
    
    if (!booking) {
      return NextResponse.json({
        success: false,
        error: 'Booking not found'
      }, { status: 404 });
    }

    // Update status to cancelled instead of deleting
    booking.status = 'cancelled';
    await booking.save();

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}