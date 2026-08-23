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
      subject: "AEGIS Secure Portal - Node Operator Credentials",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; background-color: #030712; font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; -webkit-font-smoothing: antialiased;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #030712;">
              <tr>
                <td align="center" style="padding: 40px 10px;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; border: 1px solid rgba(255,255,255,0.05); background-color: #090d16; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
                    
                    <!-- Header Banner -->
                    <tr>
                      <td align="center" style="padding: 35px 40px 25px 40px; border-bottom: 1px solid rgba(255,255,255,0.03);">
                        <img src="https://aegis-website-gray.vercel.app/assets/logo2.png" alt="AEGIS AI Foundation" style="display: block; max-height: 48px; width: auto; height: auto;" />
                      </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                      <td style="padding: 30px 40px 40px 40px;">
                        <h2 style="margin: 0 0 16px 0; color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: -0.02em; text-align: center;">Secure Node Provisioning</h2>
                        <p style="margin: 0 0 24px 0; color: #94a3b8; font-size: 13px; line-height: 1.6; font-weight: 300;">
                          Hello ${userName || "Operator"},<br/><br/>
                          Your access credentials for the AEGIS Decentralized Compute Hub have been generated. Below are your secure login credentials to connect to the node operator panel.
                        </p>

                        <!-- Credentials Box -->
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #030712; border: 1px solid rgba(125,211,252,0.1); border-radius: 12px; margin-bottom: 24px;">
                          <tr>
                            <td style="padding: 20px;">
                              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                  <td style="padding-bottom: 8px; font-family: monospace; font-size: 11px; color: #565f89; text-transform: uppercase; font-weight: bold; letter-spacing: 0.1em;">Secure Endpoint ID</td>
                                </tr>
                                <tr>
                                  <td style="padding-bottom: 16px; font-family: monospace; font-size: 14px; color: #38bdf8; font-weight: 600; word-break: break-all;">${email}</td>
                                </tr>
                                <tr>
                                  <td style="padding-bottom: 8px; font-family: monospace; font-size: 11px; color: #565f89; text-transform: uppercase; font-weight: bold; letter-spacing: 0.1em;">Temporary Access Key</td>
                                </tr>
                                <tr>
                                  <td style="font-family: monospace; font-size: 15px; color: #10b981; font-weight: 600;">${generatedPassword}</td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>

                        <p style="margin: 0 0 24px 0; color: #f87171; font-size: 11px; line-height: 1.5; font-weight: 500; text-align: center;">
                          ⚠️ CRITICAL: Log in to your settings portal and replace this temporary key immediately.
                        </p>

                        <!-- Action Button -->
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td align="center">
                              <a href="https://aegis-website-gray.vercel.app/login" target="_blank" style="display: inline-block; padding: 12px 30px; background-color: #4D7CFE; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 700; border-radius: 8px; text-transform: uppercase; letter-spacing: 0.05em; box-shadow: 0 4px 12px rgba(77,124,254,0.3);">Access Secure Panel</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="padding: 24px 40px; background-color: rgba(255,255,255,0.01); border-top: 1px solid rgba(255,255,255,0.03); text-align: center;">
                        <p style="margin: 0; font-size: 10px; color: #475569; font-weight: 500; letter-spacing: 0.02em; text-transform: uppercase;">
                          AEGIS AI FOUNDATION • SECURE TRANSMISSION
                        </p>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true, message: "Credentials emailed successfully" });
  } catch (error: any) {
    console.error("Email dispatch failed:", error);
    return NextResponse.json({ error: error.message || "Failed to dispatch email" }, { status: 500 });
  }
}
