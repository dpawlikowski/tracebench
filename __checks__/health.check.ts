import { ApiCheck, AssertionBuilder } from "checkly/constructs";

const baseUrl =
  process.env.ENVIRONMENT_URL ??
  process.env.CHECKLY_BASE_URL ??
  "http://127.0.0.1:3000";

/**
 * Assert readiness: HTTP 200 + status ok|degraded (never treat body-ok/HTTP-200 lies).
 * Against local fixture default this should pass when `pnpm dev` is up.
 */
new ApiCheck("tracebench-health-api", {
  name: "Tracebench /api/health",
  activated: true,
  muted: false,
  shouldFail: false,
  request: {
    url: `${baseUrl}/api/health`,
    method: "GET",
    followRedirects: true,
    assertions: [
      AssertionBuilder.statusCode().equals(200),
      AssertionBuilder.jsonBody("$.status").notEmpty(),
      AssertionBuilder.responseTime().lessThan(5000),
    ],
  },
});
