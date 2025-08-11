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
      personalPhone: doctor.personalPhone,
      businessPhone: doctor.businessPhone,
      plan: doctor.plan,
      planAssignedDate: doctor.planAssignedDate,
      planExpiryDate: doctor.planExpiryDate,
      // Map DB field names to frontend expected names
      subscriptionStartDate: doctor.planAssignedDate,
      subscriptionEndDate: doctor.planExpiryDate,
      active: doctor.active,
      limits: doctor.limits,
      messageStats: doctor.messageStats,
      messagesUsed: doctor.messageStats?.messagesUsed || 0,
      monthlyMessageLimit: doctor.messageStats?.monthlyLimit || 0,
      paymentDetails: doctor.paymentDetails,
      notificationSettings: doctor.notificationSettings,
      defaultPrice: doctor.defaultPrice,
      appointmentsCount: 0,
      patientsCount: 0,
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
    
    const { name, personalPhone, businessPhone, plan, subscriptionStartDate, subscriptionEndDate } = await request.json();
    
    if (!name || !plan) {
      return NextResponse.json(
        { error: "Name and plan are required" },
        { status: 400 }
      );
    }
    
    // Check if another doctor with same phone numbers exists (if provided)
    const phoneCheckQueries = [];
    if (personalPhone) {
      phoneCheckQueries.push({ personalPhone });
      phoneCheckQueries.push({ phone: personalPhone });
    }
    if (businessPhone) {
      phoneCheckQueries.push({ businessPhone });
      phoneCheckQueries.push({ phone: businessPhone });
    }
    
    if (phoneCheckQueries.length > 0) {
      const existingDoctorQuery = {
        $and: [
          { _id: { $ne: resolvedParams.id } },
          { $or: phoneCheckQueries }
        ]
      };
      const existingDoctor = await DoctorModel.findOne(existingDoctorQuery);
      
      if (existingDoctor) {
        return NextResponse.json(
          { error: "Doctor with this phone number already exists" },
          { status: 409 }
        );
      }
    }
    
    // Get current doctor to check if plan changed
    const currentDoctor = await DoctorModel.findById(resolvedParams.id);
    if (!currentDoctor) {
      return NextResponse.json(
        { error: "Doctor not found" },
        { status: 404 }
      );
    }
    
    const updateData: Record<string, unknown> = { name, plan };
    // Handle phone numbers - set to empty string if not provided, otherwise use the provided value
    updateData.personalPhone = personalPhone || "";
    updateData.businessPhone = businessPhone || "";
    
    // Add subscription dates if provided (map to correct DB field names)
    if (subscriptionStartDate) {
      updateData.planAssignedDate = new Date(subscriptionStartDate);
    }
    if (subscriptionEndDate) {
      updateData.planExpiryDate = new Date(subscriptionEndDate);
    }
    
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
    
    // Map _id to id for frontend compatibility and map DB field names to frontend names
    const doctorResponse = {
      id: doctor._id.toString(),
      name: doctor.name,
      email: doctor.email,
      personalPhone: doctor.personalPhone,
      businessPhone: doctor.businessPhone,
      plan: doctor.plan,
      active: doctor.active,
      createdAt: doctor.createdAt,
      subscriptionStartDate: doctor.planAssignedDate,
      subscriptionEndDate: doctor.planExpiryDate,
      appointmentsCount: 0,
      patientsCount: 0,
      messagesUsed: doctor.messageStats?.messagesUsed || 0,
      monthlyMessageLimit: doctor.messageStats?.monthlyLimit || 0
    };
    
    return NextResponse.json({ data: doctorResponse }, { status: 200 });
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