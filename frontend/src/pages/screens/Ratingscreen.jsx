import { useState } from "react";
import { RIDER } from "../Constants.js";
import { Star } from "../../components/Icons";
import { Screen, BackHeader, BottomNav } from "../Layout.jsx";
import { styles } from "./Styles.js";

export default function RatingScreen({ onNavigate }) {
  const [riderRating, setRiderRating] = useState(5);
  const [qualityRating, setQualityRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <Screen>
        <BackHeader title="Rate your experience" onBack={() => onNavigate("orders")} />
        <div style={{ ...styles.body, alignItems: "center", paddingTop: 60 }}>
          <div style={styles.checkCircle}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 style={{ ...styles.title, marginTop: 20 }}>Thanks for the feedback!</h1>
          <p style={{ ...styles.orderId, marginBottom: 24 }}>
            Your rating helps Frank and our laundry team improve.
          </p>
          <button style={styles.trackBtn} onClick={() => onNavigate("home")}>
            Back to Home
          </button>
        </div>
        <BottomNav active="orders" onNavigate={onNavigate} />
      </Screen>
    );
  }

  return (
    <Screen>
      <div style={styles.headerGradient}>
        <h2 style={styles.headerTitle}>Rate your experience</h2>
        <svg style={styles.headerTuck} width="36" height="36" viewBox="0 0 36 36">
          <path d="M36 0 V36 H0 C20 36 36 20 36 0 Z" fill="#f4f5f9" />
        </svg>
      </div>

      <div style={styles.body}>
        <div style={{ ...styles.card, textAlign: "center" }}>
          <h3 style={{ ...styles.cardTitle, textAlign: "center" }}>Rate your Rider</h3>
          <img src={RIDER.photo} alt={RIDER.name} style={styles.ratingPhoto} />
          <p style={styles.ratingName}>{RIDER.name}</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Star key={n} filled={n <= riderRating} onClick={() => setRiderRating(n)} />
            ))}
          </div>
        </div>

        <div style={{ ...styles.card, textAlign: "center" }}>
          <h3 style={{ ...styles.cardTitle, textAlign: "center" }}>Rate Laundry Quality</h3>
          <p style={styles.ratingName}>{RIDER.name}</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Star key={n} filled={n <= qualityRating} onClick={() => setQualityRating(n)} />
            ))}
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Feedback</h3>
          <textarea
            style={{ ...styles.textarea, minHeight: 90 }}
            placeholder="Write your feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </div>

        <button style={styles.confirmOrderBtn} onClick={handleSubmit}>
          Submit
        </button>
      </div>

      <BottomNav active="orders" onNavigate={onNavigate} />
    </Screen>
  );
}