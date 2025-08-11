import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { PatientModel } from "@/lib/models";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { name, age, gender, phone, medicalHistory, doctorId, documents } = body;

    // Validate required fields
    if (!name || !age || !gender || !phone || !doctorId) {
      return NextResponse.json({
        success: false,
        error: "Missing required fields: name, age, gender, phone, doctorId"
      }, { status: 400 });
    }

    // Check if patient already exists for this doctor
    const existingPatient = await PatientModel.findOne({
      phone: phone,
      doctorId: doctorId
    });

    if (existingPatient) {
      return NextResponse.json({
        success: true,
        data: {
          patient: existingPatient,
          isExisting: true,
          message: "Patient already exists"
        }
      });
    }

    // Generate Patient ID
    const doctorSuffix = doctorId.slice(-3);
    
    // Find highest existing patient ID for this doctor
    const lastPatient = await PatientModel.findOne({
      doctorId: doctorId,
      patientId: { $exists: true, $nin: [null, ''] }
    }).sort({ patientId: -1 });

    let nextNumber = 1;
    if (lastPatient) {
      // Extract number from pattern like PT001001, PT001002, etc.
      const match = lastPatient.patientId.match(/PT\d{3}(\d{3})$/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }

    const patientId = `PT${doctorSuffix}${nextNumber.toString().padStart(3, '0')}`;

    // Create new patient
    const newPatient = new PatientModel({
      patientId,
      name: name.trim(),
      age: parseInt(age),
      gender,
      phone: phone.trim(),
      medicalHistory: medicalHistory || [],
      doctorId,
      documents: documents || []
    });

    await newPatient.save();

    return NextResponse.json({
      success: true,
      data: {
        patient: newPatient,
        isExisting: false,
        message: `Patient registered successfully with ID: ${patientId}`
      }
    });

  } catch (error) {
    console.error('Error registering patient:', error);
    return NextResponse.json({
      success: false,
      error: "Failed to register patient"
    }, { status: 500 });
  }
}