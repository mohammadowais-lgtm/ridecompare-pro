import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LocationPrompt } from "@/components/LocationPrompt";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/location")({
  head: () => ({
    meta: [
      { title: "Set your pickup · RideCompare" },
      { name: "description", content: "Allow location access to fill your pickup point automatically." },
      { property: "og:title", content: "Set your pickup · RideCompare" },
      { property: "og:description", content: "Your location is used only while the app is open." },
    ],
  }),
  component: LocationPage,
});

function LocationPage() {
  const { user, setCurrentLocation } = useSession();
  const navigate = useNavigate();
  useEffect(() => {
    if (!user) navigate({ to: "/" });
  }, [user, navigate]);
  if (!user) return null;
  return (
    <div className="pt-4 sm:pt-8">
      <LocationPrompt
        onDone={(c) => {
          setCurrentLocation(c);
          navigate({ to: "/compare" });
        }}
      />
    </div>
  );
}
