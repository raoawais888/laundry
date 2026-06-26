import { useState, useRef, useEffect, useCallback } from "react";

/**
 * Free-text address input with autocomplete suggestions from OpenStreetMap's
 * Nominatim search API — no API key, no billing account required.
 *
 * Trade-offs vs. Google Places, worth knowing:
 *  - Matching is more literal (less typo-tolerant / fuzzy) than Google's.
 *  - Nominatim's usage policy asks for max ~1 request/second and an
 *    identifiable User-Agent/referer — debounced below to respect that.
 *  - Coverage and address detail quality vary by region (generally good in
 *    well-mapped areas, patchier in some places Google covers better).
 *
 * onSelect receives { fullAddress, lat, lon } when the user picks a
 * suggestion — lat/lon are real numbers, suitable for the Order schema's
 * location: { type: "Point", coordinates: [lon, lat] } field.
 */
export default function AddressAutocompleteInput({
  value,
  onChange,
  onSelect,
  placeholder,
  style,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);
  const requestIdRef = useRef(0);

  const search = useCallback(async (query) => {
    if (!query || query.trim().length < 3) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    const thisRequestId = ++requestIdRef.current;
    setIsLoading(true);

    try {
      const url = new URL("https://nominatim.openstreetmap.org/search");
      url.searchParams.set("format", "json");
      url.searchParams.set("q", query);
      url.searchParams.set("addressdetails", "1");
      url.searchParams.set("limit", "5");

      const res = await fetch(url.toString(), {
        headers: {
          // Nominatim's usage policy asks apps to identify themselves.
          // Browsers block setting User-Agent directly on fetch, so the
          // Referer (automatically sent by the browser) is what actually
          // identifies the request in practice — this header is left here
          // as documentation of intent / in case you proxy this server-side
          // later, where User-Agent CAN be set freely.
          "Accept-Language": "en",
        },
      });

      // If a newer request has started since this one fired, drop this
      // result — prevents a slow earlier response from clobbering a
      // faster later one (classic race condition with debounced search).
      if (thisRequestId !== requestIdRef.current) return;

      if (!res.ok) {
        setSuggestions([]);
        return;
      }

      const data = await res.json();
      setSuggestions(Array.isArray(data) ? data : []);
      setIsOpen(true);
      setHighlightedIndex(-1);
    } catch {
      if (thisRequestId === requestIdRef.current) setSuggestions([]);
    } finally {
      if (thisRequestId === requestIdRef.current) setIsLoading(false);
    }
  }, []);

  function handleInputChange(e) {
    const next = e.target.value;
    onChange(next);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    // 400ms debounce: comfortably under Nominatim's ~1 req/sec guidance
    // even on fast typing, without feeling sluggish to the user.
    debounceRef.current = setTimeout(() => search(next), 400);
  }

  function handleSelect(suggestion) {
    const fullAddress = suggestion.display_name;
    onChange(fullAddress);
    setSuggestions([]);
    setIsOpen(false);
    onSelect?.({
      fullAddress,
      lat: parseFloat(suggestion.lat),
      lon: parseFloat(suggestion.lon),
    });
  }

  function handleKeyDown(e) {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0) handleSelect(suggestions[highlightedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  }

  // Close the dropdown when clicking outside the component.
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Clean up any pending debounce on unmount.
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} style={{ position: "relative", flex: 1 }}>
      <input
        style={style}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length > 0 && setIsOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
      />
      {isOpen && (suggestions.length > 0 || isLoading) && (
        <div style={dropdownStyles.wrap}>
          {isLoading && suggestions.length === 0 && (
            <div style={dropdownStyles.item}>Searching…</div>
          )}
          {suggestions.map((s, i) => (
            <div
              key={s.place_id}
              style={{
                ...dropdownStyles.item,
                background: i === highlightedIndex ? "#F2F3F8" : "#fff",
              }}
              onMouseDown={(e) => {
                // onMouseDown (not onClick) so this fires before the
                // input's onBlur/click-outside handler would close the
                // dropdown and swallow the selection.
                e.preventDefault();
                handleSelect(s);
              }}
              onMouseEnter={() => setHighlightedIndex(i)}
            >
              {s.display_name}
            </div>
          ))}
        </div>
      )}
      <div style={dropdownStyles.attribution}>
        Search by{" "}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
          style={{ color: "inherit" }}
        >
          OpenStreetMap
        </a>
      </div>
    </div>
  );
}

const dropdownStyles = {
  wrap: {
    position: "absolute",
    top: "calc(100% + 4px)",
    left: 0,
    right: 0,
    background: "#fff",
    border: "1px solid #ECEDF4",
    borderRadius: 12,
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
    zIndex: 50,
    maxHeight: 220,
    overflowY: "auto",
  },
  item: {
    padding: "10px 14px",
    fontSize: 13,
    color: "#222",
    cursor: "pointer",
    borderBottom: "1px solid #f5f5f8",
  },
  attribution: {
    fontSize: 10,
    color: "#aaa",
    marginTop: 2,
    textAlign: "right",
  },
};