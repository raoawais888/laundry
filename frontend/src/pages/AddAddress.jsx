import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addAddress } from "../api";
import { toast } from "react-toastify";

const AU_STATES = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];

const emptyForm = {
  unitNumber: "",
  streetAddress: "",
  suburb: "",
  state: "",
  postcode: "",
  deliveryInstruction: "",
  gpsLocation: "",
};

const AddAddress = ({ user, onSaved }) => {
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      toast.error("Location services aren't available on this device.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setForm((prev) => ({
          ...prev,
          gpsLocation: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
        }));
        setLocating(false);
      },
      () => {
        toast.error("Could not get your location. Please enable location access.");
        setLocating(false);
      }
    );
  };

  const validate = () => {
    if (!form.unitNumber.trim()) {
      toast.error("Please enter your unit number.");
      return false;
    }
    if (!form.streetAddress.trim()) {
      toast.error("Please enter your street address.");
      return false;
    }
    if (!form.suburb.trim()) {
      toast.error("Please enter your suburb.");
      return false;
    }
    if (!form.state) {
      toast.error("Please select a state.");
      return false;
    }
    if (!form.postcode.trim()) {
      toast.error("Please enter your postcode.");
      return false;
    }
    return true;
  };

  const submitAddress = async () => {
    const payload = {
      unitNumber: form.unitNumber.trim(),
      streetAddress: form.streetAddress.trim(),
      suburb: form.suburb.trim(),
      state: form.state,
      postcode: form.postcode.trim(),
      deliveryInstruction: form.deliveryInstruction.trim(),
      gpsLocation: form.gpsLocation.trim(),
    };

    const { data } = await addAddress(payload);
    return data;
  };

  const handleSaveAddress = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      const data = await submitAddress();

      toast.success(data?.message || "Address saved successfully.");

      if (onSaved) {
        onSaved(data);
      } else {
        navigate("/user-home");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error?.message || "Could not save address."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddAnother = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      const data = await submitAddress();

      toast.success(data?.message || "Address saved. Add another below.");
      setForm(emptyForm);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error?.message || "Could not save address."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="addr-screen">
      <div className="addr-card">

        {/* ── Header ── */}
        <div className="addr-header">
          <div className="addr-header-row">
            <div>
              <p className="addr-welcome-label">Welcome</p>
              <p className="addr-welcome-name">{user?.name || "Sarah Kent"}</p>
            </div>
            <div className="addr-header-icons">
              <button className="addr-icon-btn" aria-label="Log out">
                <i className="ti ti-logout" />
              </button>
              <button className="addr-icon-btn" aria-label="Notifications">
                <i className="ti ti-bell" />
              </button>
              <button className="addr-icon-btn addr-icon-btn--avatar" aria-label="Account">
                <i className="ti ti-user" />
              </button>
            </div>
          </div>
          <p className="addr-page-title">Add Address</p>
        </div>

        {/* ── Form ── */}
        <div className="addr-body">
          <label className="addr-label">Unit Numer</label>
          <input
            className="addr-input"
            type="text"
            placeholder="Enter Unit Number"
            value={form.unitNumber}
            onChange={handleChange("unitNumber")}
            disabled={loading}
          />

          <label className="addr-label">Street Address</label>
          <input
            className="addr-input"
            type="text"
            placeholder="Enter Street Address"
            value={form.streetAddress}
            onChange={handleChange("streetAddress")}
            disabled={loading}
          />

          <label className="addr-label">Suburb</label>
          <input
            className="addr-input"
            type="text"
            placeholder="Enter Suburb"
            value={form.suburb}
            onChange={handleChange("suburb")}
            disabled={loading}
          />

          <label className="addr-label">State</label>
          <div className="addr-select-wrap">
            <select
              className="addr-select"
              value={form.state}
              onChange={handleChange("state")}
              disabled={loading}
            >
              <option value="" disabled hidden>
                Select State
              </option>
              {AU_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <i className="ti ti-chevron-down addr-select-chevron" />
          </div>

          <label className="addr-label">Postcode</label>
          <input
            className="addr-input"
            type="text"
            inputMode="numeric"
            placeholder="Enter Postcode"
            value={form.postcode}
            onChange={handleChange("postcode")}
            disabled={loading}
          />

          <label className="addr-label">Delivery Instruction</label>
          <textarea
            className="addr-textarea"
            placeholder="Write delivery Instruction if any"
            value={form.deliveryInstruction}
            onChange={handleChange("deliveryInstruction")}
            disabled={loading}
          />

          <label className="addr-label">GPS Pin Location</label>
          <div className="addr-gps-wrap">
            <i className="ti ti-map-pin addr-gps-icon" />
            <input
              className="addr-input addr-input--gps"
              type="text"
              placeholder="GPS Pin Location"
              value={form.gpsLocation}
              onChange={handleChange("gpsLocation")}
              disabled={loading}
            />
            <button
              type="button"
              className="addr-gps-btn"
              onClick={handleUseGps}
              disabled={loading || locating}
              aria-label="Use current location"
            >
              {locating ? "..." : "Use"}
            </button>
          </div>

          {/* ── Bottom action ── */}
          <button
            className="addr-save-btn"
            onClick={handleSaveAddress}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Address"}
          </button>

          <div className="addr-add-another-wrap">
            <a
              href="#"
              className="addr-add-another"
              onClick={(e) => {
                e.preventDefault();
                if (!loading) handleAddAnother();
              }}
            >
              Add Another Address
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAddress;