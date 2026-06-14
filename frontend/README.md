# Lume Laundry - Landing Page

A pixel-faithful recreation of the Lume Laundry landing page, built with React + Bootstrap 5.

## Tech Stack
- React 18 (Create React App)
- Bootstrap 5 (via npm)
- Bootstrap Icons
- Google Fonts: Poppins (body/headings) + Pacifico (logo script font)

## Project Structure
```
lume-laundry/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Navbar.js
│   │   ├── Hero.js
│   │   ├── Pricing.js
│   │   ├── HowItWorks.js
│   │   ├── WhyApproach.js
│   │   ├── WhyDifferent.js
│   │   └── Footer.js
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
└── package.json
```

## Setup & Run

```bash
npm install
npm start
```

Open http://localhost:3000

## Build for production

```bash
npm run build
```

## Sections Included
1. **Navbar** - Logo, nav links (Home, About Us, Our Services, Contact), Download App button
2. **Hero** - "Your Weekends weren't made for laundry" headline + SVG phone/blob illustration + store buttons
3. **Pricing** - Wash Cost, Dry Cost, Ironing Cost cards with weight-tier pricing table
4. **How it Works** - 3-step process (App & Book, Pickup & Process, Relax & Return)
5. **Why Our Approach Is Better** - Bullet list + image gallery (washing machines, detergents, folded towels)
6. **Why We Different** - 3 gradient cards (Personalized Journey, Precision Service, Streamlined Return)
7. **Footer** - Logo, useful links, head office address, download buttons, copyright

## Notes
- All colors, gradients, and spacing match the original design closely.
- The hero illustration is a custom inline SVG (phone + gradient blobs) to avoid external image dependencies.
- Gallery images in "Why Our Approach" use Unsplash URLs — replace with your own assets in `WhyApproach.js` if needed.
- Fully responsive (mobile, tablet, desktop) using Bootstrap grid + custom media queries.
