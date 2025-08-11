import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { PatientModel } from '@/lib/models';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    // Only allow admin users to run this migration
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    await connectToDatabase();

    // Get all patients without patientId
    const patientsWithoutId = await PatientModel.find({
      $or: [
        { patientId: { $exists: false } },
        { patientId: null },
        { patientId: '' }
      ]
    });

    let updatedCount = 0;
    
    for (const patient of patientsWithoutId) {
      // Generate Patient ID - format: PT{doctorId-last3digits}{sequential-number}
      const doctorSuffix = patient.doctorId.slice(-3);
      
      // Find highest existing patient ID for this doctor
      const existingPatients = await PatientModel.find({
        doctorId: patient.doctorId,
        patientId: { $exists: true, $nin: [null, ''] }
      }).sort({ patientId: -1 });

      let nextNumber = 1;
      if (existingPatients.length > 0) {
        const lastPatientId = existingPatients[0].patientId;
        // Extract number from pattern like PT001001, PT001002, etc.
        const match = lastPatientId.match(/PT\d{3}(\d{3})$/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }

      const patientId = `PT${doctorSuffix}${nextNumber.toString().padStart(3, '0')}`;

      // Update the patient
      await PatientModel.findByIdAndUpdate(patient._id, {
        patientId: patientId
      });

      updatedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully generated Patient IDs for ${updatedCount} patients`,
      data: { updatedCount }
    });

  } catch (error) {
    console.error('Error migrating patient IDs:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}