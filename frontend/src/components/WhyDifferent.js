import React from "react";

const cards = [
  {
    number: "01",
    icon: "bi-diagram-3",
    title: "Personalized Journey",
    desc: "Your bespoke care starts here. Detailed fabric profile & preference matching",
    variant: "card-light",
  },
  {
    number: "02",
    icon: "bi-bullseye",
    title: "Precision Service",
    desc: "Our artisan care. State-of the-art facilities, Certified handlers.",
    variant: "card-mid",
  },
  {
    number: "03",
    icon: "bi-calendar2-check",
    title: "Streamlined Return",
    desc: "Timely delivery. Items are neatly folded and ready for your wardrobe.",
    variant: "card-dark",
  },
];

export default function WhyDifferent() {
  return (
    <section className="why-different-section">
      <div className="container">
        <h2 className="section-title text-center mb-5">Why We Different</h2>
        <div className="row g-4">
          {cards.map((card) => (
            <div className="col-md-4" key={card.number}>
              <div className={`diff-card ${card.variant}`}>
                <div className="diff-card-top">
                  <span className="diff-number">{card.number}</span>
                  <i className={`bi ${card.icon} diff-icon`}></i>
                </div>
                <h3 className="diff-title">{card.title}</h3>
                <p className="diff-desc">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
