import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AuthScreen } from "@/components/AuthScreen";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in · RideCompare" },
      { name: "description", content: "Sign in to compare Uber, Ola and Rapido ride fares side by side." },
      { property: "og:title", content: "RideCompare — compare ride fares" },
      { property: "og:description", content: "Compare Uber, Ola and Rapido fares side by side and book in the app you choose." },
    ],
  }),
  component: Index,
});

function Index() {
  const { setUser } = useSession();
  const navigate = useNavigate();
  return (
    <div className="pt-4 sm:pt-8">
      <AuthScreen
        onAuthenticated={(u) => {
          setUser(u);
          navigate({ to: "/location" });
        }}
      />
    </div>
  );
}
