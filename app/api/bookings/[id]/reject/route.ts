import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { SlotBookingModel } from '@/lib/models';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'doctor') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const body = await request.json();
    const { reason } = body;

    const booking = await SlotBookingModel.findById(params.id);
    
    if (!booking || booking.doctorId !== session.user.doctorId) {
      return NextResponse.json({
        success: false,
        error: 'Booking not found'
      }, { status: 404 });
    }

    if (booking.status !== 'booked') {
      return NextResponse.json({
        success: false,
        error: 'Only pending bookings can be rejected'
      }, { status: 400 });
    }

    // Update booking status to cancelled
    booking.status = 'cancelled';
    if (reason) {
      booking.rejectionReason = reason;
    }
    await booking.save();

    // TODO: Send notification to patient about rejection
    // This would typically involve sending a WhatsApp message

    return NextResponse.json({
      success: true,
      message: 'Booking rejected successfully'
    });

  } catch (error) {
    console.error('Error rejecting booking:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}