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
import LaundryApp from "./pages/Laundryapp.jsx";
import CreateOrder from "./pages/Createorder.jsx";
import RiderStarted from "./pages/RiderStarted.jsx";
import RiderLogin from "./pages/RiderLogin.jsx";
import RiderVerifyOtp from "./pages/RiderVerifyOTP.jsx";
import RiderProfileSetup from "./pages/RiderProfileSetup.jsx";
import RiderIdVerification from "./pages/RiderIdVerification.jsx";
import RiderWorkRights from "./pages/RiderWorkRights.jsx";
import RiderPoliceCheck from "./pages/RiderPoliceCheck.jsx";

function App() {
  return (
    <div className="App">
      <ToastContainer />
      <Routes>
        <Route path="/app" element={<Lumelaundrysplash />} />
        <Route path="/customer-login" element={<Started />} />
        <Route path="/rider-started" element={<RiderStarted />} />
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/rider-login" element={<RiderLogin />} />
        <Route path="/rider/verify-otp" element={<RiderVerifyOtp />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/verify-email-otp" element={<VerifyEmailotp />} />
        <Route path="/user-adress" element={<AddAddress />} />
        <Route path="/user-home" element={<LaundryApp />} />
        <Route path="/create-order" element={<CreateOrder />} />

        {/* ── Rider onboarding ── */}
        <Route path="/rider/profile-setup" element={<RiderProfileSetup />} />
        <Route path="/rider/id-verification" element={<RiderIdVerification />} />
        <Route path="/rider/work-rights" element={<RiderWorkRights />} />
        <Route path="/rider/police-check" element={<RiderPoliceCheck />} />
      </Routes>
    </div>
  );
}

export default App;