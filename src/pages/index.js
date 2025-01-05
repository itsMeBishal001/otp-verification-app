// pages/index.js
import { useState, useEffect } from "react";

export default function Home() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [message, setMessage] = useState("");
  const [step, setStep] = useState(1);
  const [verificationStatus, setVerificationStatus] = useState(null);

  // Track API call status
  const [apiStatus, setApiStatus] = useState({
    sendOtp: { called: false, success: false },
    verifyOtp: { called: false, success: false },
    getVerify: { called: false, success: false },
  });

  const checkTokenStatus = async (token) => {
    try {
      setApiStatus((prev) => ({
        ...prev,
        getVerify: { called: true, success: false },
      }));

      const res = await fetch("/api/get-verify", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      setApiStatus((prev) => ({
        ...prev,
        getVerify: { called: true, success: res.ok },
      }));

      setVerificationStatus(data.isValid);
      setMessage(data.message);
    } catch (error) {
      setApiStatus((prev) => ({
        ...prev,
        getVerify: { called: true, success: false },
      }));
      setMessage("Error checking token status");
      setVerificationStatus(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      checkTokenStatus(token);
    }
  }, []);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    try {
      setApiStatus((prev) => ({
        ...prev,
        sendOtp: { called: true, success: false },
      }));

      // Log request
      console.log("Send OTP API Request:");
      console.log("Endpoint: /api/send-otp");
      console.log("Method: POST");
      console.log("Request body:", {
        phoneNumber: phoneNumber,
      });

      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });
      const data = await res.json();

      // Log response
      console.log("Response:", data);

      setApiStatus((prev) => ({
        ...prev,
        sendOtp: { called: true, success: res.ok },
      }));

      if (res.ok) {
        setSessionId(data.sessionId);
        setStep(2);
        setMessage("OTP sent successfully");
      } else {
        setMessage(data.message || "Error sending OTP");
      }
    } catch (error) {
      console.error("Error:", error);
      setApiStatus((prev) => ({
        ...prev,
        sendOtp: { called: true, success: false },
      }));
      setMessage("Error sending OTP");
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    try {
      setApiStatus((prev) => ({
        ...prev,
        verifyOtp: { called: true, success: false },
      }));

      // Log request
      console.log("Verify OTP API Request:");
      console.log("Endpoint: /api/verify-otp");
      console.log("Method: POST");
      console.log("Request body:", {
        sessionId: sessionId,
        otp: otp,
      });

      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, otp }),
      });
      const data = await res.json();

      // Log response
      console.log("Response:", data);

      setApiStatus((prev) => ({
        ...prev,
        verifyOtp: { called: true, success: res.ok },
      }));

      if (res.ok) {
        localStorage.setItem("token", data.jwtToken);
        setStep(3);
        setMessage("OTP verified successfully");
      } else {
        setMessage(data.message || "Error verifying OTP");
      }
    } catch (error) {
      console.error("Error:", error);
      setApiStatus((prev) => ({
        ...prev,
        verifyOtp: { called: true, success: false },
      }));
      setMessage("Error verifying OTP");
    }
  };

  const handleVerifyToken = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("No token available");
      return;
    }

    try {
      setApiStatus((prev) => ({
        ...prev,
        getVerify: { called: true, success: false },
      }));

      // Log request
      console.log("Get Verify API Request:");
      console.log("Endpoint: /api/get-verify");
      console.log("Method: GET");
      console.log("Headers:", {
        Authorization: `Bearer ${token}`,
      });

      const res = await fetch("/api/get-verify", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      // Log response
      console.log("Response:", data);

      setApiStatus((prev) => ({
        ...prev,
        getVerify: { called: true, success: res.ok },
      }));

      setVerificationStatus(data.isValid);
      setMessage(data.message);
    } catch (error) {
      console.error("Error:", error);
      setApiStatus((prev) => ({
        ...prev,
        getVerify: { called: true, success: false },
      }));
      setMessage("Error checking token status");
      setVerificationStatus(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setVerificationStatus(null);
    setStep(1);
    setMessage("");
    setPhoneNumber("");
    setOtp("");
    setSessionId("");
    setApiStatus({
      sendOtp: { called: false, success: false },
      verifyOtp: { called: false, success: false },
      getVerify: { called: false, success: false },
    });
  };

  const StatusTracker = () => (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      <h2 className="text-lg font-semibold mb-3">API Status Tracker</h2>
      <div className="space-y-2">
        <div className="flex items-center">
          <div className="w-24">Send OTP:</div>
          <div className="flex items-center">
            {apiStatus.sendOtp.called ? (
              apiStatus.sendOtp.success ? (
                <span className="text-green-500">✓ Success</span>
              ) : (
                <span className="text-red-500">✗ Failed</span>
              )
            ) : (
              <span className="text-gray-400">Not Called</span>
            )}
          </div>
        </div>
        <div className="flex items-center">
          <div className="w-24">Verify OTP:</div>
          <div className="flex items-center">
            {apiStatus.verifyOtp.called ? (
              apiStatus.verifyOtp.success ? (
                <span className="text-green-500">✓ Success</span>
              ) : (
                <span className="text-red-500">✗ Failed</span>
              )
            ) : (
              <span className="text-gray-400">Not Called</span>
            )}
          </div>
        </div>
        <div className="flex items-center">
          <div className="w-24">Get Verify:</div>
          <div className="flex items-center">
            {apiStatus.getVerify.called ? (
              apiStatus.getVerify.success ? (
                <span className="text-green-500">✓ Success</span>
              ) : (
                <span className="text-red-500">✗ Failed</span>
              )
            ) : (
              <span className="text-gray-400">Not Called</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (verificationStatus === true) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Verification Status
          </h1>
          <StatusTracker />
          <div className="text-center text-green-600 mb-4">
            You are verified! Token is valid.
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          OTP Verification
        </h1>

        <StatusTracker />

        {message && (
          <div
            className={`mb-4 p-3 rounded ${
              message.includes("Error")
                ? "bg-red-100 text-red-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {message}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSendOTP}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="+1234567890"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Send OTP
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOTP}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="123456"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Verify OTP
            </button>
          </form>
        )}

        {step === 3 && (
          <div className="text-center">
            <div className="text-yellow-600 mb-4">
              OTP verification complete
            </div>
            <button
              onClick={handleVerifyToken}
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mb-2"
            >
              Verify Token
            </button>
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600"
            >
              Start Over
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
