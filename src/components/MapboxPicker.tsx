"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export type MapboxPickerProps = {
  lat?: string;
  lng?: string;
  onSelect: (data: {
    latitud: string;
    longitud: string;
    address: string;
    city: string;
    state: string;
    country: string;
  }) => void;
};

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

export default function MapboxPicker({
  lat,
  lng,
  onSelect,
}: MapboxPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current) {return;}

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [
        lng ? parseFloat(lng) : -66.9036,
        lat ? parseFloat(lat) : 10.4806,
      ],
      zoom: 12,
    });

    map.current.on("click", async (e) => {
      const longitude = e.lngLat.lng;
      const latitude = e.lngLat.lat;

      if (marker.current) {
        marker.current.setLngLat([longitude, latitude]);
      } else {
        marker.current = new mapboxgl.Marker({ color: "#f97316" })
          .setLngLat([longitude, latitude])
          .addTo(map.current!);
      }

      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxgl.accessToken}`,
      );
      const data = await res.json();

      if (data.features && data.features.length > 0) {
        const place = data.features[0];
        let address = place.place_name;
        let city = "";
        let state = "";
        let country = "";

        for (const c of place.context || []) {
          if (c.id.includes("place")) {city = c.text;}
          if (c.id.includes("region")) {state = c.text;}
          if (c.id.includes("country")) {country = c.text;}
        }

        onSelect({
          latitud: latitude.toFixed(6),
          longitud: longitude.toFixed(6),
          address,
          city,
          state,
          country,
        });
      }
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  return (
    <div
      ref={mapContainer}
      className="w-full h-64 border border-gray-300 rounded-md overflow-hidden"
    />
  );
}
