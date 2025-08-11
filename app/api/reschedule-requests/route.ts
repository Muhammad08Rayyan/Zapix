import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { RescheduleRequestModel, PatientModel } from '@/lib/models';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'doctor') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Get all pending reschedule requests for this doctor
    const rescheduleRequests = await RescheduleRequestModel.find({
      doctorId: session.user.doctorId,
      status: 'pending'
    })
    .populate('appointmentId')
    .sort({ createdAt: -1 })
    .lean();

    // Get patient names for each request
    const enrichedRequests = await Promise.all(
      rescheduleRequests.map(async (request) => {
        const patient = await PatientModel.findById(request.appointmentId?.patientId).lean();
        return {
          ...request,
          patientName: patient?.name || 'Unknown Patient'
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: enrichedRequests
    });

  } catch (error) {
    console.error('Error fetching reschedule requests:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}