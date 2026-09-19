import { setupServer } from "msw/node";
import { handlers } from "./handlers";

/** Node Vitest contract / unit mock server (same handlers as Storybook). */
export const server = setupServer(...handlers);
