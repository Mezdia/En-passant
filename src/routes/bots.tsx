import BotsPage from "@/components/bots/BotsPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/bots")({
  component: BotsPage,
});
