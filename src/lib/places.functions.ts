import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Google Places (New) autocomplete for Bengaluru, called through the Lovable
 * connector gateway. Credentials stay server-only; the browser never sees them.
 * Calls are bounded: validated input, Bengaluru-only bias, capped results.
 * NOTE: the app's auth is currently a client-side demo — when a real login
 * backend lands, add session verification to these handlers.
 */

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";
const BENGALURU_CENTER = { latitude: 12.9716, longitude: 77.5946 };
const BENGALURU_RADIUS_M = 30000;

export interface PlaceSuggestion {
  id: string;
  name: string;
  secondary: string;
}

export interface PlaceDetails {
  id: string;
  name: string;
  secondary: string;
  lat: number;
  lng: number;
}

const suggestSchema = z.object({
  input: z.string().trim().min(2).max(120),
  sessionToken: z.string().uuid(),
});

const detailsSchema = z.object({
  placeId: z.string().regex(/^[A-Za-z0-9_-]{10,255}$/),
  sessionToken: z.string().uuid(),
});

interface AutocompleteResponse {
  suggestions?: Array<{
    placePrediction?: {
      placeId?: string;
      structuredFormat?: {
        mainText?: { text?: string };
        secondaryText?: { text?: string };
      };
    };
  }>;
}

interface DetailsResponse {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
}

export const suggestPlaces = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => suggestSchema.parse(data))
  .handler(async ({ data }): Promise<{ suggestions: PlaceSuggestion[] }> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    const connKey = process.env["GOOGLE_MAPS_API_KEY"];
    if (!apiKey || !connKey) {
      console.error("Places autocomplete skipped: connector credentials missing");
      return { suggestions: [] };
    }
    try {
      const res = await fetch(`${GATEWAY_URL}/places/v1/places:autocomplete`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "X-Connection-Api-Key": connKey,
          "Content-Type": "application/json",
          "X-Goog-FieldMask":
            "suggestions.placePrediction.placeId,suggestions.placePrediction.structuredFormat",
        },
        body: JSON.stringify({
          input: data.input,
          sessionToken: data.sessionToken,
          locationBias: {
            circle: { center: BENGALURU_CENTER, radius: BENGALURU_RADIUS_M },
          },
        }),
      });
      if (!res.ok) {
        console.error(`Places autocomplete failed [${res.status}]`);
        return { suggestions: [] };
      }
      const json = (await res.json()) as AutocompleteResponse;
      const suggestions: PlaceSuggestion[] = (json.suggestions ?? [])
        .map((s) => s.placePrediction)
        .filter((p): p is NonNullable<typeof p> => !!p?.placeId)
        .slice(0, 6)
        .map((p) => ({
          id: p.placeId!,
          name: p.structuredFormat?.mainText?.text ?? "",
          secondary: p.structuredFormat?.secondaryText?.text ?? "",
        }))
        .filter((p) => p.name.length > 0);
      return { suggestions };
    } catch (err) {
      console.error("Places autocomplete request error", err);
      return { suggestions: [] };
    }
  });

export const getPlaceDetails = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => detailsSchema.parse(data))
  .handler(async ({ data }): Promise<{ place: PlaceDetails | null }> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    const connKey = process.env["GOOGLE_MAPS_API_KEY"];
    if (!apiKey || !connKey) {
      console.error("Place details skipped: connector credentials missing");
      return { place: null };
    }
    try {
      const res = await fetch(
        `${GATEWAY_URL}/places/v1/places/${data.placeId}?sessionToken=${encodeURIComponent(data.sessionToken)}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "X-Connection-Api-Key": connKey,
            "X-Goog-FieldMask": "id,displayName,formattedAddress,location",
          },
        },
      );
      if (!res.ok) {
        console.error(`Place details failed [${res.status}]`);
        return { place: null };
      }
      const p = (await res.json()) as DetailsResponse;
      const lat = p.location?.latitude;
      const lng = p.location?.longitude;
      if (typeof lat !== "number" || typeof lng !== "number") {
        return { place: null };
      }
      return {
        place: {
          id: p.id ?? data.placeId,
          name: p.displayName?.text ?? "",
          secondary: p.formattedAddress ?? "",
          lat,
          lng,
        },
      };
    } catch (err) {
      console.error("Place details request error", err);
      return { place: null };
    }
  });
