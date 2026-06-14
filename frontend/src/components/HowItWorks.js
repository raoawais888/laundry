import React from "react";

const steps = [
  {
    number: "01",
    icon: "bi-phone",
    title: "App & Book",
    desc: "Select your service & pick up window",
  },
  {
    number: "02",
    icon: "bi-truck",
    title: "Pickup & Process",
    desc: "Our agents collect and care for your items",
  },
  {
    number: "03",
    icon: "bi-layers",
    title: "Relax & Return",
    desc: "Fresh clothes delivered to you door",
  },
];

export default function HowItWorks() {
  return (
    <section className="how-it-works-section">
      <div className="container">
        <h2 className="section-title text-center mb-5">How it Works</h2>
        <div className="row justify-content-center align-items-start text-center">
          {steps.map((step, idx) => (
            <React.Fragment key={step.number}>
              <div className="col-12 col-md-3 step-col">
                <div className="step-number">{step.number}</div>
                <div className="step-icon">
                  <i className={`bi ${step.icon}`}></i>
                </div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.desc}</p>
              </div>
              {idx < steps.length - 1 && (
                <div className="col-2 d-none d-md-flex step-connector">
                  <span className="connector-line"></span>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
