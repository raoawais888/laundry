// One-off seed script for the minimal service catalog.
// Run manually: node src/scripts/seedServices.js
require("dotenv").config();
const mongoose = require("mongoose");
const Service = require("../models/Service");

const SERVICES = [
  { name: "Wash & Fold", slug: "wash_fold", unit: "per_kg", unitPrice: 4.0, description: "Everyday laundry, washed and neatly folded." },
  { name: "Dry Cleaning", slug: "dry_cleaning", unit: "per_kg", unitPrice: 7.5, description: "Gentle care for delicate and premium fabrics." },
  { name: "Ironing", slug: "ironing", unit: "per_kg", unitPrice: 3.0, description: "Crisp, wrinkle-free finishing for your garments." },
  { name: "Express", slug: "express", unit: "per_kg", unitPrice: 9.0, description: "Same-day turnaround when you need it fast." },
  { name: "Blanket", slug: "blanket", unit: "per_kg", unitPrice: 6.0, description: "Bulky bedding, blankets and doonas cleaned with care." },
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB for seeding.");

  for (const svc of SERVICES) {
    await Service.findOneAndUpdate(
      { slug: svc.slug },
      { ...svc, isActive: true },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`Upserted service: ${svc.name}`);
  }

  console.log("Done seeding services.");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
