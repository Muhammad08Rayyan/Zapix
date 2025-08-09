import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { SlotModel, SlotBookingModel, PatientModel } from '@/lib/models';
import { format, startOfDay, getDay, parseISO } from 'date-fns';

interface BookSlotRequest {
  slotId: string;
  patientId?: string;
  patientPhone: string;
  date: string; // YYYY-MM-DD format
  patientName?: string;
  patientAge?: number;
  patientGender?: 'male' | 'female' | 'other';
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body: BookSlotRequest = await request.json();
    const { slotId, patientId, patientPhone, date, patientName, patientAge, patientGender } = body;

    // Validate required fields
    if (!slotId || !patientPhone || !date) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: slotId, patientPhone, and date are required'
      }, { status: 400 });
    }

    // Validate date format
    let bookingDate: Date;
    try {
      bookingDate = parseISO(date);
      if (isNaN(bookingDate.getTime())) {
        throw new Error('Invalid date');
      }
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Invalid date format. Use YYYY-MM-DD'
      }, { status: 400 });
    }

    // Check if date is in the past
    const today = startOfDay(new Date());
    if (startOfDay(bookingDate) < today) {
      return NextResponse.json({
        success: false,
        error: 'Cannot book slots for past dates'
      }, { status: 400 });
    }

    // Get the recurring slot
    const slot = await SlotModel.findById(slotId);
    if (!slot || !slot.isActive) {
      return NextResponse.json({
        success: false,
        error: 'Slot not found or inactive'
      }, { status: 404 });
    }

    // Check if the day of week matches
    const dayOfWeek = getDay(bookingDate);
    if (slot.dayOfWeek !== dayOfWeek) {
      return NextResponse.json({
        success: false,
        error: 'Date does not match the slot\'s day of week'
      }, { status: 400 });
    }

    // Check if slot is already booked for this date
    const existingBooking = await SlotBookingModel.findOne({
      slotId,
      date: format(bookingDate, 'yyyy-MM-dd'),
      status: { $in: ['booked', 'completed'] }
    });

    if (existingBooking) {
      return NextResponse.json({
        success: false,
        error: 'This slot is already booked for the selected date'
      }, { status: 409 });
    }

    // Find or create patient if needed
    let patient = null;
    if (patientId) {
      patient = await PatientModel.findById(patientId);
    } else if (patientName && patientAge && patientGender) {
      // Try to find existing patient by phone and doctor
      patient = await PatientModel.findOne({
        phone: patientPhone,
        doctorId: slot.doctorId
      });

      // Create new patient if not found
      if (!patient) {
        patient = new PatientModel({
          name: patientName,
          age: patientAge,
          gender: patientGender,
          phone: patientPhone,
          doctorId: slot.doctorId,
          medicalHistory: []
        });
        await patient.save();
      }
    }

    // Create the slot booking
    const slotBooking = new SlotBookingModel({
      slotId,
      doctorId: slot.doctorId,
      patientId: patient?._id?.toString(),
      date: format(bookingDate, 'yyyy-MM-dd'),
      status: 'booked'
    });

    await slotBooking.save();

    // Return booking details with slot and patient info
    const bookingResponse = {
      ...slotBooking.toObject(),
      id: slotBooking._id.toString(),
      slot: {
        ...slot.toObject(),
        id: slot._id.toString()
      },
      patient: patient ? {
        ...patient.toObject(),
        id: patient._id.toString()
      } : null
    };

    return NextResponse.json({
      success: true,
      data: bookingResponse,
      message: 'Slot booked successfully'
    });

  } catch (error) {
    console.error('Error booking slot:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');
    const patientId = searchParams.get('patientId');
    const date = searchParams.get('date');
    
    if (!doctorId && !patientId) {
      return NextResponse.json({
        success: false,
        error: 'Either doctorId or patientId is required'
      }, { status: 400 });
    }

    await connectToDatabase();

    const query: any = {};
    if (doctorId) query.doctorId = doctorId;
    if (patientId) query.patientId = patientId;
    if (date) query.date = date;

    const bookings = await SlotBookingModel.find(query).sort({ date: 1, createdAt: -1 });
    
    // Populate slot and patient details
    const populatedBookings = [];
    for (const booking of bookings) {
      const slot = await SlotModel.findById(booking.slotId);
      const patient = booking.patientId ? await PatientModel.findById(booking.patientId) : null;
      
      populatedBookings.push({
        ...booking.toObject(),
        id: booking._id.toString(),
        slot: slot ? {
          ...slot.toObject(),
          id: slot._id.toString()
        } : null,
        patient: patient ? {
          ...patient.toObject(),
          id: patient._id.toString()
        } : null
      });
    }

    return NextResponse.json({
      success: true,
      data: populatedBookings
    });

  } catch (error) {
    console.error('Error fetching slot bookings:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}