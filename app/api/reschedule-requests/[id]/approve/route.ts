import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { RescheduleRequestModel, SlotBookingModel } from '@/lib/models';

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
    
    // Find the reschedule request
    const rescheduleRequest = await RescheduleRequestModel.findOne({
      _id: resolvedParams.id,
      doctorId: session.user.doctorId,
      status: 'pending'
    });

    if (!rescheduleRequest) {
      return NextResponse.json(
        { success: false, error: 'Reschedule request not found or already processed' },
        { status: 404 }
      );
    }

    // Update the appointment with new date/time if provided
    const updateData: Record<string, unknown> = {
      updatedAt: new Date()
    };

    if (rescheduleRequest.newDate) {
      updateData.date = rescheduleRequest.newDate;
    }
    if (rescheduleRequest.newTime) {
      updateData.time = rescheduleRequest.newTime;
    }
    if (rescheduleRequest.newSlotId) {
      updateData.slotId = rescheduleRequest.newSlotId;
    }

    // Update the appointment
    await SlotBookingModel.findByIdAndUpdate(
      rescheduleRequest.appointmentId,
      {
        ...updateData,
        $inc: { rescheduleCount: 1 }
      }
    );

    // Mark reschedule request as approved
    await RescheduleRequestModel.findByIdAndUpdate(resolvedParams.id, {
      status: 'approved',
      doctorResponse: 'Approved by doctor',
      updatedAt: new Date()
    });

    return NextResponse.json({
      success: true,
      message: 'Reschedule request approved successfully'
    });

  } catch (error) {
    console.error('Error approving reschedule request:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}