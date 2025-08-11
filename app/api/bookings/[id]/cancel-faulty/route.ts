import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { SlotBookingModel } from '@/lib/models';

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
        error: 'Only pending bookings can be cancelled'
      }, { status: 400 });
    }

    // Update booking status to cancelled with specific reason
    booking.status = 'cancelled';
    booking.cancellationReason = 'faulty_receipt';
    await booking.save();

    // TODO: Send notification to patient about faulty receipt
    // The message should inform them that they can re-book the same slot
    // with a correct payment receipt

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled due to faulty receipt. Patient can re-book with correct receipt.'
    });

  } catch (error) {
    console.error('Error cancelling booking for faulty receipt:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}