import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { email, username, password, generatedPassword, userName } = await request.json();

    const emailAddress = email;
    const userLoginName = username || userName || "Operator";
    const userPassword = password || generatedPassword;

    if (!emailAddress || !userPassword) {
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
      to: emailAddress,
      subject: "AEGIS Account Provisioned",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #030712;">
              <tr>
                <td align="center" style="padding: 40px 10px;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; border: 1px solid rgba(255,255,255,0.05); background-color: #090d16; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
                    
                    <!-- Header Banner -->
                    <tr>
                      <td align="center" style="padding: 40px 40px 30px 40px; text-align: center;">
                        <img src="https://aegis-website-gray.vercel.app/assets/logo3.png" alt="AEGIS AI Foundation" style="display: block; max-height: 52px; width: auto; height: auto; margin: 0 auto;" />
                      </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                      <td style="padding: 0 40px 40px 40px; text-align: center;">
                        <p style="margin: 0 0 16px 0; color: #ffffff; font-size: 14px; line-height: 1.6; font-weight: 500; text-align: center;">
                          This is an automated operational transmission from AEGIS AI Foundation.
                        </p>
                        <p style="margin: 0 0 28px 0; color: #94a3b8; font-size: 12px; line-height: 1.6; font-weight: 400; text-align: center;">
                          Welcome to Aegis AI Foundation.<br/>
                          Your official email account has been created.<br/>
                          You can use the credentials below to access your account.
                        </p>

                        <!-- Credentials Box -->
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #030712; border: 1px solid rgba(255,255,255,0.05); border-radius: 14px; margin-bottom: 24px; text-align: center;">
                          <tr>
                            <td style="padding: 24px;">
                              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="text-align: center;">
                                <tr>
                                  <td align="center" style="padding-bottom: 4px; font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: bold; letter-spacing: 0.05em; text-align: center;">Username</td>
                                </tr>
                                <tr>
                                  <td align="center" style="padding-bottom: 16px; font-family: monospace; font-size: 18px; color: #ffffff; font-weight: bold; text-align: center;">${userLoginName}</td>
                                </tr>
                                <tr>
                                  <td align="center" style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 16px; padding-bottom: 4px; font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: bold; letter-spacing: 0.05em; text-align: center;">Password</td>
                                </tr>
                                <tr>
                                  <td align="center" style="font-family: monospace; font-size: 18px; color: #10b981; font-weight: bold; text-align: center;">${userPassword}</td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>

                        <!-- Security Recommendation Card -->
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #030712; border: 1px solid rgba(255,255,255,0.04); border-radius: 12px; margin-bottom: 28px; text-align: left;">
                          <tr>
                            <td style="padding: 16px; vertical-align: middle; width: 44px;" align="center">
                              <table border="0" cellpadding="0" cellspacing="0" style="background-color: rgba(255,255,255,0.03); border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); width: 32px; height: 32px;">
                                <tr>
                                  <td align="center" style="vertical-align: middle; color: #38bdf8; font-size: 18px; font-weight: bold; text-align: center;">🛡️</td>
                                </tr>
                              </table>
                            </td>
                            <td style="padding: 16px 16px 16px 0; vertical-align: middle;">
                              <span style="display: block; font-size: 11px; font-weight: bold; color: #ffffff; margin-bottom: 3px;">Security Recommendation</span>
                              <span style="display: block; font-size: 11px; color: #94a3b8; line-height: 1.4;">For your security, we recommend changing your password after your first login.</span>
                            </td>
                          </tr>
                        </table>

                        <!-- Help Footer -->
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="text-align: center;">
                          <tr>
                            <td align="center" style="padding-bottom: 8px; text-align: center;">
                              <table border="0" cellpadding="0" cellspacing="0" style="background-color: rgba(255,255,255,0.03); border-radius: 50%; border: 1px solid rgba(255,255,255,0.08); width: 34px; height: 34px; text-align: center; margin: 0 auto;">
                                <tr>
                                  <td align="center" style="vertical-align: middle; color: #38bdf8; font-size: 16px; text-align: center;">✉️</td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                          <tr>
                            <td align="center" style="font-size: 11px; color: #64748b; text-align: center;">
                              Need help? Contact us at<br/>
                              <a href="mailto:aegis.ai.foundation@gmail.com" style="color: #38bdf8; text-decoration: none; font-weight: 500;">aegis.ai.foundation@gmail.com</a>
                            </td>
                          </tr>
                        </table>

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
