const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransporter({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "l2omeol3oat@gmail.com",
    pass: "your-app-password-here", // Replace with actual app password
  },
});

// Test connection
transporter.verify(function (error, success) {
  if (error) {
    console.log("❌ Connection failed:", error);
  } else {
    console.log("✅ Gmail SMTP connection successful!");

    // Send test email
    transporter.sendMail(
      {
        from: '"Test System" <l2omeol3oat@gmail.com>',
        to: "l2omeol3oat@gmail.com", // Send to yourself for testing
        subject: "Test Email from Contract System",
        text: "If you receive this, Gmail SMTP is working correctly!",
      },
      (error, info) => {
        if (error) {
          console.log("❌ Send failed:", error);
        } else {
          console.log("✅ Test email sent:", info.messageId);
        }
      }
    );
  }
});
