import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { phoneNumber } = req.body;

  if (!phoneNumber || !phoneNumber.match(/^\+[1-9]\d{1,14}$/)) {
    return res.status(400).json({ message: "Invalid phone number" });
  }

  // Generate a random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Generate a session ID
  const sessionId = jwt.sign({ phoneNumber, otp }, JWT_SECRET, {
    expiresIn: "5m",
  });

  res.status(200).json({
    sessionId,
    message: "OTP sent successfully",
    demoOtp: otp, // Adding OTP in response for demo
  });
}
