import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { DoctorModel } from "@/lib/models";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, password } = await request.json();

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if doctor already exists
    const existingDoctor = await DoctorModel.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingDoctor) {
      return NextResponse.json(
        { error: "Doctor with this email or phone already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new doctor
    const doctor = await DoctorModel.create({
      name,
      email,
      phone,
      password: hashedPassword,
      plan: 'basic',
      active: true,
      limits: {
        maxAppointmentsPerDay: 10,
        maxReschedules: 2,
        advanceBookingDays: 30,
        cancellationHours: 24
      }
    });

    return NextResponse.json({
      success: true,
      message: "Doctor account created successfully",
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        phone: doctor.phone
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