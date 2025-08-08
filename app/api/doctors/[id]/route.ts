import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { DoctorModel } from "@/lib/models";

export async function GET(
  _request: Request,
  context: unknown
) {
  try {
    await connectToDatabase();
    const { params } = context as { params: { id: string } };
    
    const doctor = await DoctorModel.findById(params.id).select('-password');
    
    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor not found" },
        { status: 404 }
      );
    }
    
    // Map _id to id for frontend compatibility
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
    
    return NextResponse.json({ doctor: doctorResponse }, { status: 200 });
  } catch (error) {
    console.error("Error fetching doctor:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctor" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: unknown
) {
  try {
    await connectToDatabase();
    const { params } = context as { params: { id: string } };
    
    const { name, email, phone, plan } = await request.json();
    
    if (!name || !email || !phone || !plan) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }
    
    // Check if another doctor with same email or phone exists
    const existingDoctor = await DoctorModel.findOne({
      $and: [
        { _id: { $ne: params.id } },
        { $or: [{ email }, { phone }] }
      ]
    });
    
    if (existingDoctor) {
      return NextResponse.json(
        { error: "Doctor with this email or phone already exists" },
        { status: 409 }
      );
    }
    
    const doctor = await DoctorModel.findByIdAndUpdate(
      params.id,
      { name, email, phone, plan },
      { new: true }
    ).select('-password');
    
    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor not found" },
        { status: 404 }
      );
    }
    
    // Map _id to id for frontend compatibility
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
    
    return NextResponse.json({ doctor: doctorResponse }, { status: 200 });
  } catch (error) {
    console.error("Error updating doctor:", error);
    return NextResponse.json(
      { error: "Failed to update doctor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: unknown
) {
  try {
    await connectToDatabase();
    const { params } = context as { params: { id: string } };
    
    const doctor = await DoctorModel.findByIdAndDelete(params.id);
    
    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: "Doctor deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting doctor:", error);
    return NextResponse.json(
      { error: "Failed to delete doctor" },
      { status: 500 }
    );
  }
}