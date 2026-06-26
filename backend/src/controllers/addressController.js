// controllers/addressController.js
const Address = require("../models/Address");

// POST /api/addresses
exports.addAddress = async (req, res) => {
  try {
    const {
      unitNumber, streetAddress, suburb, state,
      postcode, deliveryInstruction, gpsLocation
    } = req.body;

    // Parse "lat, lng" string → GeoJSON { type: "Point", coordinates: [lng, lat] }
    let parsedGpsLocation;
    if (gpsLocation) {
      const [lat, lng] = gpsLocation.split(',').map(v => parseFloat(v.trim()));

      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({ message: "Invalid gpsLocation format. Expected 'lat, lng'" });
      }

      parsedGpsLocation = {
        type: 'Point',
        coordinates: [lng, lat], // GeoJSON is [lng, lat] — NOT [lat, lng]
      };
    }

    const existing = await Address.countDocuments({ user: req.user.id, isDeleted: false });

    const address = await Address.create({
      user: req.user.id,
      unitNumber, streetAddress, suburb,
      state, postcode, deliveryInstruction,
      gpsLocation: parsedGpsLocation,
      isDefault: existing === 0,
    });

    res.status(201).json({ message: "Address saved", address });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/addresses
exports.getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user.id, isDeleted: false });
    res.json(addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/addresses/:id/default
exports.setDefault = async (req, res) => {
  try {
    await Address.updateMany({ user: req.user.id }, { isDefault: false });
    await Address.findByIdAndUpdate(req.params.id, { isDefault: true });
    res.json({ message: "Default address updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/addresses/:id
exports.deleteAddress = async (req, res) => {
  try {
    await Address.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isDeleted: true }
    );
    res.json({ message: "Address removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};