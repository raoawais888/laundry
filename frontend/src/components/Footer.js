import React from "react";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="row gy-4">
          <div className="col-lg-3 col-md-6">
            <div className="footer-logo logo-font">
              <span className="logo-top d-block">Lume</span>
              <span className="logo-bottom">
                La
                <i className="bi bi-handbag-fill logo-icon"></i>
                ndry
              </span>
            </div>
            <p className="footer-tagline mt-3">Caring for you garments is our art</p>
            <p className="footer-phone">
              <i className="bi bi-telephone-fill me-2"></i>
              (+61) 0475104657
            </p>
          </div>

          <div className="col-lg-3 col-md-6">
            <h4 className="footer-heading">Useful Links</h4>
            <ul className="footer-links">
              <li><a href="#about">About Us</a></li>
              <li><a href="#services">Services</a></li>
              <li><a href="#contact">Contact Us</a></li>
              <li><a href="#privacy">Privacy Policies</a></li>
              <li><a href="#terms">Terms &amp; Conditions</a></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h4 className="footer-heading">Head Office</h4>
            <p className="footer-address">
              10 Somerdale Avenue, Wyndham vale
              <br />
              Victoria, Australia
            </p>
          </div>

          <div className="col-lg-3 col-md-6">
            <h4 className="footer-heading">Download App</h4>
            <div className="d-flex flex-wrap gap-2 mt-3">
              <a href="#download" className="btn btn-store-dark rounded-pill px-3 py-2 btn-sm">
                Get the App (App Store)
              </a>
              <a href="#download" className="btn btn-store-teal rounded-pill px-3 py-2 btn-sm">
                Get the App (Play Store)
              </a>
            </div>
          </div>
        </div>

        <hr className="footer-divider" />

        <div className="footer-bottom text-center">
          <i className="bi bi-c-circle me-2"></i>
          Copyright 2026 by Lume Laundry. All Right Reserved.
        </div>
      </div>
    </footer>
  );
}
