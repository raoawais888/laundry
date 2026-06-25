import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import VerifyOtp from "./pages/Otp";
import Home from "./pages/Home";
import Lumelaundrysplash from "./pages/Lumelaundrysplash";
import Started from "./pages/Started.jsx";

function App() {
  return (
    <div className="App">

       <Routes>
      <Route path="/app" element={<Lumelaundrysplash />} />
      <Route path="/Started" element={<Started />} />
       <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
    </Routes>
   
    </div>
  );
}

export default App;
