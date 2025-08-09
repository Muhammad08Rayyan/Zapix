import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { SlotModel, SlotBookingModel, PatientModel } from '@/lib/models';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const doctorId = "6895d2570a60478fa18a4699";
    
    // Create some patients
    const patients = [
      {
        name: "Ahmed Ali",
        age: 32,
        gender: "male",
        phone: "+92 300 1234567",
        medicalHistory: ["Diabetes", "Hypertension"],
        doctorId: doctorId
      },
      {
        name: "Fatima Khan",
        age: 28,
        gender: "female", 
        phone: "+92 301 2345678",
        medicalHistory: ["Migraine"],
        doctorId: doctorId
      },
      {
        name: "Hassan Shah",
        age: 45,
        gender: "male",
        phone: "+92 302 3456789",
        medicalHistory: [],
        doctorId: doctorId
      },
      {
        name: "Ayesha Rahman",
        age: 35,
        gender: "female",
        phone: "+92 303 4567890",
        medicalHistory: ["Asthma"],
        doctorId: doctorId
      }
    ];

    // Clear existing test data
    await PatientModel.deleteMany({ doctorId: doctorId });
    await SlotModel.deleteMany({ doctorId: doctorId });
    await SlotBookingModel.deleteMany({ doctorId: doctorId });

    // Insert patients
    const createdPatients = await PatientModel.insertMany(patients);
    console.log('Created patients:', createdPatients.length);

    // Create some slots
    const slots = [
      {
        doctorId: doctorId,
        dayOfWeek: 1, // Monday
        startTime: "09:00",
        duration: 30,
        type: "in_person",
        address: "123 Medical Center, Lahore",
        price: 3000,
        isActive: true
      },
      {
        doctorId: doctorId,
        dayOfWeek: 1, // Monday
        startTime: "10:00",
        duration: 45,
        type: "video_call",
        price: 2500,
        isActive: true
      },
      {
        doctorId: doctorId,
        dayOfWeek: 2, // Tuesday
        startTime: "14:00",
        duration: 30,
        type: "phone_call",
        price: 2000,
        isActive: true
      },
      {
        doctorId: doctorId,
        dayOfWeek: 3, // Wednesday
        startTime: "11:30",
        duration: 60,
        type: "in_person",
        address: "123 Medical Center, Lahore",
        price: 4000,
        isActive: true
      }
    ];

    const createdSlots = await SlotModel.insertMany(slots);
    console.log('Created slots:', createdSlots.length);

    // Create slot bookings (these represent the booking requests)
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const bookings = [
      {
        slotId: createdSlots[0]._id.toString(),
        doctorId: doctorId,
        patientId: createdPatients[0]._id.toString(),
        date: tomorrow.toISOString().split('T')[0], // YYYY-MM-DD format
        status: "booked", // This represents "pending" in our booking management
        paymentReceiptUrl: "https://example.com/receipt1.jpg",
        symptoms: "Feeling dizzy and high blood pressure readings",
        additionalNotes: "Patient requests morning appointment"
      },
      {
        slotId: createdSlots[1]._id.toString(),
        doctorId: doctorId,
        patientId: createdPatients[1]._id.toString(),
        date: dayAfterTomorrow.toISOString().split('T')[0],
        status: "booked",
        paymentReceiptUrl: "https://example.com/receipt2.jpg",
        symptoms: "Severe headache for the past 3 days",
        additionalNotes: "Prefers video call due to work schedule"
      },
      {
        slotId: createdSlots[2]._id.toString(),
        doctorId: doctorId,
        patientId: createdPatients[2]._id.toString(),
        date: nextWeek.toISOString().split('T')[0],
        status: "booked",
        symptoms: "Chest pain and shortness of breath",
        additionalNotes: "Urgent consultation needed"
      },
      {
        slotId: createdSlots[3]._id.toString(),
        doctorId: doctorId,
        patientId: createdPatients[3]._id.toString(),
        date: tomorrow.toISOString().split('T')[0],
        status: "completed", // This represents "confirmed" 
        paymentReceiptUrl: "https://example.com/receipt4.jpg",
        symptoms: "Asthma symptoms worsening",
        additionalNotes: "Regular follow-up appointment"
      },
      {
        slotId: createdSlots[0]._id.toString(),
        doctorId: doctorId,
        patientId: createdPatients[0]._id.toString(),
        date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: "cancelled",
        rejectionReason: "Patient requested different time slot",
        symptoms: "Follow up for diabetes check"
      }
    ];

    const createdBookings = await SlotBookingModel.insertMany(bookings);
    console.log('Created bookings:', createdBookings.length);

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        patients: createdPatients.length,
        slots: createdSlots.length,
        bookings: createdBookings.length,
        summary: {
          pending: bookings.filter(b => b.status === 'booked').length,
          confirmed: bookings.filter(b => b.status === 'completed').length,
          cancelled: bookings.filter(b => b.status === 'cancelled').length
        }
      }
    });

  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to seed database'
    }, { status: 500 });
  }
}