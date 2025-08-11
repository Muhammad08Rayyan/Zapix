import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { AppointmentModel, SlotModel, PatientModel } from '@/lib/models';

export async function GET(
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
    const appointment = await AppointmentModel.findById(resolvedParams.id);
    
    if (!appointment || appointment.doctorId !== session.user.doctorId) {
      return NextResponse.json({
        success: false,
        error: 'Appointment not found'
      }, { status: 404 });
    }

    // Populate slot and patient details
    const slot = await SlotModel.findById(appointment.slotId);
    const patient = await PatientModel.findById(appointment.patientId);

    const appointmentResponse = {
      ...appointment.toObject(),
      id: appointment._id.toString(),
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
      data: appointmentResponse
    });

  } catch (error) {
    console.error('Error fetching appointment:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function PUT(
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
    const body = await request.json();
    const { status, type, notes, paymentReceiptUrl, documents } = body;

    const appointment = await AppointmentModel.findById(resolvedParams.id);
    
    if (!appointment || appointment.doctorId !== session.user.doctorId) {
      return NextResponse.json({
        success: false,
        error: 'Appointment not found'
      }, { status: 404 });
    }

    // Update fields
    if (status) appointment.status = status;
    if (type) appointment.type = type;
    if (notes !== undefined) appointment.notes = notes;
    if (paymentReceiptUrl) appointment.paymentReceiptUrl = paymentReceiptUrl;
    if (documents) appointment.documents = documents;

    await appointment.save();

    // Populate slot and patient details
    const slot = await SlotModel.findById(appointment.slotId);
    const patient = await PatientModel.findById(appointment.patientId);

    const appointmentResponse = {
      ...appointment.toObject(),
      id: appointment._id.toString(),
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
      data: appointmentResponse,
      message: 'Appointment updated successfully'
    });

  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function DELETE(
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
    const appointment = await AppointmentModel.findById(resolvedParams.id);
    
    if (!appointment || appointment.doctorId !== session.user.doctorId) {
      return NextResponse.json({
        success: false,
        error: 'Appointment not found'
      }, { status: 404 });
    }

    // Only allow deletion if appointment is pending or can be cancelled
    if (appointment.status === 'completed') {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete completed appointments'
      }, { status: 400 });
    }

    await AppointmentModel.findByIdAndDelete(resolvedParams.id);

    return NextResponse.json({
      success: true,
      message: 'Appointment deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}