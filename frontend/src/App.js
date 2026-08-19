import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import VerifyOtp from "./pages/VerifyOTP.jsx";
import Home from "./pages/Home";
import AboutUs from "./pages/AboutUs.jsx";
import OurServices from "./pages/OurServices.jsx";
import Contact from "./pages/Contact.jsx";

// Admin pages import .......
import AdminLogin from "./pages/admin/AdminLogin.jsx";
import AdminForgotPassword from "./pages/admin/AdminForgotPassword.jsx";
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminOrders from "./pages/admin/AdminOrders.jsx";
import AdminOrderDetail from "./pages/admin/AdminOrderDetail.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import AdminUserDetail from "./pages/admin/AdminUserDetail.jsx";
import AdminRiders from "./pages/admin/AdminRiders.jsx";
import AdminRiderDetail from "./pages/admin/AdminRiderDetail.jsx";
import AdminPayments from "./pages/admin/AdminPayments.jsx";
import AdminReviews from "./pages/admin/AdminReviews.jsx";
import AdminServices from "./pages/admin/AdminServices.jsx";
import AdminNotifications from "./pages/admin/AdminNotifications.jsx";
import AdminSettings from "./pages/admin/AdminSettings.jsx";
import AdminReports from "./pages/admin/AdminReports.jsx";
import AdminProtectedRoute from "./components/AdminProtectedRoute.jsx";

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
import RiderVehicleDetails from "./pages/RiderVehicleDetails.jsx";
import RiderPendingApproval from "./pages/RiderPendingApproval.jsx";
import RiderDashboard from "./pages/RiderDashboard.jsx";
import RiderConfirmPickup from "./pages/RiderConfirmPickup.jsx";
import RiderLaundryDropoff from "./pages/RiderLaundryDropoff.jsx";
import RiderConfirmDelivery from "./pages/RiderConfirmDelivery.jsx";
import RiderProfile from "./pages/RiderProfile.jsx";
import RiderEarnings from "./pages/RiderEarnings.jsx";
import RiderTabBar from "./components/RiderTabBar";

function App() {
  return (
    <div className="App">
      <ToastContainer />
      <Routes>
        {/* ── Public site ── */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/services" element={<OurServices />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/download" element={<Lumelaundrysplash />} />

         {/* ── Admin Pages ── */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute>
              <AdminLayout title="Dashboard">
                <AdminDashboard />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <AdminProtectedRoute>
              <AdminLayout title="Orders">
                <AdminOrders />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/orders/:id"
          element={
            <AdminProtectedRoute>
              <AdminLayout title="Order Details">
                <AdminOrderDetail />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminProtectedRoute>
              <AdminLayout title="Users">
                <AdminUsers />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/users/:id"
          element={
            <AdminProtectedRoute>
              <AdminLayout title="User Details">
                <AdminUserDetail />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/riders"
          element={
            <AdminProtectedRoute>
              <AdminLayout title="Riders">
                <AdminRiders />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/riders/:id"
          element={
            <AdminProtectedRoute>
              <AdminLayout title="Rider Details">
                <AdminRiderDetail />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <AdminProtectedRoute>
              <AdminLayout title="Payments">
                <AdminPayments />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/reviews"
          element={
            <AdminProtectedRoute>
              <AdminLayout title="Reviews">
                <AdminReviews />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/services"
          element={
            <AdminProtectedRoute>
              <AdminLayout title="Services">
                <AdminServices />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <AdminProtectedRoute>
              <AdminLayout title="Notifications">
                <AdminNotifications />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <AdminProtectedRoute>
              <AdminLayout title="Settings">
                <AdminSettings />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <AdminProtectedRoute>
              <AdminLayout title="Reports & Analytics">
                <AdminReports />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />


        {/* ── App / auth ── */}
        <Route path="/app" element={<Lumelaundrysplash />} />
        <Route path="/customer-login" element={<Started />} />
        <Route path="/rider-started" element={<RiderStarted />} />
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
        <Route path="/rider/vehicle-details" element={<RiderVehicleDetails />} />
        <Route path="/rider/pending-approval" element={<RiderPendingApproval />} />
        <Route path="/rider/dashboard" element={<RiderDashboard />} />
        <Route path="/rider/confirm-pickup/:id" element={<RiderConfirmPickup />} />
        <Route path="/rider/laundry-dropoff/:id" element={<RiderLaundryDropoff />} />
        <Route path="/rider/confirm-delivery/:id" element={<RiderConfirmDelivery />} />
        <Route path="/rider/profile" element={<RiderProfile />} />
        <Route path="/rider/earnings" element={<RiderEarnings />} />
      </Routes>
    </div>
  );
}

export default App;