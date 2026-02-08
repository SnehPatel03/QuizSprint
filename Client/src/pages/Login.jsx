import React, { useState } from "react";
import { Mail, Lock, Zap, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {motion} from 'framer-motion'
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNavigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "https://quiz-sprint-server.vercel.app/auth/login",
        { email, password },
        { withCredentials: true },
      );

      toast.success(response.data.message || "Login successful");

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", response.data.role);
      }

      if (response.data.role === "ADMIN") {
        handleNavigate("/adminDashboard");
      } else {
        handleNavigate("/dashboard");
      }
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Invalid credentials or server error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6 py-16">
      {/* subtle grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1f2933_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

      <motion.div className="relative w-full max-w-md"
 initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
          }}
      >

        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-black" />
            </div>
            <span className="text-3xl font-extrabold text-white tracking-tight">
              QuizSprint
            </span>
          </div>

          <h1 className="text-4xl font-extrabold text-white">
            Welcome back
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Continue the race. Beat the clock.
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#0b0b0b] border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 mt-2 bg-black border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-400">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => handleNavigate("/forgot-password")}
                  className="text-xs text-slate-400 hover:text-white transition"
                >
                  Forgot?
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 mt-2 py-3 bg-black border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition
                ${
                  loading
                    ? "bg-white/70 text-black cursor-not-allowed"
                    : "bg-white text-black hover:opacity-90"
                }
              `}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  LOGIN
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-slate-500">
              Don’t have an account?
            </span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <button
            type="button"
            onClick={() => handleNavigate("/signup")}
            className="w-full py-3 border border-white/10 rounded-lg font-semibold text-white hover:bg-white/5 transition"
          >
            Create Account
          </button>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Secure. Fast. Competitive.
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
