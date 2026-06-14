import React from "react";

const points = [
  "Driver - curated service for your lifestyle.",
  "Eco-Friendly precise temperature cycles.",
  "Delicate & specialized fabric handling.",
  "All items expertly folded & presented.",
];

export default function WhyApproach() {
  return (
    <section className="why-approach-section">
      <div className="container">
        <div className="row align-items-center gy-4">
          <div className="col-lg-5">
            <h2 className="why-heading text-white">
              Why Our Approach
              <br />
              Is Better
            </h2>
            <ul className="why-list text-white mt-4">
              {points.map((point, idx) => (
                <li key={idx}>{point}</li>
              ))}
            </ul>
          </div>

          <div className="col-lg-7">
            <div className="approach-grid">
              <div className="approach-grid-left">
                <img
                  src="https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=900&q=80"
                  alt="Row of commercial laundromat washing machines"
                  className="approach-img img-tall"
                />
              </div>
              <div className="approach-grid-right">
                <img
                  src="https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=700&q=80"
                  alt="Hands handling eco-friendly laundry detergent bottles"
                  className="approach-img img-top"
                />
                <img
                  src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=700&q=80"
                  alt="Person holding a neatly folded stack of towels"
                  className="approach-img img-bottom"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
