import nodemailer from "nodemailer";

export interface MailPayload {
  to: string;
  subject: string;
  badgeText: string;
  badgeBgColor: string;
  priorityText: "MEDIUM" | "HIGH";
  priorityColor: string;
  htmlContentBlocks: string;
  actionsHtml?: string;
  phoneToCall?: string;
}

export async function sendSmartMail(payload: MailPayload) {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || "587");
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;
  const receiverEmail = process.env.CONTACT_RECEIVER_EMAIL || "pallemamidi@gmail.com";

  const emailHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="light">
      <meta name="supported-color-schemes" content="light">
      <title>${payload.subject}</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          width: 100% !important;
          background-color: #F8F7F2;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #1A1A1A;
          -webkit-font-smoothing: antialiased;
        }
        table {
          border-spacing: 0;
          border-collapse: collapse;
          width: 100%;
        }
        td {
          padding: 0;
        }
        img {
          border: 0;
        }
        .wrapper {
          width: 100%;
          table-layout: fixed;
          background-color: #F8F7F2;
          padding-bottom: 40px;
        }
        .main-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #e1dfd7;
          margin-top: 20px;
          box-shadow: 0 4px 12px rgba(27, 51, 15, 0.05);
        }
        .header {
          background-color: #1B330F;
          padding: 24px;
          text-align: center;
        }
        .header-title {
          color: #F8F7F2;
          font-size: 24px;
          font-weight: 800;
          letter-spacing: 1px;
          margin: 0;
          text-transform: uppercase;
        }
        .header-subtitle {
          color: #DE8A24;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 2px;
          margin: 4px 0 0 0;
          text-transform: uppercase;
        }
        .meta-strip {
          padding: 12px 24px;
          background-color: #f1efe6;
          border-bottom: 1px solid #e1dfd7;
        }
        .badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 20px;
          color: #ffffff;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .priority {
          float: right;
          font-size: 11px;
          font-weight: 700;
          color: #666666;
          margin-top: 4px;
        }
        .content {
          padding: 32px 24px;
        }
        .section-title {
          font-size: 18px;
          font-weight: 700;
          color: #1B330F;
          margin-top: 0;
          margin-bottom: 16px;
          border-bottom: 2px solid #F8F7F2;
          padding-bottom: 8px;
        }
        .card {
          background-color: #F8F7F2;
          border: 1px solid #e1dfd7;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
        }
        .card-row {
          margin-bottom: 10px;
          font-size: 15px;
        }
        .card-row:last-child {
          margin-bottom: 0;
        }
        .card-label {
          font-weight: 700;
          color: #1B330F;
          display: inline-block;
          width: 90px;
        }
        .table-header {
          background-color: #1B330F;
          color: #ffffff;
          font-weight: 700;
          text-align: left;
        }
        .table-cell {
          padding: 10px 12px;
          font-size: 14px;
          border-bottom: 1px solid #e1dfd7;
        }
        .btn {
          display: block;
          text-align: center;
          text-decoration: none;
          font-weight: 800;
          font-size: 15px;
          padding: 14px 20px;
          border-radius: 10px;
          margin-bottom: 12px;
          color: #ffffff !important;
        }
        .btn:last-child {
          margin-bottom: 0;
        }
        .btn-green {
          background-color: #2E7D32;
        }
        .btn-orange {
          background-color: #DE8A24;
        }
        .footer {
          text-align: center;
          padding: 24px;
          font-size: 12px;
          color: #666666;
          border-top: 1px solid #e1dfd7;
          background-color: #F8F7F2;
        }
        .phone-highlight {
          font-size: 20px;
          font-weight: 800;
          color: #1B330F;
          letter-spacing: 0.5px;
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="main-container">
          <!-- Header -->
          <div class="header">
            <h1 class="header-title">Palle Mamidi</h1>
            <p class="header-subtitle">Fresh Farm Mangoes</p>
          </div>

          <!-- Meta Strip -->
          <div class="meta-strip">
            <span class="badge" style="background-color: ${payload.badgeBgColor};">${payload.badgeText}</span>
            <span class="priority">
              Priority: <strong style="color: ${payload.priorityColor};">${payload.priorityText}</strong>
            </span>
          </div>

          <!-- Content -->
          <div class="content">
            ${payload.htmlContentBlocks}

            <!-- Actions -->
            ${payload.actionsHtml ? `
              <div style="margin-top: 32px;">
                <h3 class="section-title">Operational Actions</h3>
                ${payload.actionsHtml}
              </div>
            ` : ""}
          </div>

          <!-- Footer -->
          <div class="footer">
            Sent by Palle Mamidi Lead & Order Intelligence System.<br>
            © ${new Date().getFullYear()} Palle Mamidi. All rights reserved.
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  if (!smtpHost || !smtpUser || !smtpPassword) {
    console.log(`
================================================================================
                       PALLE MAMIDI EMAIL PREVIEW (FALLBACK LOG)
================================================================================
SUBJECT:   ${payload.subject}
TO:        ${receiverEmail}
BADGE:     [${payload.badgeText}] (Priority: ${payload.priorityText})
--------------------------------------------------------------------------------
${payload.htmlContentBlocks.replace(/<[^>]+>/g, "\n").replace(/\n\s*\n/g, "\n").trim()}
--------------------------------------------------------------------------------
ACTIONS:   ${payload.phoneToCall ? `CALL: tel:${payload.phoneToCall} | WA: wa.me/${payload.phoneToCall.replace(/\D/g, "")}` : "N/A"}
================================================================================
    `);
    return { success: true, logged: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    } as any);

    const info = await transporter.sendMail({
      from: `"Palle Mamidi Intelligence" <${smtpUser}>`,
      to: receiverEmail,
      subject: payload.subject,
      html: emailHtml,
    });

    console.log(`[SmartMail] Email sent successfully: ${info.messageId}`);
    return { success: true, logged: false, messageId: info.messageId };
  } catch (error) {
    console.error("[SmartMail] Failed to send email via SMTP:", error);
    // Even if SMTP fails, do not throw in order to not break user checkout session flow.
    return { success: false, error: error instanceof Error ? error.message : "SMTP failure" };
  }
}
