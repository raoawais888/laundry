import React from "react";
import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="navbar-wrap border-bottom bg-white sticky-top">
      <nav className="navbar navbar-expand-lg container py-2">
        <Link className="navbar-brand d-flex flex-column" to="/">
<img
  src="./logo.png"
  alt="DoorLaundry logo"
  style={{
    width: "100%",
    maxWidth: "273px",
    height: "auto",
    objectFit: "contain",
    display: "block",
  }}
/>          
        </Link>

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
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `nav-link fw-medium ${isActive ? "active-link" : "text-dark"}`
                }
              >
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `nav-link fw-medium ${isActive ? "active-link" : "text-dark"}`
                }
              >
                About Us
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/services"
                className={({ isActive }) =>
                  `nav-link fw-medium ${isActive ? "active-link" : "text-dark"}`
                }
              >
                Our Services
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `nav-link fw-medium ${isActive ? "active-link" : "text-dark"}`
                }
              >
                Contact
              </NavLink>
            </li>
          </ul>

          <div className="d-flex justify-content-center mt-3 mt-lg-0">
            <Link to="/download" className="btn btn-download rounded-pill px-4 py-2">
              Download App
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}