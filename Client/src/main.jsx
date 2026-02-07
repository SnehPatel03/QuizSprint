import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, HashRouter } from "react-router-dom";
import App from "./App";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
   <ToastContainer
  position="top-right"
  autoClose={4000}
  newestOnTop
  closeOnClick
  pauseOnHover
  draggable
  theme="dark"
  style={{ 
    zIndex: 99999999,
    width: "420px",        
    maxWidth: "90vw"      
  }}
  toastClassName={() =>
    "relative flex items-start gap-4 p-5 rounded-2xl shadow-2xl border border-white/10 bg-[#0b0b0b] text-white"
  }
  bodyClassName={() =>
    "text-sm leading-relaxed font-medium tracking-wide"
  }
  progressClassName="bg-white"
/>

  </BrowserRouter> 
);
