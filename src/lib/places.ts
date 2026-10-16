export interface Place {
  id: string;
  name: string;
  area: string;
  lat: number;
  lng: number;
}

export const PLACES: Place[] = [
  { id: "mg-road", name: "MG Road Metro Station", area: "MG Road, Bengaluru", lat: 12.9756, lng: 77.6066 },
  { id: "indiranagar", name: "Indiranagar", area: "100 Feet Road, Bengaluru", lat: 12.9719, lng: 77.6412 },
  { id: "koramangala", name: "Koramangala", area: "5th Block, Bengaluru", lat: 12.9352, lng: 77.6245 },
  { id: "whitefield", name: "Whitefield", area: "ITPL Main Road, Bengaluru", lat: 12.9698, lng: 77.75 },
  { id: "hsr", name: "HSR Layout", area: "Sector 2, Bengaluru", lat: 12.9116, lng: 77.6474 },
  { id: "majestic", name: "Majestic Bus Stand", area: "Kempegowda Bus Station, Bengaluru", lat: 12.9767, lng: 77.5713 },
  { id: "airport", name: "Kempegowda Airport", area: "Devanahalli, Bengaluru", lat: 13.1986, lng: 77.7066 },
];

export function searchPlaces(q: string): Place[] {
  const s = q.trim().toLowerCase();
  if (!s) return PLACES;
  return PLACES.filter((p) => p.name.toLowerCase().includes(s) || p.area.toLowerCase().includes(s));
}
