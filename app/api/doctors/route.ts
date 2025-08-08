import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { DoctorModel } from "@/lib/models";
import bcryptjs from "bcryptjs";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const plan = searchParams.get('plan');
    const status = searchParams.get('status');
    
    // Build query
    const query: Record<string, unknown> = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (plan && plan !== 'all') {
      query.plan = plan;
    }
    
    if (status && status !== 'all') {
      query.active = status === 'active';
    }
    
    const doctors = await DoctorModel.find(query).select('-password').sort({ createdAt: -1 });
    
    // Map _id to id for frontend compatibility
    const doctorsWithId = doctors.map(doctor => ({
      id: doctor._id.toString(),
      name: doctor.name,
      email: doctor.email,
      phone: doctor.phone,
      plan: doctor.plan,
      active: doctor.active,
      createdAt: doctor.createdAt,
      appointmentsCount: 0, // TODO: Calculate from appointments
      patientsCount: 0, // TODO: Calculate from patients
      messagesUsed: doctor.messageStats?.messagesUsed || 0,
      monthlyMessageLimit: doctor.messageStats?.monthlyLimit || getMessageLimitForPlan(doctor.plan)
    }));

    function getMessageLimitForPlan(plan: string) {
      switch (plan) {
        case 'basic': return 1000;
        case 'premium': return 2500;
        case 'custom': return 10000;
        default: return 1000;
      }
    }
    
    return NextResponse.json({ doctors: doctorsWithId }, { status: 200 });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctors" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { name, email, phone, plan } = await request.json();
    
    if (!name || !email || !phone || !plan) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }
    
    // Check if doctor with email or phone already exists
    const existingDoctor = await DoctorModel.findOne({
      $or: [{ email }, { phone }]
    });
    
    if (existingDoctor) {
      return NextResponse.json(
        { error: "Doctor with this email or phone already exists" },
        { status: 409 }
      );
    }
    
    // Generate a temporary password (in production, send this via email)
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcryptjs.hash(tempPassword, 10);
    
    const doctor = new DoctorModel({
      name,
      email,
      phone,
      plan,
      password: hashedPassword,
      active: true
    });
    
    await doctor.save();
    
    // Remove password from response and map _id to id
    const doctorResponse = {
      id: doctor._id.toString(),
      name: doctor.name,
      email: doctor.email,
      phone: doctor.phone,
      plan: doctor.plan,
      active: doctor.active,
      createdAt: doctor.createdAt,
      appointmentsCount: 0,
      patientsCount: 0
    };
    
    return NextResponse.json({
      doctor: doctorResponse,
      tempPassword // In production, don't return this - send via email instead
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating doctor:", error);
    return NextResponse.json(
      { error: "Failed to create doctor" },
      { status: 500 }
    );
  }
}