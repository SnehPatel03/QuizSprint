import React, { useState } from "react";
import { Mail, ArrowRight } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
const Forgot = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) return;
    try {
      const response = await axios.post(
        "quiz-sprint-server-7efuxd68u-snehs-projects-93e0437b.vercel.app/auth/forgotPassword",
        { email },
        { withCredentials: true },
      );
      toast.success(response.message || "Reset email sent");
      setEmail("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
    setLoading(true);
    setTimeout(() => setLoading(false), 1200);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>

      <motion.div className="relative w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition=
        {{
          duration: 0.5,
          ease: "easeOut",
        }}>
        <div className="bg-[#0b0f14] border border-slate-800 rounded-2xl px-8 py-10 shadow-xl">
          <div className="text-center mb-8">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-white flex items-center justify-center">
              <Mail className="w-6 h-6 text-black" />
            </div>
            <h1 className="text-2xl font-semibold text-white">
              Forgot password
            </h1>
            <p className="text-sm text-slate-400 mt-2">
              Enter your email to receive reset instructions
            </p>
          </div>

          <div className="mb-6">
            <label className="text-xs text-slate-400 block mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="
                  w-full h-11 pl-11 pr-4 rounded-lg
                  bg-black
                  border border-slate-700
                  text-white text-sm
                  placeholder-slate-500
                  focus:outline-none
                  focus:border-slate-500
                "
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !email}
            className="
              w-full h-11 rounded-lg
              bg-white text-black
              font-medium text-sm
              flex items-center justify-center gap-2
              hover:bg-slate-200
              disabled:bg-slate-700 disabled:text-slate-400
              transition
            "
          >
            {loading ? "Sending..." : "Send reset link"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>

          <div className="mt-6 text-center">
            <button
              onClick={() => window.history.back()}
              className="text-xs text-slate-500 hover:text-slate-300 transition"
            >
              ← Back to login
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Forgot;
