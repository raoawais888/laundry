import React from "react";

export default function Navbar() {
  return (
    <header className="navbar-wrap border-bottom bg-white sticky-top">
      <nav className="navbar navbar-expand-lg container py-2">
        <a className="navbar-brand d-flex flex-column" href="/">
          <span className="logo-font logo-top">Lume</span>
          <span className="logo-font logo-bottom">
            La
            <i className="bi bi-handbag-fill logo-icon"></i>
            ndry
          </span>
        </a>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          aria-controls="mainNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="mainNav">
          <ul className="navbar-nav mx-auto gap-lg-4 text-center">
            <li className="nav-item">
              <a className="nav-link active-link fw-medium" href="#home">
                Home
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link fw-medium text-dark" href="#about">
                About Us
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link fw-medium text-dark" href="#services">
                Our Services
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link fw-medium text-dark" href="#contact">
                Contact
              </a>
            </li>
          </ul>

          <div className="d-flex justify-content-center mt-3 mt-lg-0">
            <a href="#download" className="btn btn-download rounded-pill px-4 py-2">
              Download App
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
}
