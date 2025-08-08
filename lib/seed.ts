import { connectToDatabase } from './db';
import { AdminModel, DoctorModel } from './models';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
  try {
    await connectToDatabase();

    // Create admin account
    const adminExists = await AdminModel.findOne({ email: 'Zapix@softsols.it.com' });
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('@@kay@123', 12);
      
      await AdminModel.create({
        email: 'Zapix@softsols.it.com',
        password: hashedPassword,
        name: 'Zapix Admin'
      });
      
      console.log('Admin account created successfully');
    } else {
      console.log('Admin account already exists');
    }

    // Create a sample doctor account
    const doctorExists = await DoctorModel.findOne({ email: 'doctor@zapix.com' });
    
    if (!doctorExists) {
      await DoctorModel.create({
        name: 'Dr. John Smith',
        phone: '+923001234567',
        email: 'doctor@zapix.com',
        plan: 'premium',
        active: true,
        limits: {
          maxAppointmentsPerDay: 15,
          maxReschedules: 3,
          advanceBookingDays: 30,
          cancellationHours: 24
        }
      });
      
      console.log('Sample doctor account created successfully');
    } else {
      console.log('Sample doctor account already exists');
    }

    console.log('Database seeding completed');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}