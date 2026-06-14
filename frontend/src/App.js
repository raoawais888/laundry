import React from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Pricing from "./components/Pricing";
import HowItWorks from "./components/HowItWorks";
import WhyApproach from "./components/WhyApproach";
import WhyDifferent from "./components/WhyDifferent";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="App">
      <Navbar />
      <Hero />
      <Pricing />
      <HowItWorks />
      <WhyApproach />
      <WhyDifferent />
      <Footer />
    </div>
  );
}

export default App;
