import { useEffect, useState } from "react";
import { animate, AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { Tag } from "./ui-kit";
import { PROVIDER_NAMES, type FareOption } from "@/lib/fare-engine";
import { cn } from "@/lib/utils";
import { ProviderLogo } from "./ProviderLogo";

function useCountUp(target: number) {
  const reduce = useReducedMotion();
  const [v, setV] = useState(reduce ? target : 0);
  useEffect(() => {
    if (reduce) {
      setV(target);
      return;
    }
    const c = animate(0, target, { duration: 0.7, ease: [0.22, 1, 0.36, 1], onUpdate: (n) => setV(Math.round(n)) });
    return () => c.stop();
  }, [target, reduce]);
  return v;
}

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export function FareCard({
  option,
  index,
  selected,
  lowest,
  nearest,
  onSelect,
  onContinue,
}: {
  option: FareOption;
  index: number;
  selected: boolean;
  lowest: boolean;
  nearest: boolean;
  onSelect: () => void;
  onContinue: () => void;
}) {
  const price = useCountUp(option.price);
  const mono = MONO[option.provider];
  const provider = PROVIDER_NAMES[option.provider];

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.12 } }}
      transition={{ duration: 0.3, delay: index * 0.045, layout: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }}
      className={cn(
        "overflow-hidden rounded-lg border bg-card transition-[border-color,box-shadow]",
        selected
          ? "border-primary shadow-[0_0_0_3px_color-mix(in_oklab,var(--primary)_14%,transparent)]"
          : "border-border hover:border-border-strong",
      )}
    >
      <div
        role="button"
        tabIndex={0}
        aria-pressed={selected}
        aria-label={`${option.name}, ${inr(option.price)}`}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect();
          }
        }}
        className="flex cursor-pointer items-center gap-3 p-4 outline-none focus-visible:bg-primary-tint/50"
      >
        <ProviderLogo provider={option.provider} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold">{option.name}</p>
          <p className="tabular mt-0.5 truncate text-xs text-muted-foreground">
            {option.etaMin} min away · {option.tripMin} min trip · {option.seats} {option.seats === 1 ? "seat" : "seats"}
          </p>
          {(lowest || nearest || option.pricing !== "demand" || option.multiplier >= 1.2) && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {lowest && <Tag tone="success">Lowest fare</Tag>}
              {nearest && <Tag tone="info">Nearest</Tag>}
              {option.pricing === "meter" && <Tag tone="success">Govt meter · Zero surge</Tag>}
              {option.pricing === "night" && <Tag tone="warning">Night meter 1.5x</Tag>}
              {option.pricing === "demand" && option.multiplier >= 1.2 && <Tag tone="warning">{option.multiplier.toFixed(1)}x demand</Tag>}
            </div>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p className="tabular text-lg font-semibold tracking-tight">{inr(price)}</p>
          <p className="tabular text-xs text-faint">
            {inr(option.low)}–{inr(option.high)}
          </p>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {selected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="border-t border-border px-4 pb-4 pt-3">
              <dl className="tabular mb-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                <dt className="text-muted-foreground">{option.pricing === "demand" ? "Base fare" : "Base fare (first 2 km)"}</dt>
                <dd className="text-right">{inr(option.breakdown.base)}</dd>
                <dt className="text-muted-foreground">Distance · {inr(option.breakdown.perKm)}/km</dt>
                <dd className="text-right">{inr(option.breakdown.distance)}</dd>
                {option.breakdown.time > 0 && (
                  <>
                    <dt className="text-muted-foreground">Time charge</dt>
                    <dd className="text-right">{inr(option.breakdown.time)}</dd>
                  </>
                )}
                <dt className="text-muted-foreground">Minimum fare</dt>
                <dd className="text-right">{inr(option.breakdown.minFare)}</dd>
                <dt className="text-muted-foreground">
                  {option.pricing === "meter" ? "Regulated meter" : option.pricing === "night" ? "Night meter (10 PM–5 AM)" : "Demand factor"}
                </dt>
                <dd className="text-right font-medium">{option.multiplier.toFixed(1)}x</dd>
              </dl>
              <button
                type="button"
                onClick={onContinue}
                className="focus-ring inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
              >
                Continue in {provider}
                <ExternalLink className="h-4 w-4" aria-hidden />
              </button>
              <p className="mt-2 text-center text-xs text-faint">The final fare is confirmed in the app.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}
