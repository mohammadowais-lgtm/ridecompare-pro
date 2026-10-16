export type Provider = "uber" | "ola" | "rapido";
export type VehicleType = "bike" | "auto" | "car";

export interface LatLng {
  lat: number;
  lng: number;
}

interface RateCard {
  id: string;
  provider: Provider;
  name: string;
  type: VehicleType;
  seats: number;
  base: number;
  perKm: number;
  perMin: number;
  minFare: number;
  etaBase: number;
  category: string;
}

const RATE_CARDS: RateCard[] = [
  { id: "uber-moto", provider: "uber", name: "Uber Moto", type: "bike", seats: 1, base: 20, perKm: 6, perMin: 1, minFare: 35, etaBase: 3, category: "moto" },
  { id: "uber-auto", provider: "uber", name: "Uber Auto", type: "auto", seats: 3, base: 30, perKm: 13, perMin: 1.5, minFare: 50, etaBase: 4, category: "auto" },
  { id: "uber-go", provider: "uber", name: "Uber Go", type: "car", seats: 4, base: 50, perKm: 16, perMin: 2, minFare: 120, etaBase: 5, category: "go" },
  { id: "uber-premier", provider: "uber", name: "Uber Premier", type: "car", seats: 4, base: 70, perKm: 21, perMin: 2.5, minFare: 170, etaBase: 7, category: "premier" },
  { id: "ola-bike", provider: "ola", name: "Ola Bike", type: "bike", seats: 1, base: 18, perKm: 6.5, perMin: 0.8, minFare: 33, etaBase: 4, category: "bike" },
  { id: "ola-auto", provider: "ola", name: "Ola Auto", type: "auto", seats: 3, base: 30, perKm: 14, perMin: 1.2, minFare: 48, etaBase: 3, category: "auto" },
  { id: "ola-mini", provider: "ola", name: "Ola Mini", type: "car", seats: 4, base: 45, perKm: 15, perMin: 1.8, minFare: 110, etaBase: 6, category: "mini" },
  { id: "ola-prime", provider: "ola", name: "Ola Prime Sedan", type: "car", seats: 4, base: 60, perKm: 19, perMin: 2.2, minFare: 150, etaBase: 8, category: "prime" },
  { id: "rapido-bike", provider: "rapido", name: "Rapido Bike", type: "bike", seats: 1, base: 15, perKm: 5.5, perMin: 0.8, minFare: 30, etaBase: 2, category: "bike" },
  { id: "rapido-auto", provider: "rapido", name: "Rapido Auto", type: "auto", seats: 3, base: 28, perKm: 12.5, perMin: 1, minFare: 45, etaBase: 3, category: "auto" },
  { id: "rapido-cab", provider: "rapido", name: "Rapido Cab Economy", type: "car", seats: 4, base: 40, perKm: 14, perMin: 1.6, minFare: 100, etaBase: 6, category: "cab" },
];

export const PROVIDER_NAMES: Record<Provider, string> = { uber: "Uber", ola: "Ola", rapido: "Rapido" };

export interface FareOption {
  id: string;
  provider: Provider;
  name: string;
  type: VehicleType;
  seats: number;
  category: string;
  etaMin: number;
  tripMin: number;
  low: number;
  high: number;
  price: number;
  multiplier: number;
}

export interface TripEstimate {
  km: number;
  minutes: number;
}

const toRad = (d: number) => (d * Math.PI) / 180;

export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function estimateTrip(a: LatLng, b: LatLng): TripEstimate {
  const km = haversineKm(a, b) * 1.3;
  const minutes = Math.max(1, Math.round((km / 22) * 60));
  return { km: Math.round(km * 10) / 10, minutes };
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

/** Deterministic multiplier 1.0 – 1.3 by product, route and hour. */
function demandMultiplier(id: string, seed: string, hour: number): number {
  return Math.round((1 + hash(`${id}|${seed}|${hour}`) * 0.3) * 10) / 10;
}

export function computeFares(trip: TripEstimate, seed: string, now = new Date()): FareOption[] {
  const hour = now.getHours();
  return RATE_CARDS.map((c) => {
    const raw = Math.max(c.minFare, c.base + c.perKm * trip.km + c.perMin * trip.minutes);
    const multiplier = demandMultiplier(c.id, seed, hour);
    const mid = raw * multiplier;
    const low = Math.round(mid * 0.94);
    const high = Math.round(mid * 1.08);
    const etaMin = c.etaBase + Math.floor(hash(`${c.id}|eta|${seed}`) * 5);
    return {
      id: c.id,
      provider: c.provider,
      name: c.name,
      type: c.type,
      seats: c.seats,
      category: c.category,
      etaMin,
      tripMin: trip.minutes,
      low,
      high,
      price: Math.round((low + high) / 2),
      multiplier,
    };
  });
}
