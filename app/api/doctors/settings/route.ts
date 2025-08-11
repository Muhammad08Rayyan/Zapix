import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/lib/db";
import { DoctorModel } from "@/lib/models";
import { authOptions } from "@/lib/auth";
import { canDoctorCustomizeSettings } from "@/lib/plan-config";

export async function GET() {
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

    const doctor = await DoctorModel.findById(doctorId).lean();
    
    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        limits: doctor.limits,
        personalPhone: doctor.personalPhone || doctor.phone,
        businessPhone: doctor.businessPhone || "",
        notificationSettings: doctor.notificationSettings || {
          appointmentReminders: true,
          bookingNotifications: true,
          emergencyAlerts: true
        },
        plan: doctor.plan
      }
    });

  } catch (error) {
    console.error('Error fetching doctor settings:', error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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
    const { limits, personalPhone, businessPhone, notificationSettings } = body;

    // Get current doctor to check plan restrictions
    const doctor = await DoctorModel.findById(doctorId).lean();
    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }
    
    // Check if doctor has an active plan and can customize settings
    if (doctor.plan === 'none' || !doctor.active) {
      return NextResponse.json({
        success: false,
        error: "Your account is not active. Please contact admin to assign a plan."
      }, { status: 403 });
    }
    
    const canCustomize = canDoctorCustomizeSettings(doctor.plan);

    const updateData: Record<string, unknown> = {};

    if (limits && canCustomize) {
      updateData.limits = {
        maxAppointmentsPerDay: limits.maxAppointmentsPerDay || 10,
        maxReschedules: limits.maxReschedules || 2,
        advanceBookingDays: limits.advanceBookingDays || 30,
        cancellationHours: limits.cancellationHours || 24
      };
    } else if (limits && !canCustomize) {
      return NextResponse.json({
        success: false,
        error: "Settings cannot be modified with your current plan. Upgrade to Pro for customization."
      }, { status: 403 });
    }

    if (personalPhone !== undefined) {
      updateData.personalPhone = personalPhone;
    }

    if (businessPhone !== undefined) {
      updateData.businessPhone = businessPhone;
      
      // Mark business number as complete if a valid business phone is provided
      if (businessPhone && businessPhone.trim()) {
        if (!updateData.setupProgress) {
          updateData.setupProgress = {
            paymentSettings: doctor.setupProgress?.paymentSettings || false,
            businessNumber: true
          };
        } else {
          updateData['setupProgress.businessNumber'] = true;
        }
      }
    }

    if (notificationSettings) {
      updateData.notificationSettings = notificationSettings;
    }

    updateData.updatedAt = new Date();

    const updatedDoctor = await DoctorModel.findByIdAndUpdate(
      doctorId,
      { $set: updateData },
      { new: true }
    ).lean();

    if (!updatedDoctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        limits: updatedDoctor.limits,
        personalPhone: updatedDoctor.personalPhone || updatedDoctor.phone,
        businessPhone: updatedDoctor.businessPhone || "",
        notificationSettings: updatedDoctor.notificationSettings,
        plan: updatedDoctor.plan
      }
    });

  } catch (error) {
    console.error('Error updating doctor settings:', error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
}