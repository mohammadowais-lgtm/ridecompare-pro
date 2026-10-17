import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { AuthScreen } from "@/components/AuthScreen";
import { takeNext, useSession } from "@/lib/session";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in · RideCompare" },
      { name: "description", content: "Sign in with Google or email to compare Uber, Ola and Rapido ride fares side by side." },
      { property: "og:title", content: "RideCompare — compare ride fares" },
      { property: "og:description", content: "Compare Uber, Ola and Rapido fares side by side and book in the app you choose." },
    ],
  }),
  component: Index,
});

function Index() {
  const { user, ready } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!ready || !user) return;
    navigate({ to: takeNext() ?? "/compare" });
  }, [ready, user, navigate]);

  if (!ready || user) {
    return (
      <div className="flex justify-center pt-16" role="status">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden />
        <span className="sr-only">Loading your account</span>
      </div>
    );
  }

  return (
    <div className="pt-4 sm:pt-8">
      <AuthScreen />
    </div>
  );
}
