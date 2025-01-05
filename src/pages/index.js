// pages/index.js
import { useState, useEffect } from "react";

export default function Home() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [message, setMessage] = useState("");
  const [step, setStep] = useState(1);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [demoOtp, setDemoOtp] = useState("");

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phone) return "Phone number is required";
    if (!phoneRegex.test(phone))
      return "Invalid phone number format. Use format: +1234567890";

    const digitsOnly = phone.replace("+", "");
    const validCountryCodes = {
      1: 10, // Country code '1' requires 10 digits
      91: 10, // Country code '91' requires 10 digits
      44: 10, // Country code '44' requires 10 digits
      61: 9, // Country code '61' requires 9 digits
    };

    let countryCode = "";
    for (let i = 1; i <= 3; i++) {
      const potentialCode = digitsOnly.substring(0, i);
      if (validCountryCodes[potentialCode] !== undefined) {
        countryCode = potentialCode;
        break;
      }
    }

    if (!countryCode) {
      return "Invalid or unsupported country code";
    }

    const numberLength = digitsOnly.length - countryCode.length;
    if (numberLength !== validCountryCodes[countryCode]) {
      return `Invalid number length for country code +${countryCode}. Expected ${validCountryCodes[countryCode]} digits.`;
    }

    return null;
  };

  const validateOTP = (otp) => {
    const otpRegex = /^\d{6}$/;
    if (!otp) return "OTP is required";
    if (!otpRegex.test(otp)) return "OTP must be 6 digits";
    return null;
  };

  // Add validation state
  const [errors, setErrors] = useState({
    phone: null,
    otp: null,
  });

  // Update the handlePhoneChange function
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhoneNumber(value);
    const error = validatePhoneNumber(value);
    setErrors((prev) => ({ ...prev, phone: error }));
  };

  // Update the handleOTPChange function
  const handleOTPChange = (e) => {
    const value = e.target.value;
    setOtp(value);
    const error = validateOTP(value);
    setErrors((prev) => ({ ...prev, otp: error }));
  };

  // Update handleSendOTP with validation
  const handleSendOTP = async (e) => {
    e.preventDefault();

    // Validate before submission
    const phoneError = validatePhoneNumber(phoneNumber);
    if (phoneError) {
      setErrors((prev) => ({ ...prev, phone: phoneError }));
      setMessage(phoneError);
      return;
    }

    try {
      setApiStatus((prev) => ({
        ...prev,
        sendOtp: { called: true, success: false },
      }));

      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to send OTP");
      }

      setApiStatus((prev) => ({
        ...prev,
        sendOtp: { called: true, success: true },
      }));

      setSessionId(data.sessionId);
      setDemoOtp(data.demoOtp);
      setStep(2);
      setMessage("OTP sent successfully");
    } catch (error) {
      setApiStatus((prev) => ({
        ...prev,
        sendOtp: { called: true, success: false },
      }));
      setMessage(error.message);
      console.error("Error sending OTP:", error);
    }
  };

  // Update handleVerifyOTP with validation
  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    // Validate before submission
    const otpError = validateOTP(otp);
    if (otpError) {
      setErrors((prev) => ({ ...prev, otp: otpError }));
      setMessage(otpError);
      return;
    }

    try {
      setApiStatus((prev) => ({
        ...prev,
        verifyOtp: { called: true, success: false },
      }));

      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, otp }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to verify OTP");
      }

      setApiStatus((prev) => ({
        ...prev,
        verifyOtp: { called: true, success: true },
      }));

      localStorage.setItem("token", data.jwtToken);
      setStep(3);
      setMessage("OTP verified successfully");
    } catch (error) {
      setApiStatus((prev) => ({
        ...prev,
        verifyOtp: { called: true, success: false },
      }));
      setMessage(error.message);
      console.error("Error verifying OTP:", error);
    }
  };

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
  const handleVerifyToken = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("No token available. Please complete OTP verification first.");
      return;
    }

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

      if (!res.ok) {
        throw new Error(data.message || "Token verification failed");
      }

      setApiStatus((prev) => ({
        ...prev,
        getVerify: { called: true, success: true },
      }));

      setVerificationStatus(data.isValid);
      setMessage(data.message);
    } catch (error) {
      setApiStatus((prev) => ({
        ...prev,
        getVerify: { called: true, success: false },
      }));
      setMessage(error.message);
      setVerificationStatus(false);
      console.error("Error verifying token:", error);
    }
  };
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      checkTokenStatus(token);
    }
  }, []);

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

  const DemoSection = () => (
    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="text-sm font-semibold text-yellow-700 mb-2">
        🚀 Demo Mode
      </h3>
      <p className="text-xs text-yellow-600 mb-2">
        This is a demo version. In production, OTP would be sent via SMS.
      </p>
      {demoOtp && (
        <div className="bg-white p-3 rounded border border-yellow-200">
          <p className="text-sm text-yellow-800">Demo OTP:</p>
          <div className="flex items-center gap-2">
            <code className="text-lg font-mono font-bold text-yellow-700">
              {demoOtp}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(demoOtp);
                setMessage("OTP copied to clipboard!");
              }}
              className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-2 py-1 rounded"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );

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

        <DemoSection />

        {step === 1 && (
          <form onSubmit={handleSendOTP}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                className={`w-full p-2 border rounded ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="+1234567890"
                required
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
              disabled={!!errors.phone}
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
                onChange={handleOTPChange}
                className={`w-full p-2 border rounded ${
                  errors.otp ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="123456"
                maxLength={6}
                required
              />
              {errors.otp && (
                <p className="mt-1 text-xs text-red-500">{errors.otp}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
              disabled={!!errors.otp}
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
