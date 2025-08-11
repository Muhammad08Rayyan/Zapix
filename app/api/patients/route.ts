import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/lib/db";
import { PatientModel } from "@/lib/models";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'doctor') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const doctorId = session.user.doctorId;

    if (!doctorId) {
      return NextResponse.json({ error: "Doctor ID not found" }, { status: 400 });
    }

    const query: Record<string, unknown> = { doctorId };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { patientId: { $regex: search, $options: 'i' } }
      ];
    }

    const patients = await PatientModel.find(query)
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: patients
    });

  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
}