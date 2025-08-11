import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { SlotBookingModel, AppointmentModel, SlotModel, PatientModel } from '@/lib/models';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'doctor') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const resolvedParams = await params;
    const booking = await SlotBookingModel.findById(resolvedParams.id);
    
    if (!booking || booking.doctorId !== session.user.doctorId) {
      return NextResponse.json({
        success: false,
        error: 'Booking not found'
      }, { status: 404 });
    }

    if (booking.status !== 'booked') {
      return NextResponse.json({
        success: false,
        error: 'Only pending bookings can be confirmed'
      }, { status: 400 });
    }

    // Update booking status to completed (confirmed)
    booking.status = 'completed';
    await booking.save();

    // Create an appointment record
    const slot = await SlotModel.findById(booking.slotId);
    const patient = await PatientModel.findById(booking.patientId);

    if (slot && patient) {
      const appointment = new AppointmentModel({
        patientId: booking.patientId,
        doctorId: booking.doctorId,
        slotId: booking.slotId,
        status: 'confirmed',
        type: 'consultation',
        documents: [],
        notes: '',
        paymentReceiptUrl: undefined
      });

      await appointment.save();
    }

    return NextResponse.json({
      success: true,
      message: 'Booking confirmed successfully'
    });

  } catch (error) {
    console.error('Error confirming booking:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}