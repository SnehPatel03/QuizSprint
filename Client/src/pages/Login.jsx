import React, { useState } from "react";
import { Mail, Lock, Zap, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleNavigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }
    try {
      const response = await axios.post(
        "https://quizsprint-fox0.onrender.com/auth/login",
        { email, password },
        {
          withCredentials: true,
        },
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
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center px-6 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-2 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Quiz
              </span>
              <span className="text-slate-800 italic">Sprint</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            <span className="inline-block relative">
              Welcome Back
              <div className="absolute -bottom-1 left-0 right-0 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 opacity-40"></div>
            </span>
          </h1>
          <p className="text-slate-600 text-sm">
            Continue your sprint to mastery
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-blue-100">
          <div className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  required
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-slate-900 text-sm"
                  placeholder="example@123.com"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Password
                </label>
                {/* <button
                  type="button"
                  onClick={() => handleNavigate("/forgot-password")}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Forgot?
                </button> */}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  required
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-slate-900 text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:scale-105 transition-transform shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 mt-6"
            >
              <span>LOGIN</span>
            </button>
          </div>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-slate-500">
                Don't have an account?
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleNavigate("/signup")}
            className="w-full py-2.5 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:border-blue-300 hover:bg-blue-50 transition text-sm"
          >
            Create Account
          </button>
        </div>

        <p className="text-center text-xs text-slate-500 mt-4">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Login;
