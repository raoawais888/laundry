import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Contact = () => {
  const cards = [
    {
      label: 'Email:',
      value: 'info@lumelaundry.com',
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
      ),
    },
    {
      label: 'Phone Number:',
      value: '(+61) 456789012',
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      ),
    },
    {
      label: 'Address:',
      value: '10 Somerdale Avenue ,Wyndham vale, Victoria, Autralia',
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <Navbar />
      <style>{`
        .ct-wrap {
          font-family: 'Poppins', 'Segoe UI', sans-serif;
          background: #fff;
          color: #1a2340;
          padding: 40px 5% 120px;
          max-width: 1400px;
          margin: 0 auto;
        }
        .ct-title {
          text-align: center;
          font-size: 3.6rem;
          font-weight: 700;
          color: #2c2c2c;
          margin: 30px 0 70px;
          letter-spacing: -1px;
        }
        .ct-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; }
        .ct-card {
          position: relative;
          background: #fff;
          border-radius: 16px;
          border: 1px solid #eef0f4;
          box-shadow: 0 8px 26px rgba(0,0,0,.08);
          padding: 55px 34px 40px;
          margin-top: 30px;
        }
        .ct-icon {
          position: absolute;
          top: -30px; left: 34px;
          width: 62px; height: 62px;
          border-radius: 50%;
          background: #1e2a78;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 16px rgba(30,42,120,.35);
        }
        .ct-card h3 { font-size: 1.4rem; font-weight: 700; color: #111; margin: 0 0 18px; }
        .ct-card p { font-size: 1rem; color: #2b3ed6; font-weight: 500; margin: 0; word-break: break-word; }

        @media (max-width: 992px) {
          .ct-grid { grid-template-columns: 1fr; gap: 55px; }
          .ct-title { font-size: 2.8rem; }
        }
        @media (max-width: 640px) {
          .ct-title { font-size: 2.2rem; margin: 20px 0 50px; }
        }
      `}</style>

      <section className="ct-wrap">
        <h1 className="ct-title">Contact Us</h1>
        <div className="ct-grid">
          {cards.map((c, i) => (
            <div key={i} className="ct-card">
              <div className="ct-icon">{c.icon}</div>
              <h3>{c.label}</h3>
              <p>{c.value}</p>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Contact;