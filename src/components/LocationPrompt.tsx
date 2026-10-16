import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { Button, Card } from "./ui-kit";
import { requestPosition, type Coords } from "@/lib/session";

export function LocationPrompt({ onDone }: { onDone: (c: Coords | null) => void }) {
  const [loading, setLoading] = useState(false);
  const [denied, setDenied] = useState(false);

  async function allow() {
    setLoading(true);
    try {
      const c = await requestPosition();
      onDone(c);
    } catch {
      setDenied(true);
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="mx-auto w-full max-w-[420px] p-6 sm:p-8">
        <span className="grid h-11 w-11 place-items-center rounded-md bg-primary-tint text-primary">
          <MapPin className="h-5 w-5" aria-hidden />
        </span>
        <h1 className="mt-5 text-xl font-semibold tracking-tight">Set your pickup automatically</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Your location is used only while the app is open to fill in the pickup point. It is never tracked in the
          background or shared.
        </p>

        {denied && (
          <div role="status" className="mt-5 rounded-md border border-border bg-muted px-3 py-2.5 text-sm text-muted-foreground">
            Location isn't available right now. You can enter your pickup manually instead.
          </div>
        )}

        <div className="mt-6 space-y-2">
          {denied ? (
            <Button onClick={() => onDone(null)}>Continue with manual entry</Button>
          ) : (
            <Button onClick={allow} loading={loading}>
              {loading ? "Locating" : "Allow location access"}
            </Button>
          )}
          {!denied && (
            <Button variant="text" className="w-full" onClick={() => onDone(null)}>
              Enter pickup manually
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
