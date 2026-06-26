import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import VerifyOtp from "./pages/VerifyOTP.jsx";
import Home from "./pages/Home";
import Lumelaundrysplash from "./pages/Lumelaundrysplash";
import Started from "./pages/Started.jsx";
import Profile from "./pages/Profile.jsx";
import VerifyEmailotp from "./pages/VerifyEmailOTP.jsx";
import AddAddress from "./pages/AddAddress.jsx";
import UserHome from "./pages/UserHome.jsx";
import CreateOrder from "./pages/Createorder.jsx";

function App() {
  return (
    <div className="App">
       <ToastContainer />
       <Routes>
      <Route path="/app" element={<Lumelaundrysplash />} />
      <Route path="/Started" element={<Started />} />
       <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/Profile" element={<Profile />} />
      <Route path="/verify-email-otp" element={<VerifyEmailotp />} />
      <Route path="/user-adress" element={<AddAddress />} />
      <Route path="/user-home" element={<UserHome />} />
      <Route path="/create-order" element={<CreateOrder />} />
    </Routes>
   
    </div>
  );
}

export default App;
