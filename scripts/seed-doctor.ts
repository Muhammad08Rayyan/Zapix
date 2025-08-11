import { connectToDatabase } from "@/lib/db";
import { DoctorModel, PatientModel, SlotBookingModel } from "@/lib/models";
import bcrypt from "bcryptjs";

async function seedDemoDoctor() {
  try {
    await connectToDatabase();
    
    // Check if demo doctor already exists
    const existingDoctor = await DoctorModel.findOne({ email: "muhammad0rayyan@gmail.com" });
    
    if (existingDoctor) {
      console.log("Demo doctor already exists");
      return;
    }
    
    // Create demo doctor with provided data
    const doctor = await DoctorModel.create({
      name: "Muhammad Rayyan",
      phone: "+92 306 0503704",
      email: "muhammad0rayyan@gmail.com",
      password: "$2b$12$csZc.qYuw9YfHQ4v.Y2tV.tFHRhv3JpDCXU6HZ7Xf6wTKGAZgajJq",
      plan: "premium",
      active: true,
      limits: {
        maxAppointmentsPerDay: 10,
        maxReschedules: 2,
        advanceBookingDays: 30,
        cancellationHours: 24
      },
      defaultPrice: 10000,
      messageStats: {
        currentMonth: "2025-08",
        lastResetDate: new Date("2025-08-09T07:31:21.097Z"),
        messagesUsed: 0,
        monthlyLimit: 1000
      },
      paymentDetails: {
        bankAccount: {
          accountNumber: "120973489274398",
          bankName: "HBL",
          accountTitle: "Hafiz Sahab"
        },
        defaultMethod: "bank"
      }
    });

    console.log("Demo doctor created successfully:", {
      id: doctor._id,
      email: doctor.email,
      name: doctor.name
    });

    // Create sample patients for EMR functionality
    const samplePatients = [
      {
        name: "Ahmed Ali",
        age: 35,
        gender: "male" as const,
        phone: "+92300123001",
        medicalHistory: ["Hypertension", "Diabetes Type 2"],
        doctorId: doctor._id.toString()
      },
      {
        name: "Fatima Khan",
        age: 28,
        gender: "female" as const,
        phone: "+92300123002",
        medicalHistory: ["Asthma", "Allergies"],
        doctorId: doctor._id.toString()
      },
      {
        name: "Hassan Sheikh",
        age: 42,
        gender: "male" as const,
        phone: "+92300123003",
        medicalHistory: ["Heart Disease", "High Cholesterol"],
        doctorId: doctor._id.toString()
      },
      {
        name: "Aisha Malik",
        age: 31,
        gender: "female" as const,
        phone: "+92300123004",
        medicalHistory: ["Migraine", "Anxiety"],
        doctorId: doctor._id.toString()
      },
      {
        name: "Omar Hussain",
        age: 67,
        gender: "male" as const,
        phone: "+92300123005",
        medicalHistory: ["Arthritis", "Osteoporosis", "Diabetes Type 2"],
        doctorId: doctor._id.toString()
      }
    ];

    const patients = await PatientModel.insertMany(samplePatients);
    console.log(`Created ${patients.length} sample patients`);

    // Create some sample bookings/appointments for the patients
    const sampleBookings = [
      {
        slotId: "slot_1",
        doctorId: doctor._id.toString(),
        patientId: patients[0]._id.toString(),
        date: "2025-08-10",
        status: "booked" as const,
        symptoms: "High blood pressure, dizziness",
        additionalNotes: "Patient needs BP monitoring"
      },
      {
        slotId: "slot_2",
        doctorId: doctor._id.toString(),
        patientId: patients[1]._id.toString(),
        date: "2025-08-11",
        status: "completed" as const,
        symptoms: "Asthma attack, breathing difficulty",
        additionalNotes: "Prescribed inhaler"
      },
      {
        slotId: "slot_1",
        doctorId: doctor._id.toString(),
        patientId: patients[2]._id.toString(),
        date: "2025-08-12",
        status: "booked" as const,
        symptoms: "Chest pain, fatigue",
        additionalNotes: "ECG recommended"
      }
    ];

    const bookings = await SlotBookingModel.insertMany(sampleBookings);
    console.log(`Created ${bookings.length} sample bookings`);
    
  } catch (error) {
    console.error("Error seeding demo data:", error);
  }
}

seedDemoDoctor();