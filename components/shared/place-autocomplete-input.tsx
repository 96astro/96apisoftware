"use client";

import { Input } from "@/components/ui/input";
import { useEffect, useRef } from "react";

type PlaceAutocompleteInputProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onPlaceDetailsChange?: (details: {
    latitude: string;
    longitude: string;
    timezone: string;
  }) => void;
  placeholder?: string;
};

declare global {
  interface Window {
    google?: any;
  }
}

const SCRIPT_ID = "google-maps-places-script";

const PlaceAutocompleteInput = ({
  id,
  value,
  onChange,
  onPlaceDetailsChange,
  placeholder = "Place of Birth",
}: PlaceAutocompleteInputProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || !inputRef.current) {
      return;
    }

    const initAutocomplete = () => {
      if (!window.google?.maps?.places || !inputRef.current) {
        return;
      }

      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ["(cities)"],
        fields: ["formatted_address", "name", "geometry", "utc_offset_minutes"],
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        const text = place?.formatted_address || place?.name || "";
        if (text) {
          onChange(text);
        }

        const lat = place?.geometry?.location?.lat?.();
        const lng = place?.geometry?.location?.lng?.();
        const offsetMinutes = place?.utc_offset_minutes;

        const timezone =
          typeof offsetMinutes === "number"
            ? (() => {
                const sign = offsetMinutes >= 0 ? "+" : "-";
                const absMinutes = Math.abs(offsetMinutes);
                const hours = Math.floor(absMinutes / 60);
                const minutes = absMinutes % 60;
                return minutes === 0
                  ? `UTC${sign}${hours}`
                  : `UTC${sign}${hours}.${Math.round((minutes / 60) * 10)}`;
              })()
            : "";

        onPlaceDetailsChange?.({
          latitude: typeof lat === "number" ? lat.toFixed(6) : "",
          longitude: typeof lng === "number" ? lng.toFixed(6) : "",
          timezone,
        });
      });
    };

    if (window.google?.maps?.places) {
      initAutocomplete();
      return;
    }

    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", initAutocomplete, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = initAutocomplete;
    document.head.appendChild(script);
  }, [onChange]);

  return (
    <Input
      ref={inputRef}
      id={id}
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
        onPlaceDetailsChange?.({
          latitude: "",
          longitude: "",
          timezone: "",
        });
      }}
      placeholder={placeholder}
    />
  );
};

export default PlaceAutocompleteInput;
