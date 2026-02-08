import React, { useState, useRef } from "react";
import { Mail, Loader2, ArrowRight } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {motion} from 'framer-motion'
const OtpVerify = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  const email = localStorage.getItem("signupEmail");

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((d, i) => (newOtp[i] = d));
    setOtp(newOtp);

    inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
  };

  const handleSubmit = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6 || !email) return;

    setLoading(true);
    try {
      const { data } = await axios.post(
        "quiz-sprint-server-7efuxd68u-snehs-projects-93e0437b.vercel.app/auth/otpverify",
        { email, otp: otpValue },
        { withCredentials: true },
      );

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      if (data.role === "ADMIN") {
        navigate("/adminDashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      alert(
        error?.response?.data?.message ||
          "OTP verification failed. Try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const isComplete = otp.every((d) => d !== "");

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6 py-16">
      <div className="absolute inset-0 bg-[radial-gradient(#1f2933_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

      <motion.div   initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition=
        {{
          duration: 0.5,
          ease: "easeOut",
        }} className="relative w-full max-w-md">
        <div className="bg-[#0b0b0b] border border-white/10 rounded-2xl p-10 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-black" />
            </div>
            <h1 className="text-3xl font-extrabold text-white">
              Verify your email
            </h1>
            <p className="text-slate-400 text-sm mt-2">
              Enter the 6-digit code sent to your email
            </p>
          </div>

          {/* OTP Inputs */}
          <div className="flex gap-3 justify-center mb-10">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                maxLength={1}
                className="w-14 h-16 text-center text-2xl font-bold rounded-xl
                  bg-black border border-white/10 text-white
                  focus:outline-none focus:ring-2 focus:ring-white/30
                  transition"
              />
            ))}
          </div>

          {/* Verify Button */}
          <button
            onClick={handleSubmit}
            disabled={!isComplete || loading}
            className={`w-full py-4 rounded-xl font-semibold text-lg
              flex items-center justify-center gap-2 transition
              ${
                !isComplete || loading
                  ? "bg-white/40 text-black cursor-not-allowed"
                  : "bg-white text-black hover:opacity-90"
              }
            `}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                Verify Code
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>


      </motion.div>
    </div>
  );
};

export default OtpVerify;
