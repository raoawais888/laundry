import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AboutUs = () => {
  const missionCards = [
    {
      num: '1.',
      label: 'Artisan Precision',
      icon: (
        <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 14h18l-2-4a3 3 0 0 0-2.7-1.7H10a4 4 0 0 0-3.6 2.2L5 14" />
          <path d="M3 14v2a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-2" />
          <circle cx="16.5" cy="11" r="0.8" fill="currentColor" />
        </svg>
      ),
    },
    {
      num: '2.',
      label: 'Curated Fabric',
      icon: (
        <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="4" width="16" height="16" rx="4" />
          <path d="M5 15h9a3 3 0 0 0 0-6" />
        </svg>
      ),
    },
    {
      num: '3.',
      label: 'Purest Care',
      icon: (
        <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <Navbar />
      <style>{`
        .about-wrap {
          font-family: 'Poppins', 'Segoe UI', sans-serif;
          background: #fff;
          color: #1a2340;
          padding: 40px 5% 80px;
          max-width: 1400px;
          margin: 0 auto;
        }
        .about-title {
          text-align: center;
          font-size: 3.6rem;
          font-weight: 700;
          color: #2c2c2c;
          margin: 30px 0 55px;
          letter-spacing: -1px;
        }
        .about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 55px;
          align-items: start;
        }
        .about-hero {
          position: relative;
          border-radius: 18px;
          overflow: hidden;
          min-height: 640px;
          background: linear-gradient(180deg, rgba(30,40,70,.35), rgba(30,40,70,.35)),
            url('https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=900&q=80') center/cover no-repeat;
        }
        .about-hero-card {
          position: absolute;
          top: 40px; left: 40px; right: 55px;
          background: #fff;
          border-radius: 16px;
          padding: 32px 34px;
          box-shadow: 0 10px 30px rgba(0,0,0,.15);
        }
        .about-hero-card h2 { font-size: 1.75rem; font-weight: 700; color: #1a2340; line-height: 1.25; margin: 0 0 16px; }
        .about-hero-card p { font-size: 1.05rem; color: #2c2c2c; line-height: 1.55; margin: 0; }
        .about-legacy {
          display: grid;
          grid-template-columns: 1fr 200px;
          gap: 30px;
          align-items: start;
          margin-bottom: 55px;
        }
        .about-h3 { font-size: 1.7rem; font-weight: 700; color: #1a2340; margin: 0 0 16px; }
        .about-legacy p { font-size: 1rem; color: #3a3a3a; line-height: 1.6; margin: 0; }
        .about-legacy img { width: 100%; height: 150px; object-fit: cover; border-radius: 12px; }
        .about-founders {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 55px;
        }
        .about-founder { display: flex; gap: 16px; align-items: flex-start; }
        .about-founder img { width: 75px; height: 90px; object-fit: cover; border-radius: 10px; flex-shrink: 0; }
        .about-founder h4 { font-size: 1.05rem; font-weight: 600; color: #1a2340; margin: 0 0 6px; }
        .about-founder p { font-size: .85rem; color: #4a4a4a; line-height: 1.45; margin: 0; }
        .about-mission { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .about-mission-card {
          background: #bfe0ee;
          border-radius: 14px;
          padding: 26px 20px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          color: #1a2340;
        }
        .about-mission-card p { font-size: .95rem; font-weight: 500; margin: 0; }

        @media (max-width: 992px) {
          .about-grid { grid-template-columns: 1fr; gap: 40px; }
          .about-hero { min-height: 460px; }
          .about-title { font-size: 2.8rem; }
        }
        @media (max-width: 640px) {
          .about-title { font-size: 2.2rem; margin: 20px 0 40px; }
          .about-hero { min-height: 380px; }
          .about-hero-card { top: 24px; left: 20px; right: 20px; padding: 24px 22px; }
          .about-legacy { grid-template-columns: 1fr; }
          .about-legacy img { height: 200px; }
          .about-founders { grid-template-columns: 1fr; }
          .about-mission { grid-template-columns: 1fr; }
        }
      `}</style>

      <section className="about-wrap">
        <h1 className="about-title">The Lume Story</h1>

        <div className="about-grid">
          <div className="about-hero">
            <div className="about-hero-card">
              <h2>More than a Service .<br />It's an Art</h2>
              <p>We believe every garment deserves a story. Crafted with Australian care, refined for the modern life.</p>
            </div>
          </div>

          <div>
            <div className="about-legacy">
              <div>
                <h3 className="about-h3">A Legacy of Fabric Care</h3>
                <p>Since its humble beginnings, we have passion for quality of fabric care to quality thoushing come to read our ambent andowa cover and professive care lactions.</p>
              </div>
              <img
                src="https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=400&q=80"
                alt="Fabric care"
              />
            </div>

            <h3 className="about-h3" style={{ marginBottom: '26px' }}>Meet Our Founders</h3>
            <div className="about-founders">
              {[
                { img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', text: 'Co - Founder of Lume Laundry has great vision and thought to serve people by providing unique & great services.' },
                { img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80', text: 'Co - Founder of Lume Laundry owing best laundry setup' },
              ].map((f, i) => (
                <div key={i} className="about-founder">
                  <img src={f.img} alt="Frank Anderson" />
                  <div>
                    <h4>Frank Anderson</h4>
                    <p>{f.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="about-h3" style={{ lineHeight: 1.3, marginBottom: '28px' }}>
              Our Mission:<br />Care, Clean &amp; Connect
            </h3>
            <div className="about-mission">
              {missionCards.map((card, i) => (
                <div key={i} className="about-mission-card">
                  <div style={{ marginBottom: '22px' }}>{card.icon}</div>
                  <p>{card.num} {card.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default AboutUs;