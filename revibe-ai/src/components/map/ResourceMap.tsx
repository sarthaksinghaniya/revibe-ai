"use client";

import dynamic from "next/dynamic";
import type { PathOptions } from "leaflet";

import { mockResources, type ResourceType } from "@/data/mockResources";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), {
  ssr: false,
});
const CircleMarker = dynamic(
  () => import("react-leaflet").then((mod) => mod.CircleMarker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

const DEFAULT_CENTER: [number, number] = [12.9716, 77.5946];
const DEFAULT_ZOOM = 12;

const markerStylesByType: Record<ResourceType, PathOptions> = {
  "recycling center": {
    color: "#0f766e",
    fillColor: "#14b8a6",
    fillOpacity: 0.8,
    weight: 1.5,
  },
  "scrap shop": {
    color: "#92400e",
    fillColor: "#f59e0b",
    fillOpacity: 0.8,
    weight: 1.5,
  },
  "repair hub": {
    color: "#1e3a8a",
    fillColor: "#3b82f6",
    fillOpacity: 0.8,
    weight: 1.5,
  },
  "maker space": {
    color: "#7c2d12",
    fillColor: "#f97316",
    fillOpacity: 0.8,
    weight: 1.5,
  },
};

export function ResourceMap() {
  return (
    <div className="revibe-resource-map h-64 w-full overflow-hidden rounded-2xl ring-1 ring-border sm:h-72">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={false}
        className="h-full w-full"
        attributionControl
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {mockResources.map((resource) => (
          <CircleMarker
            key={resource.id}
            center={[resource.lat, resource.lng]}
            radius={8}
            pathOptions={markerStylesByType[resource.type]}
          >
            <Popup>
              <div className="min-w-44">
                <p className="text-sm font-semibold text-slate-900">{resource.name}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                  {resource.type}
                </p>
                <p className="mt-2 text-xs leading-5 text-slate-700">
                  {resource.description}
                </p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
