import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      isValid: false,
      message: "No token provided",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    jwt.verify(token, JWT_SECRET);
    res.status(200).json({
      isValid: true,
      message: "Token is valid",
    });
  } catch (error) {
    res.status(401).json({
      isValid: false,
      message: "Invalid token",
    });
  }
}
