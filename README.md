# RideCompare Pro

Build "RideCompare": a professional, mobile-first web app that compares ride fares from Uber, Ola and Rapido side by side and lets the user continue in the chosen app via deep links. Light theme only. It must look like a polished fintech product (think Razorpay or Stripe dashboards), NOT playful: no emojis, no cartoon gradients, no floating blobs, no pill-shaped everything.

DESIGN SYSTEM
- Font: Inter. Light theme. Tokens: background #F5F7FA, surface #FFFFFF, ink/navy #0A2540, soft text #5B6B82, faint text #8A97AB, border #E3E8EF, strong border #CBD4E1, single accent blue #2F6FED (hover #2459C7, tint #EEF3FE), success green #0E7A4B on #E8F5EE, amber #8A5A00 on #FDF3DC, error #C0362C.
- Radii: 12px cards, 8px inputs/buttons/tags. 1px borders instead of heavy shadows. Tabular numerals for prices.
- Motion with framer-motion, restrained: 8-10px fade-up entrances staggered ~45ms, prices counting up over ~700ms, layout animation when the list is re-sorted or filtered, a sliding underline for tabs, subtle skeleton shimmer while loading, and respect prefers-reduced-motion.
- Centered content column max-width 680px on desktop, full width on mobile. Sticky top bar with a small wordmark "RideCompare" (dark rounded-square logo mark with a route icon from lucide-react) and an avatar menu on the right.

FLOW (three screens, client-side routing)
1. Auth screen: a single centered card with an underline tab switcher "Sign in" / "Create account". Fields: full name (sign-up only), email, password with Show/Hide toggle. Inline validation (valid email, password at least 8 characters, name at least 2 characters) with error text under the field, focus ring in the accent color, loading state on the primary button, "Forgot password?" link on sign-in, and a terms line on sign-up. For now this is UI-only: keep the session in React state/context, never store passwords anywhere, and show a small note "Demo: no account is created". Structure the code so a real auth backend can replace the mock later.
2. Location permission screen: a card with a pin icon, title "Set your pickup automatically", short privacy copy (location is used only while the app is open to fill the pickup point, never tracked in the background), primary button "Allow location access" that calls navigator.geolocation.getCurrentPosition, and a secondary text button "Enter pickup manually". If permission is denied or unavailable, show a calm inline message and continue with manual entry. Never display raw coordinates.
3. Compare dashboard: page title "Compare ride fares" with a one-line description. A route card with Pickup and Drop-off rows (dot and connector rail, thin divider), a "Use current location" link on the pickup row, and a swap button. Place inputs with a debounced autocomplete dropdown using a small built-in list of Bengaluru places (MG Road Metro Station, Indiranagar, Koramangala, Whitefield, HSR Layout, Majestic Bus Stand, Kempegowda Airport) with coordinates; compute distance with the haversine formula times 1.3 for road distance, and duration at about 22 km/h average city speed.
   Below the route card show vehicle-type text tabs "All, Bike, Auto, Car" each with a count and a sliding underline, then a toolbar with the summary (distance, minutes, number of options) and a compact Price / Pickup sort toggle. Then a list of fare cards.
   Fare options (estimates from rate cards: fare = max(minFare, base + perKm*km + perMin*min) times a deterministic demand multiplier between 1.0 and 1.3): Uber Moto, Uber Auto, Uber Go, Uber Premier; Ola Bike, Ola Auto, Ola Mini, Ola Prime Sedan; Rapido Bike, Rapido Auto, Rapido Cab Economy. Each card: small provider monogram square (Uber black with white U, Ola lime #CFE23A with dark O, Rapido yellow #F7CE3E with dark R), product name, "N min away, N min trip, N seats", small tags ("Lowest fare" in green, "Nearest" in blue, "1.3x demand" in amber) computed within the currently filtered set, and on the right a large price (average of the range) with the range below it in faint text. Clicking a card selects it (accent border with a soft ring) and smoothly expands a full-width blue "Continue in Uber/Ola/Rapido" button with the note "The final fare is confirmed in the app." The button builds the deep link and opens it: Uber uses https://m.uber.com/ul/?action=setPickup&pickup[latitude]=..&pickup[longitude]=..&pickup[nickname]=..&dropoff[latitude]=..&dropoff[longitude]=..&dropoff[nickname]=.. ; Ola uses olacabs://app/launch?lat=..&lng=..&drop_lat=..&drop_lng=..&category=..; Rapido uses https://www.rapido.bike/. Show a dark toast "Opening Uber with your route" with the URL in monospace.
   Show 4 skeleton cards for about a second whenever the route changes. Footer disclaimer: "Fares are estimates based on distance and time of day. Exact prices are shown in each app."
- Account menu on the avatar: shows name and email and a "Sign out" action that returns to the auth screen.

QUALITY BAR
- Fully responsive and accessible (labels, focus states, aria-selected on tabs, keyboard navigable cards).
- Clean component structure (AuthScreen, LocationPrompt, RouteCard, VehicleTabs, SortToggle, FareCard, FareSkeleton), a small fare-engine module and a deep-link module, strongly typed in TypeScript.
- Do not enable a database or paid integrations yet.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/56eeacd9-cd55-4a1d-bd95-6be6070c13cf).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
