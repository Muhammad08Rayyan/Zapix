import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { SlotBookingModel, SlotModel, PatientModel } from '@/lib/models';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'doctor') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const date = searchParams.get('date');

    await connectToDatabase();

    const query: any = { doctorId: session.user.doctorId };
    if (status && status !== 'all') {
      query.status = status;
    }
    if (date) {
      query.date = date;
    }

    // For now, using SlotBookingModel as our booking requests
    // In a real implementation, you'd have a separate BookingRequest model
    const bookings = await SlotBookingModel.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    const populatedBookings = [];
    for (const booking of bookings) {
      const slot = await SlotModel.findById(booking.slotId);
      const patient = booking.patientId ? await PatientModel.findById(booking.patientId) : null;

      if (slot && patient) {
        // Transform to booking request format
        const bookingRequest = {
          id: booking._id.toString(),
          patientName: patient.name,
          patientAge: patient.age,
          patientGender: patient.gender,
          patientPhone: patient.phone,
          appointmentDate: booking.date,
          appointmentTime: slot.startTime,
          appointmentType: slot.type,
          duration: slot.duration,
          price: slot.price,
          address: slot.address,
          paymentReceiptUrl: undefined, // TODO: Add payment receipt URL
          documents: [], // TODO: Add patient documents
          notes: '', // TODO: Add booking notes
          symptoms: '', // TODO: Add symptoms from booking
          medicalHistory: patient.medicalHistory || [],
          status: booking.status === 'booked' ? 'pending' : booking.status === 'completed' ? 'confirmed' : booking.status,
          createdAt: booking.createdAt,
          slotId: booking.slotId
        };

        populatedBookings.push(bookingRequest);
      }
    }

    return NextResponse.json({
      success: true,
      data: populatedBookings
    });

  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}