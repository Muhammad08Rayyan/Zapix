import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { DoctorModel } from '@/lib/models';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'doctor') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const doctor = await DoctorModel.findById(session.user.doctorId);
    
    if (!doctor) {
      return NextResponse.json({
        success: false,
        error: 'Doctor not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        paymentDetails: doctor.paymentDetails || {
          bankAccount: { accountNumber: '', bankName: '', accountTitle: '' },
          jazzCash: { phoneNumber: '', accountName: '' },
          easyPaisa: { phoneNumber: '', accountName: '' },
          defaultMethod: 'bank'
        },
        defaultPrice: doctor.defaultPrice || 3000
      }
    });

  } catch (error) {
    console.error('Error fetching payment settings:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'doctor') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const body = await request.json();
    const { bankAccount, jazzCash, easyPaisa, defaultMethod, defaultPrice } = body;

    // Validate required fields
    if (!defaultMethod || !['bank', 'jazzcash', 'easypaisa'].includes(defaultMethod)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid default payment method'
      }, { status: 400 });
    }

    const numericPrice = Number(defaultPrice);
    if (isNaN(numericPrice) || numericPrice < 0) {
      return NextResponse.json({
        success: false,
        error: 'Default price must be a positive number'
      }, { status: 400 });
    }

    // Check if at least one payment method is configured
    const hasBankAccount = bankAccount?.accountNumber && bankAccount?.bankName && bankAccount?.accountTitle;
    const hasJazzCash = jazzCash?.phoneNumber && jazzCash?.accountName;
    const hasEasyPaisa = easyPaisa?.phoneNumber && easyPaisa?.accountName;

    if (!hasBankAccount && !hasJazzCash && !hasEasyPaisa) {
      return NextResponse.json({
        success: false,
        error: 'At least one payment method must be configured'
      }, { status: 400 });
    }

    const doctor = await DoctorModel.findById(session.user.doctorId);
    
    if (!doctor) {
      return NextResponse.json({
        success: false,
        error: 'Doctor not found'
      }, { status: 404 });
    }

    // Update payment settings
    doctor.paymentDetails = {
      bankAccount: hasBankAccount ? {
        accountNumber: bankAccount.accountNumber.trim(),
        bankName: bankAccount.bankName.trim(),
        accountTitle: bankAccount.accountTitle.trim()
      } : undefined,
      jazzCash: hasJazzCash ? {
        phoneNumber: jazzCash.phoneNumber.trim(),
        accountName: jazzCash.accountName.trim()
      } : undefined,
      easyPaisa: hasEasyPaisa ? {
        phoneNumber: easyPaisa.phoneNumber.trim(),
        accountName: easyPaisa.accountName.trim()
      } : undefined,
      defaultMethod
    };

    doctor.defaultPrice = numericPrice;

    // Mark payment settings as complete in setup progress
    if (!doctor.setupProgress) {
      doctor.setupProgress = {
        paymentSettings: false,
        businessNumber: false
      };
    }
    doctor.setupProgress.paymentSettings = true;

    await doctor.save();

    return NextResponse.json({
      success: true,
      data: {
        paymentDetails: doctor.paymentDetails,
        defaultPrice: doctor.defaultPrice
      },
      message: 'Payment settings updated successfully'
    });

  } catch (error) {
    console.error('Error updating payment settings:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}