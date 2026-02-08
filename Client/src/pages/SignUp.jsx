import React, { useState } from "react";
import { User, Mail, Lock, Shield, Zap, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!name || !email || !password) {
      toast.error("All fields are required");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "quiz-sprint-client.vercel.app/auth/signup",
        { name, email, password, role },
        { withCredentials: true },
      );

      toast.success(response.data.message);

      localStorage.setItem("signupEmail", response.data.email);
      localStorage.setItem("signupRole", response.data.role);

      navigate("/verify");
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data?.error) {
        error.response.data.error.forEach((msg) => toast.error(msg));
      } else {
        toast.error("Something went wrong. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6 py-16">
      <div className="absolute inset-0 bg-[radial-gradient(#1f2933_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      <div className="relative w-full max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
          }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-black" />
            </div>
            <span className="text-3xl font-extrabold text-white tracking-tight">
              QuizSprint
            </span>
          </div>

          <h1 className="text-4xl font-extrabold text-white">Join the race</h1>
          <p className="text-slate-400 mt-2 text-sm">
            Compete. Learn fast. Beat the clock.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
          }}
          className="bg-[#0b0b0b] border border-white/10 rounded-2xl p-8 shadow-2xl space-y-5"
        >
          {/* Name */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="w-full pl-10 pr-3 py-3 bg-black border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@gmail.com"
                className="w-full pl-10 pr-3 py-3 bg-black border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-3 bg-black border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs text-slate-400 mb-2">
              Choose Role
            </label>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole("USER")}
                className={`rounded-xl border p-4 text-left transition ${
                  role === "USER"
                    ? "border-white bg-white/10"
                    : "border-white/10 hover:border-white/30"
                }`}
              >
                <User
                  className={`w-5 h-5 mb-2 ${
                    role === "USER" ? "text-white" : "text-slate-500"
                  }`}
                />
                <p className="text-sm font-semibold text-white">Participant</p>
                <p className="text-xs text-slate-500">Play & compete</p>
              </button>

              <button
                type="button"
                onClick={() => setRole("ADMIN")}
                className={`rounded-xl border p-4 text-left transition ${
                  role === "ADMIN"
                    ? "border-white bg-white/10"
                    : "border-white/10 hover:border-white/30"
                }`}
              >
                <Shield
                  className={`w-5 h-5 mb-2 ${
                    role === "ADMIN" ? "text-white" : "text-slate-500"
                  }`}
                />
                <p className="text-sm font-semibold text-white">Admin</p>
                <p className="text-xs text-slate-500">Create quizzes</p>
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
              loading
                ? "bg-white/60 text-black cursor-not-allowed"
                : "bg-white text-black hover:opacity-90"
            }`}
          >
            {loading ? "Creating account..." : "Create Account"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>

          {/* Sign In */}
          <button
            onClick={() => navigate("/login")}
            className="w-full py-3 border border-white/10 rounded-lg text-white hover:bg-white/5 transition"
          >
            Sign In
          </button>
        </motion.div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Built for speed. Designed to win.
        </p>
      </div>
    </div>
  );
};

export default SignUp;
