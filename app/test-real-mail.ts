import { sendSmartMail } from "./lib/mail";
import dotenv from "dotenv";
import path from "path";

// Load env variables if not running under Bun/Next.js wrapper
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function main() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;
  const receiver = process.env.CONTACT_RECEIVER_EMAIL || "pallemamidi@gmail.com";

  console.log("=== SMTP CONFIGURATION CHECK ===");
  console.log(`SMTP_HOST: ${smtpHost || "NOT SET"}`);
  console.log(`SMTP_PORT: ${smtpPort || "NOT SET"}`);
  console.log(`SMTP_USER: ${smtpUser || "NOT SET"}`);
  console.log(`SMTP_PASSWORD: ${smtpPassword ? "******** (SET)" : "NOT SET"}`);
  console.log(`RECEIVER_EMAIL: ${receiver}`);
  console.log("================================\n");

  if (!smtpHost || !smtpUser || !smtpPassword) {
    console.error("❌ ERROR: SMTP credentials are not configured in your .env file.");
    console.error("Please add the following variables to your .env file first:");
    console.error("SMTP_HOST=smtp.gmail.com");
    console.error("SMTP_PORT=587");
    console.error("SMTP_USER=your-email@gmail.com");
    console.error("SMTP_PASSWORD=your-app-password");
    process.exit(1);
  }

  console.log(`Sending real test email to ${receiver}...`);

  const result = await sendSmartMail({
    to: receiver,
    subject: "🔥 Real-Time Test: Smart Lead System",
    badgeText: "SYSTEM TEST",
    badgeBgColor: "#1B330F",
    priorityText: "HIGH",
    priorityColor: "#DE8A24",
    htmlContentBlocks: `
      <div>
        <p style="font-size: 16px; line-height: 1.5; margin-top: 0;">
          This is a live test email from your Palle Mamidi Lead & Order Intelligence System.
        </p>
        <div style="background-color: #E8F5E9; border-left: 4px solid #2E7D32; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
          <span style="font-size: 14px; font-weight: 800; color: #2E7D32; display: block; margin-bottom: 4px;">
            ✅ SMTP CONFIGURATION SUCCESSFUL
          </span>
          <span style="font-size: 13px; line-height: 1.4; color: #1B5E20; display: block;">
            Your email server settings are correct, and emails are delivering successfully!
          </span>
        </div>
      </div>
    `,
    actionsHtml: `
      <a href="https://pallemamidi.vercel.app" class="btn btn-green" style="background-color: #2E7D32;">
        ✅ VISIT WEBSITE
      </a>
    `
  });

  if (result.success) {
    console.log("🎉 SUCCESS: Email sent successfully! Check your inbox.");
  } else {
    console.error("❌ FAILED to send email:", result.error);
  }
}

main();
