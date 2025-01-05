import { useState } from "react";

export default function OTPPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [otp, setOtp] = useState("");
  const [jwtToken, setJwtToken] = useState("");
  const [resultMessage, setResultMessage] = useState("");

  const sendOtp = async () => {
    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });
      const data = await res.json();
      setSessionId(data.sessionId);
      setResultMessage(data.message);
    } catch (error) {
      console.error(error);
    }
  };

  const verifyOtp = async () => {
    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, otp }),
      });
      const data = await res.json();
      setJwtToken(data.jwtToken);
      setResultMessage(data.message);
    } catch (error) {
      console.error(error);
    }
  };

  const getVerify = async () => {
    try {
      const res = await fetch("/api/get-verify", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
      const data = await res.json();
      setResultMessage(data.message);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4">OTP Verification</h1>

      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        {/* Send OTP */}
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">Phone Number</label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="+1234567890"
          />
          <button
            onClick={sendOtp}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Send OTP
          </button>
        </div>

        {/* Verify OTP */}
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">Session ID</label>
          <input
            type="text"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <label className="block mt-2 mb-2 text-sm font-medium">OTP</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <button
            onClick={verifyOtp}
            className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Verify OTP
          </button>
        </div>

        {/* Get Verify */}
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">JWT Token</label>
          <textarea
            value={jwtToken}
            onChange={(e) => setJwtToken(e.target.value)}
            className="w-full p-2 border rounded"
            rows="3"
          ></textarea>
          <button
            onClick={getVerify}
            className="mt-2 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Validate Token
          </button>
        </div>
      </div>

      {resultMessage && (
        <div className="mt-4 p-4 bg-gray-200 text-center rounded">
          {resultMessage}
        </div>
      )}
    </div>
  );
}
