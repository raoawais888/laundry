import { useState } from "react";
import { uid } from "./Constants.js";
import HomeScreen from "./screens/Homescreen";
import CreateOrderScreen from "./screens/Createorderscreen";
import BookingConfirmedScreen from "./screens/Bookingconfirmedscreen";
import LiveTrackingScreen from "./screens/Livetrackingscreen";
import RatingScreen from "./screens/Ratingscreen";
import WalletScreen from "./screens/Walletscreen";
import { OrdersScreen, SupportScreen, ProfileScreen } from "./screens/Placeholderscreens";

/* ────────────────────────────────────────────────────────────
   ROOT APP
──────────────────────────────────────────────────────────── */

export default function LaundryApp() {
  const [screen, setScreen] = useState("home");
  const [order, setOrder] = useState(null);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [user] = useState({ name: "Sarah Kent", email: "sarah.kent12@gmail.com" });
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: uid(),
      type: "paypal",
      detail: "sarah.kent12@gmail.com",
      sub: "Added on 12/05/2026",
    },
    {
      id: uid(),
      type: "card",
      brand: "Visa Electron",
      detail: ".... .... .... 0987",
      sub: "Expiry Date 12/05/2026",
    },
  ]);

  function navigate(key) {
    if (key === "create-order") setSelectedServiceId(null);
    setScreen(key);
  }

  function handleSelectService(id) {
    setSelectedServiceId(id);
    setScreen("create-order");
  }

  function handleConfirmOrder(newOrder) {
    setOrder(newOrder);
    setScreen("booking-confirmed");
  }

  function handleLogout() {
    setScreen("home");
  }

  switch (screen) {
    case "home":
      return (
        <HomeScreen
          user={user}
          onLogout={handleLogout}
          onNavigate={navigate}
          onSelectService={handleSelectService}
        />
      );
    case "create-order":
      return (
        <CreateOrderScreen
          initialServiceId={selectedServiceId}
          onNavigate={navigate}
          onBack={() => navigate("home")}
          onConfirmOrder={handleConfirmOrder}
        />
      );
    case "booking-confirmed":
      return <BookingConfirmedScreen order={order} onNavigate={navigate} />;
    case "tracking":
      return <LiveTrackingScreen order={order} onNavigate={navigate} />;
    case "rating":
      return <RatingScreen onNavigate={navigate} />;
    case "wallet":
      return (
        <WalletScreen
          user={user}
          onLogout={handleLogout}
          onNavigate={navigate}
          paymentMethods={paymentMethods}
          setPaymentMethods={setPaymentMethods}
        />
      );
    case "orders":
      return <OrdersScreen order={order} onNavigate={navigate} />;
    case "support":
      return <SupportScreen onNavigate={navigate} />;
    case "profile":
      return <ProfileScreen user={user} onNavigate={navigate} onLogout={handleLogout} />;
    default:
      return (
        <HomeScreen
          user={user}
          onLogout={handleLogout}
          onNavigate={navigate}
          onSelectService={handleSelectService}
        />
      );
  }
}