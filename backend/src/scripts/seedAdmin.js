require("dotenv").config();
const Admin = require("../models/Admin");
const connectDB = require("../config/db");

const seed = async () => {
  await connectDB();
  const email = "admin@lumelaundry.com";

  if (await Admin.findOne({ email })) {
    console.log("Admin already exists:", email);
    process.exit(0);
  }

  await Admin.create({
    name: "Super Admin",
    email,
    password: "Admin@123",
    role: "super_admin",   // ← underscore, matches enum
    isActive: true,
  });

  console.log("✅ Super admin created:", email, "/ Admin@123");
  process.exit(0);
};

seed().catch((e) => { console.error(e); process.exit(1); });