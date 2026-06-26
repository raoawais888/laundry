import { useState, useRef } from "react";
import { SERVICES, PAYMENT_METHOD_MAP, uid } from "../Constants.js";
import { IconPin, IconCalendar } from "../../components/Icons";
import { Screen, BackHeader, BottomNav } from "../Layout";
import { styles } from "./Styles.js";
import { createOrder } from "../../api";
import { parseSlotString } from "../Parseslot.js";

export default function CreateOrderScreen({ onNavigate, onBack, onConfirmOrder, initialServiceId }) {
  const [serviceId, setServiceId] = useState(initialServiceId || "wash-fold");
  const [pickupAddress, setPickupAddress] = useState("42 Park St, Wyndham Vale");
  const [pickupSlot, setPickupSlot] = useState("Mon 23 Jun · 9:00–11:00 AM");
  const [pickupNotes, setPickupNotes] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("42 Park St, Wyndham Vale");
  const [deliverySlot, setDeliverySlot] = useState("Mon 23 Jun · 9:00–11:00 AM");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [weight, setWeight] = useState(8);
  const [bagsText, setBagsText] = useState("");
  const [fragile, setFragile] = useState(true);
  const [specialInstructions, setSpecialInstructions] = useState("");
  // photos: [{ file, previewUrl }] — file goes straight into the multipart
  // request on submit; previewUrl (a local blob URL) is only for the
  // on-screen thumbnail and is never sent anywhere.
  const [photos, setPhotos] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const fileInputRef = useRef(null);

  const service = SERVICES.find((s) => s.id === serviceId) || SERVICES[0];
  const washTotal = service.pricePerKg * weight;
  const deliveryCharge = 8;
  const estimatedTotal = washTotal + deliveryCharge;

  function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    const newPhotos = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setPhotos((prev) => [...prev, ...newPhotos].slice(0, 8));
  }

  function removePhoto(idx) {
    setPhotos((prev) => {
      const removed = prev[idx];
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((_, i) => i !== idx);
    });
  }

  async function handleConfirm() {
    setSubmitError("");
    setIsSubmitting(true);

    try {
      // Build the payload in the shape the backend's Order schema and
      // validateCreateOrder middleware expect. Photos are passed separately
      // to createOrder() — it decides JSON vs multipart based on whether
      // there are any, and (de)serializes nested fields accordingly.
      const payload = {
        pickupAddress: {
          fullAddress: pickupAddress,
          deliveryInstructions: pickupNotes || undefined,
        },
        deliveryAddress: {
          fullAddress: deliveryAddress,
          deliveryInstructions: deliveryNotes || undefined,
        },
        pickupSlot: parseSlotString(pickupSlot),
        deliverySlot: parseSlotString(deliverySlot),
        items: [
          {
            // NOTE: service.backendId is a placeholder ObjectId-shaped string
            // until a real Service collection is seeded — see Constants.js.
            service: service.backendId,
            serviceName: service.label,
            unit: "per_kg",
            unitPrice: service.pricePerKg,
            estimatedQty: weight,
          },
        ],
        estimatedWeight: weight,
        numberOfBags: parseBagsCount(bagsText),
        isFragile: fragile,
        specialInstructions: specialInstructions || undefined,
        isExpress: false,
        paymentMethod: PAYMENT_METHOD_MAP[paymentMethod] || "cash",
      };

      const photoFiles = photos.map((p) => p.file);
      const res = await createOrder(payload, photoFiles);
      const order = res.data.data.order;

      // Hand the real, server-created order up to the parent so it can
      // store it and navigate — same contract CreateOrderScreen already
      // had with onConfirmOrder, just backed by a real order now.
      onConfirmOrder(order);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Something went wrong placing your order. Please try again.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Screen>
      <BackHeader title="Create Order" onBack={onBack} />

      <div style={styles.body}>
        {/* Service Type */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Service Type</h3>
          <div style={styles.pillRow}>
            {SERVICES.map((s) => (
              <button
                key={s.id}
                style={serviceId === s.id ? styles.pillActive : styles.pill}
                onClick={() => setServiceId(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pickup Details */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Pickup Details</h3>
          <div style={styles.inputRow}>
            <IconPin />
            <input
              style={styles.inputField}
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              placeholder="Pickup address"
            />
          </div>
          <div style={styles.inputRow}>
            <IconCalendar />
            <input
              style={styles.inputField}
              value={pickupSlot}
              onChange={(e) => setPickupSlot(e.target.value)}
              placeholder="Pickup date & time"
            />
          </div>
          <textarea
            style={styles.textarea}
            placeholder="Pick notes any instrucion"
            value={pickupNotes}
            onChange={(e) => setPickupNotes(e.target.value)}
          />
        </div>

        {/* Delivery Details */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Delivery Details</h3>
          <div style={styles.inputRow}>
            <IconPin />
            <input
              style={styles.inputField}
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Delivery address"
            />
          </div>
          <div style={styles.inputRow}>
            <IconCalendar />
            <input
              style={styles.inputField}
              value={deliverySlot}
              onChange={(e) => setDeliverySlot(e.target.value)}
              placeholder="Delivery date & time"
            />
          </div>
          <textarea
            style={styles.textarea}
            placeholder="Delivery notes any instructions"
            value={deliveryNotes}
            onChange={(e) => setDeliveryNotes(e.target.value)}
          />
        </div>

        {/* Clothes */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Clothes</h3>
          <select
            style={styles.selectField}
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
          >
            <option value={4}>~ 4 Kg Estimated</option>
            <option value={6}>~ 6 Kg Estimated</option>
            <option value={8}>~ 8 Kg Estimated</option>
            <option value={10}>~ 10 Kg Estimated</option>
            <option value={12}>~ 12 Kg Estimated</option>
          </select>
          <input
            style={{ ...styles.inputField, ...styles.standaloneInput }}
            placeholder="Enter no of bags i.e 2 bags 4kg"
            value={bagsText}
            onChange={(e) => setBagsText(e.target.value)}
          />
          <button
            style={styles.toggleRow}
            onClick={() => setFragile((f) => !f)}
          >
            <span style={{ ...styles.toggleTrack, background: fragile ? "#2B35AF" : "#ccc" }}>
              <span style={{ ...styles.toggleThumb, left: fragile ? 18 : 2 }} />
            </span>
            <span style={styles.toggleLabel}>Fragile</span>
          </button>
          <textarea
            style={styles.textarea}
            placeholder="Write down any special Instructions if any"
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
          />
        </div>

        {/* Upload Photos */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Upload Photos</h3>
          <button style={styles.selectImagesBtn} onClick={() => fileInputRef.current?.click()}>
            Select Images
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: "none" }}
            onChange={handleFiles}
          />
          {photos.length > 0 && (
            <div style={styles.photoGrid}>
              {photos.map((photo, i) => (
                <div key={i} style={styles.photoThumbWrap}>
                  <img src={photo.previewUrl} alt={`upload-${i}`} style={styles.photoThumb} />
                  <button style={styles.photoRemoveBtn} onClick={() => removePhoto(i)} aria-label="Remove photo">
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Estimated Total */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Estimated Total</h3>
          <div style={styles.cardRow}>
            <span style={styles.cardLabel}>
              {service.label} - {weight}kg
            </span>
            <span style={styles.cardValue}>{washTotal}$</span>
          </div>
          <div style={styles.cardRow}>
            <span style={styles.cardLabel}>Delivery Charges</span>
            <span style={styles.cardValue}>{deliveryCharge}$</span>
          </div>
          <div style={{ ...styles.cardRow, borderBottom: "none" }}>
            <span style={styles.cardLabelBold}>Estimated Total</span>
            <span style={styles.cardAmount}>{estimatedTotal}$</span>
          </div>
        </div>

        {/* Payment Method */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Payment Method</h3>
          <div style={styles.pillRow}>
            <button
              style={paymentMethod === "cod" ? styles.pillActive : styles.pill}
              onClick={() => setPaymentMethod("cod")}
            >
              💵 Cash on Delivery
            </button>
            <button
              style={paymentMethod === "card" ? styles.pillActive : styles.pill}
              onClick={() => setPaymentMethod("card")}
            >
              💳 Card Payment
            </button>
          </div>
          <div style={styles.pillRow}>
            <button
              style={paymentMethod === "apple" ? styles.pillActive : styles.pill}
              onClick={() => setPaymentMethod("apple")}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ verticalAlign: "-2px", marginRight: 4 }}>
                <path d="M16.365 1.43c0 1.14-.42 2.07-1.26 2.79-.86.74-1.83 1.16-2.91 1.07-.04-1.1.42-2.07 1.26-2.86.86-.78 1.92-1.25 2.91-1.0Zm3.94 16.5c-.36.85-.78 1.62-1.27 2.32-1.07 1.52-2.13 2.28-3.16 2.28-.47 0-1.08-.16-1.83-.49-.74-.32-1.42-.49-2.04-.49-.65 0-1.36.17-2.13.49-.78.33-1.4.5-1.87.5-1.13 0-2.21-.78-3.25-2.35-1.24-1.86-1.86-3.92-1.86-6.16 0-2.05.55-3.7 1.65-4.95.93-1.05 2.1-1.57 3.51-1.57.5 0 1.21.18 2.14.53.92.35 1.53.53 1.81.53.4 0 1.04-.2 1.92-.6.92-.4 1.71-.56 2.36-.5 1.74.14 3.04.84 3.91 2.1-1.56.95-2.34 2.27-2.34 3.97 0 1.36.47 2.5 1.41 3.4.43.42.91.74 1.44.97-.12.34-.25.66-.4.97Z" />
              </svg>
              Apple
            </button>
            <button
              style={paymentMethod === "google" ? styles.pillActive : styles.pill}
              onClick={() => setPaymentMethod("google")}
            >
              G Google
            </button>
            <button
              style={paymentMethod === "paypal" ? styles.pillActive : styles.pill}
              onClick={() => setPaymentMethod("paypal")}
            >
              PayPal
            </button>
          </div>

          {submitError && <p style={styles.errorText}>{submitError}</p>}

          <button
            style={{ ...styles.confirmOrderBtn, opacity: isSubmitting ? 0.6 : 1 }}
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Placing Order..." : "Confirm Order"}
          </button>
        </div>
      </div>

      <BottomNav active="orders" onNavigate={onNavigate} />
    </Screen>
  );
}

// "2 bags 4kg" -> 2. Falls back to 1 if no leading number is found, since
// numberOfBags has a min: 1 constraint on the backend.
function parseBagsCount(text) {
  const match = (text || "").match(/^\s*(\d+)/);
  return match ? Math.max(parseInt(match[1], 10), 1) : 1;
}