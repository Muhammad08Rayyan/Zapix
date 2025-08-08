import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function GET() {
  try {
    console.log('Testing SMTP configuration...');
    
    // Check environment variables
    const config = {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE,
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      emailTo: process.env.EMAIL_TO
    };
    
    console.log('Environment variables:', {
      ...config,
      pass: config.pass ? 'SET (length: ' + config.pass.length + ')' : 'NOT SET'
    });

    if (!config.host || !config.user || !config.pass || !config.emailTo) {
      return NextResponse.json({
        error: "Missing required environment variables",
        config: {
          host: !!config.host,
          user: !!config.user,
          pass: !!config.pass,
          emailTo: !!config.emailTo
        }
      }, { status: 400 });
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: parseInt(config.port || "465"),
      secure: config.secure === "true",
      auth: {
        user: config.user,
        pass: config.pass,
      },
      debug: true,
      logger: true
    });

    // Test connection
    console.log('Testing SMTP connection...');
    await transporter.verify();
    console.log('SMTP connection verified!');

    // Send test email
    console.log('Sending test email...');
    const result = await transporter.sendMail({
      from: config.user,
      to: config.emailTo,
      subject: "SMTP Test - Zapix",
      text: "This is a test email to verify SMTP configuration.",
      html: `
        <h2>SMTP Test Successful</h2>
        <p>This is a test email to verify that your SMTP configuration is working correctly.</p>
        <p>Sent at: ${new Date().toLocaleString()}</p>
      `
    });

    console.log('Test email sent successfully:', result.messageId);

    return NextResponse.json({
      success: true,
      message: "SMTP test successful",
      messageId: result.messageId,
      config: {
        host: config.host,
        port: config.port,
        secure: config.secure,
        user: config.user
      }
    });

  } catch (error) {
    console.error('SMTP test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: "SMTP test failed",
      details: error instanceof Error ? {
        message: error.message,
        // Narrow unknown error shape safely without using any
        code: typeof (error as unknown as { code?: unknown }).code === 'string' ? (error as unknown as { code: string }).code : undefined,
        response: (error as unknown as { response?: unknown }).response,
        responseCode: typeof (error as unknown as { responseCode?: unknown }).responseCode === 'number' ? (error as unknown as { responseCode: number }).responseCode : undefined,
      } : 'Unknown error'
    }, { status: 500 });
  }
}