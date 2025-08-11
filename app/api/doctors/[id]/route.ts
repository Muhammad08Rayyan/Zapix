import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { DoctorModel } from "@/lib/models";
import { getPlanConfig, createDefaultMessageStats } from "@/lib/plan-config";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const resolvedParams = await params;
    
    const doctor = await DoctorModel.findById(resolvedParams.id).select('-password');
    
    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor not found" },
        { status: 404 }
      );
    }
    
    // Map _id to id for frontend compatibility and include all relevant fields
    const doctorResponse = {
      id: doctor._id.toString(),
      name: doctor.name,
      email: doctor.email,
      phone: doctor.phone,
      plan: doctor.plan,
      planAssignedDate: doctor.planAssignedDate,
      planExpiryDate: doctor.planExpiryDate,
      active: doctor.active,
      limits: doctor.limits,
      messageStats: doctor.messageStats,
      paymentDetails: doctor.paymentDetails,
      personalPhone: doctor.personalPhone,
      businessPhone: doctor.businessPhone,
      notificationSettings: doctor.notificationSettings,
      defaultPrice: doctor.defaultPrice,
      createdAt: doctor.createdAt,
      updatedAt: doctor.updatedAt
    };
    
    return NextResponse.json({ data: doctorResponse }, { status: 200 });
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const resolvedParams = await params;
    
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
        { _id: { $ne: resolvedParams.id } },
        { $or: [{ email }, { phone }] }
      ]
    });
    
    if (existingDoctor) {
      return NextResponse.json(
        { error: "Doctor with this email or phone already exists" },
        { status: 409 }
      );
    }
    
    // Get current doctor to check if plan changed
    const currentDoctor = await DoctorModel.findById(resolvedParams.id);
    if (!currentDoctor) {
      return NextResponse.json(
        { error: "Doctor not found" },
        { status: 404 }
      );
    }
    
    const updateData: Record<string, unknown> = { name, email, phone, plan };
    
    // If plan changed, update limits, message stats, activation status, and expiry
    if (currentDoctor.plan !== plan) {
      const planConfig = getPlanConfig(plan);
      const messageStats = createDefaultMessageStats(plan);
      const now = new Date();
      
      if (plan !== 'none' && planConfig) {
        // Assigning a real plan - activate doctor and apply plan settings
        updateData.active = true;
        updateData.limits = planConfig.defaultLimits;
        updateData.planAssignedDate = now;
        updateData.planExpiryDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from now
        updateData.messageStats = {
          ...messageStats,
          // Preserve current month usage if same month
          messagesUsed: currentDoctor.messageStats?.currentMonth === messageStats.currentMonth 
            ? currentDoctor.messageStats.messagesUsed 
            : 0
        };
      } else if (plan === 'none') {
        // Removing plan - deactivate doctor but preserve settings and expiry info
        updateData.active = false;
        // Keep existing limits and expiry dates - don't reset them
        // Only reset message stats
        updateData.messageStats = {
          monthlyLimit: 0,
          currentMonth: new Date().toISOString().slice(0, 7),
          messagesUsed: 0,
          lastResetDate: new Date()
        };
      }
    }
    
    const doctor = await DoctorModel.findByIdAndUpdate(
      resolvedParams.id,
      updateData,
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const resolvedParams = await params;
    
    const doctor = await DoctorModel.findByIdAndDelete(resolvedParams.id);
    
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