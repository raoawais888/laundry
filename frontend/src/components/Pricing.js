import React from "react";

const pricingTiers = [
  { expressLabel: "1kg – 14 kg Express = $38", superLabel: "1kg – 14kg Super = $40" },
  { expressLabel: "15kg – 18kg Express = $40", superLabel: "15kg – 18kg Super = $43" },
  { expressLabel: "19kg – 27kg Express = $46", superLabel: "19kg – 27kg Super = $50" },
  { expressLabel: "28kg – 40kg Express = $52", superLabel: "28kg – 40kg Super = $57" },
];

function PriceCard({ title }) {
  return (
    <div className="col-md-4">
      <div className="price-card">
        <div className="price-card-header">{title}</div>
        <div className="price-card-body">
          {pricingTiers.map((tier, idx) => (
            <div className="price-row" key={idx}>
              <span>{tier.expressLabel}</span>
              <span className="price-divider">|</span>
              <span>{tier.superLabel}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Pricing() {
  return (
    <section className="pricing-section">
      <div className="container">
        <h2 className="section-title text-white text-center mb-5">Pricing</h2>
        <div className="row g-4">
          <PriceCard title="Wash Cost" />
          <PriceCard title="Dry Cost" />
          <PriceCard title="Ironing Cost" />
        </div>
      </div>
    </section>
  );
}
