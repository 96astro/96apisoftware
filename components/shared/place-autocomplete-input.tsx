"use client";

import { Input } from "@/components/ui/input";
import { useEffect, useRef } from "react";

type PlaceAutocompleteInputProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onPlaceDetailsChange?: (details: {
    latitudeDeg: string;
    latitudeMin: string;
    latitudeDir: "N" | "S" | "";
    longitudeDeg: string;
    longitudeMin: string;
    longitudeDir: "E" | "W" | "";
    timezoneOffset: string;
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

        const latitudeDeg =
          typeof lat === "number" ? String(Math.floor(Math.abs(lat))) : "";
        const latitudeMin =
          typeof lat === "number"
            ? String(Math.round((Math.abs(lat) % 1) * 60))
            : "";
        const latitudeDir: "N" | "S" | "" =
          typeof lat === "number" ? (lat >= 0 ? "N" : "S") : "";

        const longitudeDeg =
          typeof lng === "number" ? String(Math.floor(Math.abs(lng))) : "";
        const longitudeMin =
          typeof lng === "number"
            ? String(Math.round((Math.abs(lng) % 1) * 60))
            : "";
        const longitudeDir: "E" | "W" | "" =
          typeof lng === "number" ? (lng >= 0 ? "E" : "W") : "";

        const timezoneOffset =
          typeof offsetMinutes === "number"
            ? Number((offsetMinutes / 60).toFixed(2)).toString()
            : "";

        onPlaceDetailsChange?.({
          latitudeDeg,
          latitudeMin,
          latitudeDir,
          longitudeDeg,
          longitudeMin,
          longitudeDir,
          timezoneOffset,
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
          latitudeDeg: "",
          latitudeMin: "",
          latitudeDir: "",
          longitudeDeg: "",
          longitudeMin: "",
          longitudeDir: "",
          timezoneOffset: "",
        });
      }}
      placeholder={placeholder}
    />
  );
};

export default PlaceAutocompleteInput;
