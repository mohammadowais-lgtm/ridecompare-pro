import type { Provider } from "@/lib/fare-engine";
import { cn } from "@/lib/utils";

/** Brand-faithful wordmark tiles (colours and lettering styled after each app's own logo). */
export function ProviderLogo({ provider, size = 40 }: { provider: Provider; size?: number }) {
  const box = "grid shrink-0 place-items-center overflow-hidden rounded-md select-none";
  const style = { width: size, height: size };
  switch (provider) {
    case "uber":
      return (
        <span className={cn(box, "bg-uber text-uber-foreground")} style={style} aria-hidden>
          <span style={{ fontSize: size * 0.32, fontWeight: 500, letterSpacing: "-0.02em" }}>Uber</span>
        </span>
      );
    case "ola":
      return (
        <span className={cn(box, "bg-uber")} style={style} aria-hidden>
          <svg viewBox="0 0 40 40" width={size} height={size}>
            <circle cx="20" cy="20" r="10" fill="none" stroke="var(--ola)" strokeWidth="5" />
            <circle cx="20" cy="20" r="3" fill="var(--ola)" />
          </svg>
        </span>
      );
    case "rapido":
      return (
        <span className={cn(box, "bg-rapido text-uber")} style={style} aria-hidden>
          <span style={{ fontSize: size * 0.27, fontWeight: 800, fontStyle: "italic", letterSpacing: "-0.03em" }}>rapido</span>
        </span>
      );
    case "nammayatri":
      return (
        <span className={cn(box, "bg-uber text-nammayatri")} style={style} aria-hidden>
          <span className="text-center leading-[0.95]" style={{ fontSize: size * 0.22, fontWeight: 800 }}>
            namma
            <br />
            yatri
          </span>
        </span>
      );
  }
}
