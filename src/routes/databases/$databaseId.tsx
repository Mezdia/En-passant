import DatabaseView from "@/components/databases/DatabaseView";

import { createFileRoute } from "@tanstack/react-router";

import { z } from "zod";

const paramsSchema = z.object({
  databaseId: z.string(),
});

// TODO: Debug - validateParams API issue
// Expected: should be 'validate' not 'validateParams' in TanStack Router v1
// console.log('Route config for /databases/$databaseId:', {
//   component: DatabaseView,
//   validateParams: paramsSchema,
// });

export const Route = createFileRoute("/databases/$databaseId")({
  component: DatabaseView,
});
