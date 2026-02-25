
import { defineConfig } from "cypress";

export const baseUrl = "http://localhost:5173";

export default defineConfig({
  e2e: {
    baseUrl,
  },
});
