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

    const body = await request.json();
    const { notes, newSlotId, newDate } = body;

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
        error: 'Only pending bookings can be rescheduled'
      }, { status: 400 });
    }

    // Update booking with reschedule request
    booking.rescheduleRequest = {
      doctorNotes: notes || '',
      newSlotId: newSlotId,
      newDate: newDate,
      requestedAt: new Date(),
      status: 'pending'
    };
    await booking.save();

    // TODO: Send notification to patient about reschedule request
    // The patient should be able to accept or reject the new time
    // If rejected, they should see available slots to choose from

    return NextResponse.json({
      success: true,
      message: 'Reschedule request sent to patient'
    });

  } catch (error) {
    console.error('Error sending reschedule request:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}