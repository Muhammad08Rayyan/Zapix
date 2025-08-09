import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { SlotModel, SlotBookingModel } from '@/lib/models';
import { format, addDays, startOfDay, getDay } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');
    const dateStr = searchParams.get('date');
    const daysCount = parseInt(searchParams.get('days') || '7');

    if (!doctorId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Doctor ID is required' 
      }, { status: 400 });
    }

    await connectToDatabase();

    const startDate = dateStr ? new Date(dateStr) : new Date();
    const normalizedStartDate = startOfDay(startDate);
    
    // Get available slots for the next N days
    const availableSlots = [];
    
    for (let i = 0; i < daysCount; i++) {
      const currentDate = addDays(normalizedStartDate, i);
      const dayOfWeek = getDay(currentDate);
      const dateString = format(currentDate, 'yyyy-MM-dd');

      // Get recurring slots for this day of week
      const recurringSlots = await SlotModel.find({
        doctorId,
        dayOfWeek,
        isActive: true
      }).sort({ startTime: 1 });

      // Get existing bookings for this specific date
      const existingBookings = await SlotBookingModel.find({
        doctorId,
        date: dateString,
        status: { $in: ['booked', 'completed'] }
      });

      // Check which slots are available
      for (const slot of recurringSlots) {
        const isBooked = existingBookings.some(booking => 
          booking.slotId.toString() === slot._id.toString()
        );

        if (!isBooked) {
          availableSlots.push({
            ...slot.toObject(),
            id: slot._id.toString(),
            availableDate: dateString,
            dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: availableSlots,
      meta: {
        startDate: format(normalizedStartDate, 'yyyy-MM-dd'),
        daysCount,
        totalSlots: availableSlots.length
      }
    });

  } catch (error) {
    console.error('Error fetching slot availability:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}