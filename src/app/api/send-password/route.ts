import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { email, generatedPassword, userName } = await request.json();

    if (!email || !generatedPassword) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // Configure SMTP Transporter for Gmail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"AEGIS AI Foundation" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Your AEGIS Secure Portal Password Credentials",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #4D7CFE; margin-bottom: 20px;">Welcome to AEGIS AI Foundation</h2>
          <p>Hello ${userName || "Operator"},</p>
          <p>Your secure node operator account credentials have been provisioned.</p>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 14px; margin: 20px 0; border: 1px solid #e2e8f0;">
            <strong>Email:</strong> ${email}<br/>
            <strong>Temporary Password:</strong> ${generatedPassword}
          </div>
          <p style="color: #ef4444; font-size: 12px; margin-top: 15px;"><strong>Important:</strong> Please log in and change your password immediately in your account settings.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 11px; color: #64748b;">This is an automated operational transmission from AEGIS AI Foundation.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true, message: "Credentials emailed successfully" });
  } catch (error: any) {
    console.error("Email dispatch failed:", error);
    return NextResponse.json({ error: error.message || "Failed to dispatch email" }, { status: 500 });
  }
}
