/**
 * Native date + free time-range picker. Produces the exact shape the
 * backend's Order schema expects directly — { date, slotStart, slotEnd,
 * slotLabel } — so there's no more free-text parsing needed on submit
 * (replaces the old parseSlotString regex approach entirely).
 *
 * Uses plain <input type="date"> / <input type="time">. These render with
 * the browser's native picker UI on both desktop and mobile, which is the
 * most reliable cross-browser way to get a real date/time picker without
 * pulling in a calendar library — no extra dependency, no styling fights
 * with a third-party widget, and mobile users get their OS's native wheel
 * picker for free.
 */
export default function SlotPicker({ value, onChange, label, style }) {
  // value shape: { date: "YYYY-MM-DD", slotStart: "HH:MM", slotEnd: "HH:MM" }
  const { date = "", slotStart = "", slotEnd = "" } = value || {};

  function update(patch) {
    const next = { date, slotStart, slotEnd, ...patch };
    onChange(buildSlot(next));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
      {label && <span style={styles.label}>{label}</span>}

      {/* Date gets its own full-width row — matches the address input
          above it and gives the native date picker (mm/dd/yyyy + icon)
          enough room to not look cramped. */}
      <input
        type="date"
        value={date}
        min={todayISODate()}
        onChange={(e) => update({ date: e.target.value })}
        style={{ ...styles.input, ...style, width: "100%", boxSizing: "border-box" }}
      />

      {/* Time range on its own row below — two equal-width time inputs
          with a centered dash between them, each wide enough for
          "--:-- --" plus the native clock icon without crowding. */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          type="time"
          value={slotStart}
          onChange={(e) => update({ slotStart: e.target.value })}
          style={{ ...styles.input, ...style, flex: 1, minWidth: 0, boxSizing: "border-box" }}
        />
        <span style={styles.dash}>–</span>
        <input
          type="time"
          value={slotEnd}
          onChange={(e) => update({ slotEnd: e.target.value })}
          style={{ ...styles.input, ...style, flex: 1, minWidth: 0, boxSizing: "border-box" }}
        />
      </div>
    </div>
  );
}

/**
 * Builds the final slot object sent to the backend, including a
 * human-readable slotLabel (used for display in BookingConfirmedScreen /
 * OrdersScreen / LiveTrackingScreen via their existing formatSlot helper).
 */
function buildSlot({ date, slotStart, slotEnd }) {
  return {
    date: date || "",
    slotStart: slotStart || "",
    slotEnd: slotEnd || "",
    slotLabel: formatSlotLabel(date, slotStart, slotEnd),
  };
}

function formatSlotLabel(date, slotStart, slotEnd) {
  if (!date) return "";
  const d = new Date(`${date}T00:00:00`);
  const dateLabel = d.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  if (!slotStart || !slotEnd) return dateLabel;
  return `${dateLabel} · ${formatTime(slotStart)}–${formatTime(slotEnd)}`;
}

// "14:30" -> "2:30 PM" — matches the existing slotLabel style already used
// throughout the app ("9:00–11:00 AM").
function formatTime(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

function todayISODate() {
  return new Date().toISOString().slice(0, 10);
}

const styles = {
  label: { fontSize: 12, color: "#777", fontWeight: 500 },
  input: {
    background: "#F6F7FB",
    border: "1px solid #ECEDF4",
    borderRadius: 12,
    padding: "12px 14px",
    fontSize: 13.5,
    color: "#222",
    fontFamily: "inherit",
    height: 44,
  },
  dash: { color: "#999", alignSelf: "center", fontSize: 14 },
};