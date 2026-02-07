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
    <nav className="w-full sticky top-0 z-40 bg-[#0b0f14] border-b border-slate-800 px-6 py-4 flex justify-between items-center">
      

      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Quiz<span className="text-slate-400">Sprint</span>
        </h1>
      </div>

      {/* Right: Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-4 py-2 rounded-xl 
                   bg-red-500/10 text-red-400 border border-red-500/30
                   font-semibold hover:bg-red-500/20 transition active:scale-95"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </button>
    </nav>
  );
};

export default Navbar;
