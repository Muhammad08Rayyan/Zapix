import { connectToDatabase } from "@/lib/db";
import { DoctorModel } from "@/lib/models";
import bcrypt from "bcryptjs";

async function seedDemoDoctor() {
  try {
    await connectToDatabase();
    
    // Check if demo doctor already exists
    const existingDoctor = await DoctorModel.findOne({ email: "doctor@zapix.com" });
    
    if (existingDoctor) {
      console.log("Demo doctor already exists");
      return;
    }
    
    // Hash the demo password
    const hashedPassword = await bcrypt.hash("doctor123", 12);
    
    // Create demo doctor
    const doctor = await DoctorModel.create({
      name: "Dr. Demo User",
      email: "doctor@zapix.com",
      phone: "+92300123456",
      password: hashedPassword,
      plan: "premium",
      active: true,
      limits: {
        maxAppointmentsPerDay: 20,
        maxReschedules: 3,
        advanceBookingDays: 60,
        cancellationHours: 12
      }
    });
    
    console.log("Demo doctor created successfully:", {
      id: doctor._id,
      email: doctor.email,
      name: doctor.name
    });
    
  } catch (error) {
    console.error("Error seeding demo doctor:", error);
  }
}

seedDemoDoctor();