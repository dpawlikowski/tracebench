# Help system

In-app help for Portfolio Demo Mode (`AGENT_TRANSPORT=fixture`, `JEV_ADAPTER=mock`, `EVAL_SCORER=mock-jev`, `OPS_TELEMETRY=fixture`).

- Hub: `/help` — English articles (getting started → transports/health)
- FAQ: `/help/faq` — screenshot walkthrough of Demo Mode surfaces
- Contextual `?` (`HelpTip`) on Timeline panel, Approvals, Evals, Policy, Ops Trace
- React Joyride v3 first-run tour (`tb.tour.seen`); restart from Help or ⌘K
- Auto-tour disabled for Playwright (`navigator.webdriver`), `PLAYWRIGHT=1`, or `?tour=0`
- `public/llms.txt` summarizes product for AIs — see [llms.txt](../apps/web/public/llms.txt)

## Business story

Cinematic narrative at `/story` (also linked from Help → Why Tracebench). Metrics are illustrative. Marketing motion: [MARKETING_MOTION_V2.md](./MARKETING_MOTION_V2.md).

## Related

`/architecture` · `/ops` · `/policy` · failure gallery under `/help/*` · docs map [INDEX.md](./INDEX.md)
