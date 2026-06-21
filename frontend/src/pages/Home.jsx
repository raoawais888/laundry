import React from 'react'
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Pricing from '../components/Pricing';
import HowItWorks from '../components/HowItWorks';
import WhyApproach from '../components/WhyApproach';
import WhyDifferent from '../components/WhyDifferent';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <div>
         <Navbar />
      <Hero />
      <Pricing />
      <HowItWorks />
      <WhyApproach />
      <WhyDifferent />
      <Footer />
    </div>
  )
}

export default Home
