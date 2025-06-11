const nodemailer = require("nodemailer");

console.log("Testing nodemailer...");

// Test if createTransport exists
if (typeof nodemailer.createTransport === "function") {
  console.log("✅ nodemailer.createTransport is available");

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "l2omeol3oat@gmail.com",
      pass: "davm nltq dfxb xcpp",
    },
  });

  console.log("✅ Transporter created successfully");
} else {
  console.log("❌ nodemailer.createTransport is not a function");
  console.log("Available methods:", Object.keys(nodemailer));
}
