import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { sessionId, otp } = req.body;

  if (!sessionId || !otp) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Verify the session token
    const decoded = jwt.verify(sessionId, JWT_SECRET);

    // Check if OTP matches
    if (decoded.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Generate a new JWT token for authenticated user
    const jwtToken = jwt.sign(
      { phoneNumber: decoded.phoneNumber },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      jwtToken,
      message: "OTP verified successfully",
    });
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired session" });
  }
}
