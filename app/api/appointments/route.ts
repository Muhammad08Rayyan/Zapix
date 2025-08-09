import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { AppointmentModel, SlotBookingModel, SlotModel, PatientModel } from '@/lib/models';
import { CreateAppointmentForm } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'doctor') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    const patientId = searchParams.get('patientId');

    await connectToDatabase();

    const query: any = { doctorId: session.user.doctorId };
    if (status) query.status = status;
    if (patientId) query.patientId = patientId;

    const appointments = await AppointmentModel.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    // Populate slot bookings and patient details
    const populatedAppointments = [];
    for (const appointment of appointments) {
      const slotBooking = await SlotBookingModel.findOne({
        slotId: appointment.slotId,
        patientId: appointment.patientId
      });
      
      const slot = await SlotModel.findById(appointment.slotId);
      const patient = await PatientModel.findById(appointment.patientId);

      populatedAppointments.push({
        ...appointment.toObject(),
        id: appointment._id.toString(),
        slot: slot ? {
          ...slot.toObject(),
          id: slot._id.toString()
        } : null,
        patient: patient ? {
          ...patient.toObject(),
          id: patient._id.toString()
        } : null,
        slotBooking: slotBooking ? {
          ...slotBooking.toObject(),
          id: slotBooking._id.toString()
        } : null
      });
    }

    return NextResponse.json({
      success: true,
      data: populatedAppointments
    });

  } catch (error) {
    console.error('Error fetching appointments:', error);
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

    const body: CreateAppointmentForm = await request.json();

    // Validate required fields
    if (!body.patientName || !body.patientAge || !body.patientGender || !body.patientPhone || !body.slotId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Find or create patient
    let patient = await PatientModel.findOne({
      phone: body.patientPhone,
      doctorId: session.user.doctorId
    });

    if (!patient) {
      patient = new PatientModel({
        name: body.patientName,
        age: body.patientAge,
        gender: body.patientGender,
        phone: body.patientPhone,
        doctorId: session.user.doctorId,
        medicalHistory: []
      });
      await patient.save();
    }

    // Verify slot exists and is active
    const slot = await SlotModel.findById(body.slotId);
    if (!slot || !slot.isActive || slot.doctorId !== session.user.doctorId) {
      return NextResponse.json({
        success: false,
        error: 'Invalid slot or slot not found'
      }, { status: 400 });
    }

    // Create appointment
    const appointment = new AppointmentModel({
      patientId: patient._id.toString(),
      doctorId: session.user.doctorId,
      slotId: body.slotId,
      status: 'pending',
      type: 'consultation',
      documents: [],
      notes: body.notes || '',
      paymentReceiptUrl: undefined
    });

    await appointment.save();

    // Return appointment with populated data
    const appointmentResponse = {
      ...appointment.toObject(),
      id: appointment._id.toString(),
      patient: {
        ...patient.toObject(),
        id: patient._id.toString()
      },
      slot: {
        ...slot.toObject(),
        id: slot._id.toString()
      }
    };

    return NextResponse.json({
      success: true,
      data: appointmentResponse,
      message: 'Appointment created successfully'
    });

  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}