import React from "react";

export default function Hero() {
  return (
    <section id="home" className="hero-section">
      <div className="container">
        <div className="row align-items-center gy-5">
          <div className="col-lg-6">
            <h1 className="hero-heading">
              Your Weekends
              <br />
              weren&apos;t made
              <br />
              for laundry.
            </h1>
            <p className="hero-sub">
              The aesthetic way to get fresh clothes, at your door.
            </p>
            <div className="d-flex flex-wrap gap-3 mt-4">
              <a href="#download" className="btn btn-store-dark rounded-pill px-4 py-2">
                Get the App (App Store)
              </a>
              <a href="#download" className="btn btn-store-teal rounded-pill px-4 py-2">
                Get the App (Play Store)
              </a>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="hero-art-wrap">
              <HeroArt />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroArt() {
  return (
    <svg
      viewBox="0 0 600 520"
      xmlns="http://www.w3.org/2000/svg"
      className="hero-art-svg"
      role="img"
      aria-label="Illustration of a phone showing the Lume Laundry app, surrounded by abstract blue and purple blobs"
    >
      <defs>
        <linearGradient id="blobBlue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7fb6e8" />
          <stop offset="100%" stopColor="#3a5fcb" />
        </linearGradient>
        <linearGradient id="blobPurple" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6a4ee0" />
          <stop offset="100%" stopColor="#3122a8" />
        </linearGradient>
        <radialGradient id="smallSphere" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#9cc4ee" />
          <stop offset="100%" stopColor="#4f7cd6" />
        </radialGradient>
        <radialGradient id="dotSphere" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#8fb6f5" />
          <stop offset="100%" stopColor="#4a6fe0" />
        </radialGradient>
        <linearGradient id="shadowFade" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#c9d3e6" stopOpacity="0" />
          <stop offset="50%" stopColor="#c9d3e6" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#c9d3e6" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Background blobs */}
      <ellipse cx="250" cy="240" rx="190" ry="170" fill="url(#blobBlue)" opacity="0.9" />
      <ellipse cx="430" cy="290" rx="160" ry="180" fill="url(#blobPurple)" opacity="0.9" />
      <circle cx="135" cy="265" r="32" fill="url(#smallSphere)" />
      <circle cx="468" cy="78" r="14" fill="url(#dotSphere)" />

      {/* Shadow ellipse under phone */}
      <ellipse cx="345" cy="475" rx="150" ry="14" fill="url(#shadowFade)" />

      {/* Phone body - rotated */}
      <g transform="rotate(12 320 280)">
        <rect
          x="225"
          y="90"
          width="190"
          height="380"
          rx="34"
          fill="#1c2540"
          stroke="#0e1428"
          strokeWidth="2"
        />
        <rect
          x="237"
          y="104"
          width="166"
          height="352"
          rx="22"
          fill="#ffffff"
        />
        {/* Speaker / camera notch */}
        <rect x="298" y="112" width="44" height="8" rx="4" fill="#1c2540" />
        <circle cx="357" cy="116" r="4" fill="#1c2540" />

        {/* Logo on screen */}
        <text
          x="320"
          y="265"
          fontFamily="Pacifico, cursive"
          fontSize="34"
          fill="#3a55c9"
          textAnchor="middle"
        >
          Lume
        </text>
        <text
          x="320"
          y="305"
          fontFamily="Pacifico, cursive"
          fontSize="30"
          fill="#1c2540"
          textAnchor="middle"
        >
          La
          <tspan fill="#3a55c9">u</tspan>ndry
        </text>
        <rect x="288" y="282" width="20" height="16" rx="2" fill="#1c2540" />
        <rect x="291" y="285" width="14" height="10" rx="1" fill="#ffffff" />
      </g>
    </svg>
  );
}
