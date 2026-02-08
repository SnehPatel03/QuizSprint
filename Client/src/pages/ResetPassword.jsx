import React, { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordsMatch =
    newPassword && confirmPassword && newPassword === confirmPassword;

  const isValid = newPassword.length >= 8 && passwordsMatch;

  const handleSubmit = async () => {
    if (!isValid) return;

    setLoading(true);
    try {
      const res = await axios.post(
        `https://quiz-sprint-server.vercel.app/auth/reset-password/${token}`,
        { password: newPassword },
        { withCredentials: true },
      );

      toast.success(res.data.message || "Password reset successful");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0f14] px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          ease: "easeOut",
        }}
        className="w-full max-w-md bg-[#111827] border border-slate-800 rounded-3xl p-8 shadow-xl"
      >
        <div className="text-center mb-6">
          <div className="mx-auto mb-4 w-12 h-12 flex items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
            <Lock />
          </div>
          <h1 className="text-2xl font-bold text-white">Reset Password</h1>
          <p className="text-slate-400 text-sm mt-1">
            Choose a strong new password
          </p>
        </div>

        {/* New Password */}
        <div className="mb-4 relative">
          <input
            type={showNewPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password"
            className="w-full bg-[#0b0f14] text-white border border-slate-700 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:border-blue-500"
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
          >
            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Confirm Password */}
        <div className="mb-3 relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            className="w-full bg-[#0b0f14] text-white border border-slate-700 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:border-blue-500"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Validation text */}
        <div className="text-sm mb-4">
          {newPassword.length > 0 && newPassword.length < 8 && (
            <p className="text-red-400">• Minimum 8 characters</p>
          )}
          {confirmPassword && !passwordsMatch && (
            <p className="text-red-400">• Passwords do not match</p>
          )}
          {isValid && <p className="text-green-400">• Password looks good</p>}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!isValid || loading}
          className="w-full py-3 rounded-xl font-semibold text-white
                     bg-blue-600 hover:bg-blue-700 transition
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
