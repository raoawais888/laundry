import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const OurServices = () => {
  const services = [
    {
      title: 'Wash',
      img: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=500&q=80',
      intro: 'Enjoy fresh, professionally cleaned laundry with zero hassle. Our washing service is tailored to suit your fabric care needs:',
      bullets: [
        { bold: 'Cold Water Wash', text: ': A gentle, energy-efficient option that helps preserve fabric quality and extend the life of your clothes.' },
        { bold: 'Hot Water Wash:', text: ' Available on request for garments that require a deeper, more intensive clean.' },
      ],
      outro: 'We use premium-quality detergents and fabric softeners to leave your laundry fresh-smelling, soft, and perfectly clean.',
    },
    {
      title: 'Dry',
      img: 'https://images.unsplash.com/photo-1489274495757-95c7c837b101?auto=format&fit=crop&w=500&q=80',
      intro: 'Select the drying option that best suits your garments and preferences:',
      bullets: [
        { bold: 'Tumble Dry:', text: ' A quick and efficient drying method suitable for everyday fabrics.' },
        { bold: 'Hang Dry:', text: ' A gentle alternative for delicate clothing, helping reduce shrinkage and maintain fabric quality.' },
      ],
      outro: 'We use premium-quality detergents and fabric softeners to leave your laundry fresh-smelling, soft, and perfectly clean.',
    },
    {
      title: 'Ironing',
      img: 'https://images.unsplash.com/photo-1521656693074-0ef32e80a5d5?auto=format&fit=crop&w=500&q=80',
      intro: 'Enjoy crisp, wrinkle-free clothing with our professional ironing service. We carefully press each garment to give it a clean, polished, and refined look. From office wear and formal outfits to casual everyday clothing, every item is handled with attention and care to ensure a perfectly finished appearance.',
      bullets: [],
      outro: '',
    },
    {
      title: 'Fold',
      img: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=500&q=80',
      intro: 'Skip the hassle of sorting and folding laundry yourself. Our folding service keeps every item neatly arranged and carefully organized. Your clothes are returned in a clean laundry bag, ready for easy storage or immediate use.',
      bullets: [],
      outro: '',
    },
  ];

  return (
    <>
      <Navbar />
      <style>{`
        .svc-wrap {
          font-family: 'Poppins', 'Segoe UI', sans-serif;
          background: #fff;
          color: #1a2340;
          padding: 40px 5% 80px;
          max-width: 1400px;
          margin: 0 auto;
        }
        .svc-title {
          text-align: center;
          font-size: 3.6rem;
          font-weight: 700;
          color: #2c2c2c;
          margin: 30px 0 55px;
          letter-spacing: -1px;
        }
        .svc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
        .svc-card {
          display: grid;
          grid-template-columns: 215px 1fr;
          background: #fff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 8px 26px rgba(0,0,0,.08);
          min-height: 270px;
        }
        .svc-img {
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          min-height: 220px;
        }
        .svc-body { padding: 28px 30px; }
        .svc-body h3 { text-align: center; font-size: 1.4rem; font-weight: 700; color: #1a2340; margin: 0 0 16px; }
        .svc-body p { font-size: .95rem; color: #3a3a3a; line-height: 1.55; margin: 0 0 14px; }
        .svc-body p:last-child { margin-bottom: 0; }
        .svc-body ul { margin: 0 0 14px; padding-left: 20px; }
        .svc-body li { font-size: .95rem; color: #3a3a3a; line-height: 1.55; margin-bottom: 8px; }
        .svc-body strong { color: #1a2340; }

        @media (max-width: 992px) {
          .svc-grid { grid-template-columns: 1fr; }
          .svc-title { font-size: 2.8rem; }
        }
        @media (max-width: 640px) {
          .svc-title { font-size: 2.2rem; margin: 20px 0 40px; }
          .svc-card { grid-template-columns: 1fr; }
          .svc-img { min-height: 200px; }
        }
      `}</style>

      <section className="svc-wrap">
        <h1 className="svc-title">Our Services</h1>
        <div className="svc-grid">
          {services.map((s, i) => (
            <div key={i} className="svc-card">
              <div className="svc-img" style={{ backgroundImage: `linear-gradient(180deg, rgba(30,40,70,.15), rgba(30,40,70,.15)), url('${s.img}')` }} />
              <div className="svc-body">
                <h3>{s.title}</h3>
                <p>{s.intro}</p>
                {s.bullets.length > 0 && (
                  <ul>
                    {s.bullets.map((b, bi) => (
                      <li key={bi}><strong>{b.bold}</strong>{b.text}</li>
                    ))}
                  </ul>
                )}
                {s.outro && <p>{s.outro}</p>}
              </div>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </>
  );
};

export default OurServices;