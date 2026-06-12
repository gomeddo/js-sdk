# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`@gomeddo/sdk` is the published TypeScript client SDK for the GoMeddo (Booker25) APIs, meant to be used from the browser. It wraps GoMeddo's `/api/v3/proxy/` REST endpoints (backed by a Salesforce org) behind a fluent, typed object model so callers can search resources/dimensions, query reservations, compute availability and timeslots, run price calculations, and create/update/cancel reservations (including Frontend Builder flows) without dealing with raw HTTP or Salesforce field names directly.

## Tech Stack

- TypeScript (strict), targeting `es2015` (CJS) / `es2017` (ESM).
- Dual CJS + ESM build via two `tsc` projects.
- Jest + `ts-jest` for tests, `jest-fetch-mock` for HTTP mocking.
- `ts-standard` for lint/format, enforced via pre-commit.
- Package manager: **yarn**.

## Commands

```bash
yarn install              # install deps
yarn build                # build both CJS and ESM (build:cjs then build:esm)
yarn build:cjs            # CJS only -> dist/cjs (tsconfig.build.json)
yarn build:esm            # ESM only -> dist/esm (tsconfig.esm.json)
yarn jest                 # run all tests
yarn jest tests/s-objects/reservation.spec.ts   # run a single test file
yarn jest -t "name fragment"                     # run tests matching a name
yarn interactive          # build CJS, then open a Node REPL with the SDK preloaded
yarn release              # build + yarn publish --access public (publishes to npm)
```

`yarn interactive` (via `nodeSetup.js`) starts a REPL with `GoMeddo`, `Environment`, `Reservation`, `Condition`, etc. preloaded and a `goMeddo` instance pointing at `Environment.DEVELOP`. It requires the proxy API key in the `GOMEDDO_JS_SDK_KEY` env var and logs all outgoing HTTP requests.

Pre-commit hooks (`pre-commit install`) run `ts-standard --fix` and `jest` on every commit.

## Architecture

The public surface and how requests flow are spread across several layers — read these together:

- **`src/index.ts`** — the entry point. Exports the `GoMeddo` class plus the `Environment` enum and all public request/result/sObject types. `GoMeddo` is constructed with an API key + environment and exposes two kinds of methods:
  - `build*Request()` factory methods that hand back fluent request builders (e.g. `buildResourceRequest`, `buildReservationRequest`, `buildTimeSlotsRequest`, `buildBlueprint*Request`), each holding a reference to the shared `GoMeddoAPI`.
  - Direct async operations that take/return the domain objects (`saveReservation`, `updateReservation(s)`, `deleteReservation(s)`, `calculatePrice`, and the Frontend Builder methods `saveFrontendBuilderReservation`, `cancelFrontendBuilderReservation`, `generateChildReservation`, `getParentReservations`).

- **`src/api/gomeddo-api-requests.ts`** — `GoMeddoAPI`, the single HTTP layer. It maps `Environment` to a base URL (`dev`/`acc`/`staging`/`prod` `*.api.gomeddo.com/api/v3/proxy/`), builds each endpoint URL, sends `fetch` calls with a `Bearer <apiKey>` header, and on non-OK responses throws a `RequestError` wrapping a `GoMeddoApiError`. Note the Salesforce-package URL prefixes are meaningful: `B25/...` (core), `B25LP/...` (reservations/licensing), `GMFB/...` (Frontend Builder).

- **`src/api/request-bodies/`** — typed POST/PATCH/DELETE payload classes that serialize the fluent builders into the JSON the proxy expects (search bodies, availability requests, reservation save/collection requests, price calculation, blueprint bodies, Frontend Builder requests). These are the contract between the builders and `GoMeddoAPI`.

- **Request builders** (e.g. `src/resource-request.ts`, `reservation-request.ts`, `timeslots-request.ts`, `dimension-record-request.ts`, `blueprint-*-request.ts`) — fluent, chainable classes. `ResourceRequest extends DimensionRecordRequest`; builders accumulate filters/fields and on `getResults()` call into `GoMeddoAPI` and wrap the response in a `*Result` object.

- **`*-result.ts`** (e.g. `resource-result.ts`, `reservation-result.ts`, `timeslots-result.ts`) — result wrappers with lookup helpers over the returned records.

- **`src/s-objects/`** — the domain object model mirroring Salesforce SObjects (`SObject` base, `Reservation`, `Resource`, `Contact`, `Lead`, `Service`, `ServiceReservation`, `ResourceType`). These use raw Salesforce field API names (e.g. `B25__Start__c`, `B25__Title__c`) accessed via `getCustomProperty` / `setCustomProperty`. `GoMeddo.saveReservation` etc. read/write these field names directly when translating API responses back into objects.

- **`src/filters/conditions.ts`** — `Condition`, `AndCondition`, `OrCondition`, `Operator` used to build search filters passed through the request bodies as `APIConditionElement`.

- **`src/time-slots/`** — timeslot/availability value types (`TimeSlot`, `AvailabilityTimeSlot`, `ReservationTimeSlot`, `ServiceTimeSlot`, `ReservationCollectionTimeSlot`) produced by the availability/timeslot endpoints.

### Dual build

`tsconfig.build.json` emits CommonJS to `dist/cjs/` and `tsconfig.esm.json` emits ES modules to `dist/esm/`; both generate `.d.ts` declarations. `package.json` points `main` -> `dist/cjs/index.js`, `module` -> `dist/esm/index.js`, `types` -> `dist/cjs/index.d.ts`. The root `tsconfig.json` includes `tests/**` and is used for type-checking/tests, not for the published build. Only `dist/**` is published.

## Conventions

- The SDK relies on the global `fetch`; in Node contexts (REPL/tests) it is polyfilled (`node-fetch` in `nodeSetup.js`).
- Salesforce field API names are used as-is throughout the SObject layer — do not invent or rename them.
- Bump `GoMeddo.version` in `src/index.ts` together with the `version` in `package.json` when releasing.
