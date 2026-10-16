import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { RouteCard, type RoutePlace } from "@/components/RouteCard";
import { VehicleTabs, type VehicleFilter } from "@/components/VehicleTabs";
import { SortToggle, type SortKey } from "@/components/SortToggle";
import { FareCard } from "@/components/FareCard";
import { FareSkeleton } from "@/components/FareSkeleton";
import { Toast, type ToastData } from "@/components/Toast";
import { computeFares, estimateTrip, PROVIDER_NAMES, type FareOption } from "@/lib/fare-engine";
import { buildDeepLink } from "@/lib/deep-link";
import { requestPosition, useSession } from "@/lib/session";
import { PLACES } from "@/lib/places";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Compare ride fares · RideCompare" },
      { name: "description", content: "Side-by-side fare estimates for Uber, Ola and Rapido in Bengaluru." },
      { property: "og:title", content: "Compare ride fares · RideCompare" },
      { property: "og:description", content: "Side-by-side fare estimates for Uber, Ola and Rapido." },
    ],
  }),
  component: ComparePage,
});

const CURRENT = "Current location";

function ComparePage() {
  const { user, currentLocation, setCurrentLocation } = useSession();
  const navigate = useNavigate();

  const [pickup, setPickup] = useState<RoutePlace | null>(() =>
    currentLocation ? { name: CURRENT, ...currentLocation } : { name: PLACES[0].name, lat: PLACES[0].lat, lng: PLACES[0].lng },
  );
  const [drop, setDrop] = useState<RoutePlace | null>({ name: PLACES[2].name, lat: PLACES[2].lat, lng: PLACES[2].lng });
  const [filter, setFilter] = useState<VehicleFilter>("all");
  const [sort, setSort] = useState<SortKey>("price");
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [locMsg, setLocMsg] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!user) navigate({ to: "/" });
  }, [user, navigate]);

  const routeKey = pickup && drop ? `${pickup.lat},${pickup.lng}|${drop.lat},${drop.lng}` : "";
  const sameSpot = !!pickup && !!drop && pickup.lat === drop.lat && pickup.lng === drop.lng;

  useEffect(() => {
    if (!routeKey) return;
    setLoading(true);
    setSelected(null);
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, [routeKey]);

  const trip = useMemo(() => (pickup && drop && !sameSpot ? estimateTrip(pickup, drop) : null), [pickup, drop, sameSpot]);
  const fares = useMemo(() => (trip ? computeFares(trip, routeKey) : []), [trip, routeKey]);

  const counts = useMemo(
    () => ({
      all: fares.length,
      bike: fares.filter((f) => f.type === "bike").length,
      auto: fares.filter((f) => f.type === "auto").length,
      car: fares.filter((f) => f.type === "car").length,
    }),
    [fares],
  );

  const visible = useMemo(() => {
    const list = filter === "all" ? fares : fares.filter((f) => f.type === filter);
    return [...list].sort((a, b) => (sort === "price" ? a.price - b.price || a.etaMin - b.etaMin : a.etaMin - b.etaMin || a.price - b.price));
  }, [fares, filter, sort]);

  const lowestId = visible.length ? visible.reduce((m, f) => (f.price < m.price ? f : m)).id : null;
  const nearestId = visible.length ? visible.reduce((m, f) => (f.etaMin < m.etaMin ? f : m)).id : null;

  async function useCurrent() {
    setLocating(true);
    setLocMsg(null);
    try {
      const c = await requestPosition();
      setCurrentLocation(c);
      setPickup({ name: CURRENT, ...c });
    } catch {
      setLocMsg("We couldn't get your location. Choose a pickup point from the list instead.");
    } finally {
      setLocating(false);
    }
  }

  function openDeepLink(option: FareOption) {
    if (!pickup || !drop) return;
    const url = buildDeepLink(option, pickup, drop);
    const name = PROVIDER_NAMES[option.provider];
    clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), title: `Opening ${name} with your route`, url });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  if (!user) return null;

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="text-2xl font-semibold tracking-tight">Compare ride fares</h1>
        <p className="mt-1 text-sm text-muted-foreground">Estimates from Uber, Ola and Rapido for your route, side by side.</p>
      </motion.div>

      <motion.div className="mt-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.045 }}>
        <RouteCard
          pickup={pickup}
          drop={drop}
          onPickup={setPickup}
          onDrop={setDrop}
          onSwap={() => {
            setPickup(drop);
            setDrop(pickup);
          }}
          onUseCurrent={useCurrent}
          locating={locating}
          locationMessage={locMsg}
        />
      </motion.div>

      <motion.div className="mt-8" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.09 }}>
        <VehicleTabs value={filter} counts={counts} onChange={setFilter} />

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="tabular text-sm text-muted-foreground">
            {trip ? (
              <>
                <span className="font-medium text-foreground">{trip.km} km</span> · {trip.minutes} min · {visible.length}{" "}
                {visible.length === 1 ? "option" : "options"}
              </>
            ) : (
              "Choose a pickup and drop-off"
            )}
          </p>
          <SortToggle value={sort} onChange={setSort} />
        </div>

        {sameSpot ? (
          <p className="mt-4 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
            Pickup and drop-off are the same. Choose a different destination.
          </p>
        ) : !trip ? null : loading ? (
          <ul className="mt-4 space-y-3" aria-busy="true" aria-label="Loading fares">
            {Array.from({ length: 4 }).map((_, i) => (
              <FareSkeleton key={i} />
            ))}
          </ul>
        ) : (
          <LayoutGroup>
            <motion.ul layout className="mt-4 space-y-3">
              <AnimatePresence mode="popLayout">
                {visible.map((f, i) => (
                  <FareCard
                    key={f.id}
                    option={f}
                    index={i}
                    selected={selected === f.id}
                    lowest={f.id === lowestId}
                    nearest={f.id === nearestId}
                    onSelect={() => setSelected((s) => (s === f.id ? null : f.id))}
                    onContinue={() => openDeepLink(f)}
                  />
                ))}
              </AnimatePresence>
            </motion.ul>
          </LayoutGroup>
        )}
      </motion.div>

      <p className="mt-10 border-t border-border pt-4 text-xs leading-relaxed text-faint">
        Fares are estimates based on distance and time of day. Exact prices are shown in each app.
      </p>

      <Toast toast={toast} />
    </div>
  );
}
