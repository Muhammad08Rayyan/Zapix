import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/lib/db";
import { PatientModel, SlotBookingModel } from "@/lib/models";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'doctor') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const doctorId = session.user.doctorId;
    if (!doctorId) {
      return NextResponse.json({ error: "Doctor ID not found" }, { status: 400 });
    }

    const resolvedParams = await params;
    const patient = await PatientModel.findOne({ 
      _id: resolvedParams.id, 
      doctorId 
    }).lean();

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Get patient's comprehensive appointment history
    const appointments = await SlotBookingModel.find({
      patientId: resolvedParams.id,
      doctorId
    }).sort({ date: -1 }).lean();

    // Get upcoming appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcomingAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate >= today && (apt.status === 'booked' || apt.status === 'confirmed');
    });

    // Get past appointments
    const pastAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate < today || apt.status === 'completed';
    });

    // Count total documents across all appointments
    const totalDocuments = appointments.reduce((total, apt) => {
      return total + (apt.documents?.length || 0);
    }, 0);

    return NextResponse.json({
      success: true,
      data: {
        patient,
        appointments: pastAppointments.map(apt => ({
          id: apt._id,
          date: apt.date,
          time: apt.time || 'N/A',
          status: apt.status,
          type: apt.type,
          symptoms: apt.symptoms,
          notes: apt.notes,
          documents: apt.documents || [],
          rescheduleCount: apt.rescheduleCount || 0
        })),
        upcomingAppointments: upcomingAppointments.map(apt => ({
          id: apt._id,
          date: apt.date,
          time: apt.time || 'N/A',
          status: apt.status,
          type: apt.type,
          rescheduleCount: apt.rescheduleCount || 0
        })),
        totalDocuments
      }
    });

  } catch (error) {
    console.error('Error fetching patient:', error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'doctor') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const doctorId = session.user.doctorId;
    if (!doctorId) {
      return NextResponse.json({ error: "Doctor ID not found" }, { status: 400 });
    }

    const body = await request.json();
    const { privateNotes, medicalHistory } = body;

    const resolvedParams = await params;
    const updatedPatient = await PatientModel.findOneAndUpdate(
      { _id: resolvedParams.id, doctorId },
      { 
        privateNotes,
        medicalHistory,
        updatedAt: new Date()
      },
      { new: true }
    ).lean();

    if (!updatedPatient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updatedPatient
    });

  } catch (error) {
    console.error('Error updating patient:', error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
}