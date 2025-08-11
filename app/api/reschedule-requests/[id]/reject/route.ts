import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { RescheduleRequestModel } from '@/lib/models';

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
    const { reason } = body;

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

    // Mark reschedule request as rejected
    await RescheduleRequestModel.findByIdAndUpdate(resolvedParams.id, {
      status: 'rejected',
      doctorResponse: reason || 'Rejected by doctor - alternative time will be proposed',
      updatedAt: new Date()
    });

    // TODO: Here you might want to create a new reschedule request with doctor's proposed time
    // or send a notification to the patient with alternative slots

    return NextResponse.json({
      success: true,
      message: 'Reschedule request rejected. Patient will be notified with alternative options.'
    });

  } catch (error) {
    console.error('Error rejecting reschedule request:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}