import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { DoctorModel } from "@/lib/models";

export async function PATCH(
  _request: Request,
  context: unknown
) {
  try {
    await connectToDatabase();
    const { params } = context as { params: { id: string } };
    
    const doctor = await DoctorModel.findById(params.id);
    
    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor not found" },
        { status: 404 }
      );
    }
    
    // Toggle the active status
    doctor.active = !doctor.active;
    await doctor.save();
    
    // Return doctor without password and map _id to id
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
    console.error("Error toggling doctor status:", error);
    return NextResponse.json(
      { error: "Failed to toggle doctor status" },
      { status: 500 }
    );
  }
}