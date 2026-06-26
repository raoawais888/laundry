/**
 * The order form currently stores pickup/delivery slots as a single
 * free-text display string, e.g. "Mon 23 Jun · 9:00–11:00 AM". The backend's
 * Order schema wants a structured { date, slotStart, slotEnd, slotLabel }.
 *
 * Rather than trying to robustly parse arbitrary free text (fragile, and
 * breaks the moment someone types something slightly different), this
 * extracts what it reliably can and falls back sensibly:
 *  - slotLabel: the original string, always preserved so nothing is lost
 *  - date: today's date if no real date picker exists yet
 *  - slotStart / slotEnd: parsed from a "H:MM–H:MM" / "H:MM-H:MM" pattern
 *    if present, otherwise generic placeholders
 *
 * This is a stop-gap. The real fix is swapping the free-text input for an
 * actual date + time-range picker that produces these fields directly —
 * worth doing before this goes to production, since "9:00–11:00 AM" style
 * strings can be typed in many inconsistent ways.
 */
export function parseSlotString(slotString) {
  const fallback = {
    date: new Date().toISOString(),
    slotStart: "09:00",
    slotEnd: "11:00",
    slotLabel: slotString || "",
  };

  if (!slotString || typeof slotString !== "string") {
    return fallback;
  }

  // Looks for a time range like "9:00–11:00 AM" or "9:00-11:00"
  const timeRangeMatch = slotString.match(
    /(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})\s*(AM|PM)?/i
  );

  let slotStart = fallback.slotStart;
  let slotEnd = fallback.slotEnd;

  if (timeRangeMatch) {
    const [, start, end, meridiem] = timeRangeMatch;
    slotStart = normalizeTime(start, meridiem);
    slotEnd = normalizeTime(end, meridiem);
  }

  return {
    date: fallback.date,
    slotStart,
    slotEnd,
    slotLabel: slotString,
  };
}

function normalizeTime(time, meridiem) {
  // Best-effort "H:MM" -> "HH:MM" in 24h form when a meridiem is present.
  // Falls back to returning the time as-is if it doesn't look like
  // 12-hour clock notation, since slot labels are inconsistently formatted.
  const [hStr, mStr] = time.split(":");
  let h = parseInt(hStr, 10);
  const m = mStr || "00";

  if (meridiem && /pm/i.test(meridiem) && h < 12) h += 12;
  if (meridiem && /am/i.test(meridiem) && h === 12) h = 0;

  return `${String(h).padStart(2, "0")}:${m}`;
}