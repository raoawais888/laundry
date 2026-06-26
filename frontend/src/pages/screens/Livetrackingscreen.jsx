import { useState } from "react";
import { TIMELINE_STEPS, RIDER } from "../Constants";
import { Star } from "../../components/Icons";
import { Screen, BottomNav } from "../Layout";
import { styles } from "./Styles";

export default function LiveTrackingScreen({ order, onNavigate }) {
  const [stepIndex, setStepIndex] = useState(2); // "arriving" by default, matches reference

  function advance() {
    setStepIndex((i) => Math.min(i + 1, TIMELINE_STEPS.length - 1));
  }

  const orderId = order?.orderNumber || order?.id || "LM-20482";
  const reachedDelivery = stepIndex === TIMELINE_STEPS.length - 1;

  return (
    <Screen>
      <div style={styles.headerGradient}>
        <h2 style={styles.headerTitle}>Live Tracking</h2>
        <svg style={styles.headerTuck} width="36" height="36" viewBox="0 0 36 36">
          <path d="M36 0 V36 H0 C20 36 36 20 36 0 Z" fill="#f4f5f9" />
        </svg>
      </div>

      <div style={{ ...styles.body, padding: "32px 0 110px" }}>
        <div style={{ padding: "0 20px" }}>
          <h1 style={{ ...styles.title, textAlign: "left", margin: 0 }}>Track your order</h1>
          <p style={{ ...styles.orderId, textAlign: "left", margin: "4px 0 20px" }}>
            Order #{orderId}
          </p>
        </div>

        {/* Map mock */}
        <div style={styles.mapWrap} onClick={advance} title="Tap to advance status">
          <svg width="100%" height="200" viewBox="0 0 440 200" style={{ display: "block" }}>
            <rect width="440" height="200" fill="#E7EBF5" />
            <g stroke="#D2D9EC" strokeWidth="2">
              <line x1="0" y1="40" x2="440" y2="40" />
              <line x1="0" y1="100" x2="440" y2="90" />
              <line x1="0" y1="160" x2="440" y2="150" />
              <line x1="70" y1="0" x2="50" y2="200" />
              <line x1="180" y1="0" x2="190" y2="200" />
              <line x1="320" y1="0" x2="330" y2="200" />
            </g>
            <path d="M120 90 Q 200 130 310 95" stroke="#E0433B" strokeWidth="3" fill="none" strokeDasharray="2 6" strokeLinecap="round" />
          </svg>
          <div style={{ ...styles.etaBadge }}>
            {reachedDelivery ? "Arrived" : "12 mins away"}
          </div>
          <div style={styles.truckMarker}>🚚</div>
          <div style={styles.pinMarker}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="#E0433B">
              <path d="M12 2C7.6 2 4 5.6 4 10c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8z" />
              <circle cx="12" cy="10" r="3" fill="white" />
            </svg>
          </div>
        </div>

        {/* Rider card */}
        <div style={{ padding: "16px 20px 0" }}>
          <div style={styles.riderCardRow}>
            <img src={RIDER.photo} alt={RIDER.name} style={styles.riderPhoto} />
            <div>
              <p style={styles.riderName}>{RIDER.name}</p>
              <div style={{ display: "flex", gap: 2, marginBottom: 2 }}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} filled={i < RIDER.rating} size={14} />
                ))}
              </div>
              <p style={styles.riderVehicle}>{RIDER.vehicle}</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div style={{ padding: "16px 20px 0" }}>
          {TIMELINE_STEPS.map((step, i) => {
            const state = i < stepIndex ? "done" : i === stepIndex ? "active" : "pending";
            const dotColor = state === "done" ? "#2B35AF" : state === "active" ? "#15A883" : "#bbb";
            const labelColor = state === "pending" ? "#999" : "#111";
            return (
              <div key={step.key} style={styles.timelineRow}>
                <div style={styles.timelineDotCol}>
                  <div style={{ ...styles.timelineDot, background: dotColor }} />
                  {i < TIMELINE_STEPS.length - 1 && (
                    <div
                      style={{
                        ...styles.timelineLine,
                        background: i < stepIndex ? "#2B35AF" : "#ddd",
                      }}
                    />
                  )}
                </div>
                <div style={{ paddingBottom: 22 }}>
                  <p style={{ ...styles.timelineLabel, color: labelColor }}>{step.label}</p>
                  {state === "active" && <p style={styles.timelineSub}>in progress</p>}
                  {state === "done" && i === stepIndex - 1 && (
                    <p style={{ ...styles.timelineSub, color: "#999" }}>completed</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {reachedDelivery && (
          <div style={{ padding: "0 20px" }}>
            <button style={styles.trackBtn} onClick={() => onNavigate("rating")}>
              Rate this Delivery
            </button>
          </div>
        )}
      </div>

      <BottomNav active="orders" onNavigate={onNavigate} />
    </Screen>
  );
}