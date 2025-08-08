import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const { email, phone, message } = await request.json();

    if (!email || !message) {
      return NextResponse.json(
        { error: "Email and message are required" },
        { status: 400 }
      );
    }

    // Log environment variables for debugging (remove in production)
    console.log('SMTP Config:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE,
      user: process.env.SMTP_USER ? 'SET' : 'NOT SET',
      pass: process.env.SMTP_PASS ? 'SET' : 'NOT SET',
      emailTo: process.env.EMAIL_TO
    });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "465"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Add timeout and connection settings
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000,
    });

    // Test the connection
    try {
      await transporter.verify();
      console.log('SMTP connection verified successfully');
    } catch (verifyError) {
      console.error('SMTP verification failed:', verifyError);
      return NextResponse.json(
        { error: "SMTP configuration error", details: verifyError },
        { status: 500 }
      );
    }

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.EMAIL_TO,
      subject: "New Contact Form Submission - Zapix",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; font-size: 24px; margin: 0;">Zapix - Contact Form</h1>
            <p style="color: #666; margin: 10px 0 0 0;">New message received from website</p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
            <h2 style="color: #333; font-size: 18px; margin: 0 0 15px 0; border-bottom: 2px solid #007bff; padding-bottom: 10px;">Contact Information</h2>
            <div style="margin-bottom: 10px;">
              <strong style="color: #333;">Email:</strong>
              <span style="color: #666; margin-left: 10px;">${email}</span>
            </div>
            ${phone ? `
            <div style="margin-bottom: 10px;">
              <strong style="color: #333;">Phone:</strong>
              <span style="color: #666; margin-left: 10px;">${phone}</span>
            </div>
            ` : ''}
          </div>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px;">
            <h2 style="color: #333; font-size: 18px; margin: 0 0 15px 0; border-bottom: 2px solid #007bff; padding-bottom: 10px;">Message</h2>
            <p style="color: #666; line-height: 1.6; white-space: pre-wrap; margin: 0;">${message}</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p style="color: #999; font-size: 14px; margin: 0;">
              This email was sent from the Zapix website contact form.
            </p>
            <p style="color: #999; font-size: 14px; margin: 5px 0 0 0;">
              Time: ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      `,
    };

    console.log('Attempting to send email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);

    return NextResponse.json(
      { 
        message: "Email sent successfully", 
        messageId: result.messageId 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email sending error:", error);
    return NextResponse.json(
      { 
        error: "Failed to send email", 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}