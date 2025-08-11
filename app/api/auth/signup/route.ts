import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { DoctorModel } from "@/lib/models";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if doctor already exists
    const existingDoctor = await DoctorModel.findOne({ email });

    if (existingDoctor) {
      return NextResponse.json(
        { error: "Doctor with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new doctor with neutral defaults - admin will assign plan later
    const doctor = await DoctorModel.create({
      name,
      email,
      password: hashedPassword,
      // Defaults from schema: plan: 'none', active: false
      limits: {
        maxAppointmentsPerDay: 10,
        maxReschedules: 2,
        advanceBookingDays: 30,
        cancellationHours: 24
      },
      messageStats: {
        monthlyLimit: 0,
        currentMonth: new Date().toISOString().slice(0, 7),
        messagesUsed: 0,
        lastResetDate: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: "Account created successfully! Please wait for admin approval to activate your account.",
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        active: doctor.active,
        plan: doctor.plan
      }
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}