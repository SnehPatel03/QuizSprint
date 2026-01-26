import React from "react";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("role");
    localStorage.removeItem("name");

    navigate("/");
  };

  return (
    <nav className="w-full bg-white shadow-md px-6 py-4 flex justify-between items-center">
      {/* Left: Logo / Name */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-slate-800">QuizSprint</h1>
      </div>

      {/* Right: Logout */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 px-4 py-2 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
