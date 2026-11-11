import { defineConfig } from "@neon/config/v1";

// Seeded by `neon config init --from-branch` from main.
// The AI Gateway is not readable from a branch (always available, credential-gated), so add
// `aiGateway: true` if the policy should declare it.
export default defineConfig({
  auth: true,
  dataApi: true,
  buckets: {
    "profile-photos": { access: "public_read" },
    offers: { access: "public_read" },
  },
});
