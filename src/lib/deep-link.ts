import type { FareOption } from "./fare-engine";

export interface RoutePoint {
  lat: number;
  lng: number;
  name: string;
}

const f = (n: number) => n.toFixed(6);

export function buildDeepLink(option: FareOption, pickup: RoutePoint, drop: RoutePoint): string {
  switch (option.provider) {
    case "uber": {
      const p = new URLSearchParams();
      p.set("action", "setPickup");
      p.set("pickup[latitude]", f(pickup.lat));
      p.set("pickup[longitude]", f(pickup.lng));
      p.set("pickup[nickname]", pickup.name);
      p.set("dropoff[latitude]", f(drop.lat));
      p.set("dropoff[longitude]", f(drop.lng));
      p.set("dropoff[nickname]", drop.name);
      return `https://m.uber.com/ul/?${p.toString()}`;
    }
    case "ola": {
      const p = new URLSearchParams({
        lat: f(pickup.lat),
        lng: f(pickup.lng),
        drop_lat: f(drop.lat),
        drop_lng: f(drop.lng),
        category: option.category,
      });
      return `olacabs://app/launch?${p.toString()}`;
    }
    case "rapido":
      return "https://www.rapido.bike/";
  }
}
