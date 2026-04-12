export type ResourceType =
  | "recycling center"
  | "scrap shop"
  | "repair hub"
  | "maker space";

export type MapResource = {
  id: string;
  name: string;
  type: ResourceType;
  description: string;
  distanceLabel?: string;
  lat: number;
  lng: number;
};

export const mockResources: MapResource[] = [
  {
    id: "res-1",
    name: "GreenCycle Drop Point",
    type: "recycling center",
    description: "Accepts small electronics and separated e-waste components.",
    distanceLabel: "1.2 km away",
    lat: 12.9762,
    lng: 77.5993,
  },
  {
    id: "res-2",
    name: "Metro Scrap Exchange",
    type: "scrap shop",
    description: "Buys reusable metal, cables, and old hardware parts.",
    distanceLabel: "2.1 km away",
    lat: 12.9675,
    lng: 77.5874,
  },
  {
    id: "res-3",
    name: "FixLab Community Repair",
    type: "repair hub",
    description: "Weekend volunteer repair help for phones, routers, and laptops.",
    distanceLabel: "3.0 km away",
    lat: 12.9821,
    lng: 77.5829,
  },
  {
    id: "res-4",
    name: "BuildSpace Makers",
    type: "maker space",
    description: "Low-cost tools and prototyping benches for upcycling projects.",
    distanceLabel: "4.4 km away",
    lat: 12.9613,
    lng: 77.6068,
  },
];
