# AI Government Scheme & Benefits Finder

A citizen enters a short profile (age, state, occupation, education, family income, category) or asks a
plain-English question. The backend uses **SerpApi** to run several live, targeted Google searches against
official Indian government sources, then an AI agent (**Google Gemini**) extracts scheme details and compares
them against the profile — returning cited, evidence-backed results. No scheme data is hardcoded; every
result comes from a live search performed at request time.

MVP scope: Tamil Nadu + Central Government schemes (architecture supports any state).

## Project structure

```
backend/   Node.js + Express + TypeScript API (SerpApi + Gemini orchestration)
frontend/  React + Vite + TypeScript + Tailwind CSS UI
```

## Prerequisites

- Node.js 18+ (tested on Node 24)
- A [SerpApi](https://serpapi.com/manage-api-key) API key
- A [Google Gemini](https://aistudio.google.com/app/apikey) API key (free tier available via Google AI Studio)

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env` and fill in:

```
SERPAPI_API_KEY=your_real_serpapi_key
GEMINI_API_KEY=your_real_gemini_key
```

Leave the other values as-is unless you know you need to change them.

Run it:

```bash
npm run dev
```

The API listens on `http://localhost:3001`. Confirm it's up:

```bash
curl http://localhost:3001/api/health
```

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Open the URL Vite prints (`http://localhost:5173`).

## Environment variables

**`backend/.env`** (never commit this file)

| Variable | Required | Purpose |
|---|---|---|
| `SERPAPI_API_KEY` | Yes | Live Google search of government sources |
| `GEMINI_API_KEY` | Yes | Query generation + scheme extraction/eligibility reasoning |
| `GEMINI_MODEL` | No | Defaults to `gemini-2.5-flash` |
| `PORT` | No | Defaults to `3001` |
| `FRONTEND_ORIGIN` | No | CORS allow-list, defaults to `http://localhost:5173` |
| `MAX_SEARCH_QUERIES_PER_REQUEST` | No | Caps SerpApi calls per request (default 6) |
| `MAX_RESULTS_PER_QUERY` | No | Caps organic results kept per query (default 6) |

**`frontend/.env.local`**

| Variable | Required | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | No | Defaults to `http://localhost:3001` |

API keys live only in `backend/.env` and are never sent to or read by the frontend.

## How a request flows

```
POST /api/search { age, state, occupation, education, familyIncome, category, freeText }
  -> Gemini generates up to 6 targeted search queries (falls back to template queries if Gemini errors)
  -> Each query is run live through SerpApi (in parallel, deduplicated by URL)
  -> Results are ranked so .gov.in / .nic.in sources come first
  -> Gemini extracts scheme details from the ranked results and assigns
     likely_eligible / possibly_eligible / not_matching, using ONLY the provided snippets
  -> Response returns { queries, schemes, warnings, generatedAt }
```

`GET /api/health` reports whether both API keys are configured, without exposing their values.

## Notable implementation decisions

- **No database.** The MVP is stateless by design — this makes it unambiguous that every result comes
  from a live search, not a cached table. See the architecture discussion earlier for the rationale.
- **Combined extraction + eligibility call.** To keep the agent fast and simple for the MVP, scheme
  extraction and eligibility comparison happen in a single structured Gemini call rather than two —
  the prompt still enforces "only use provided snippets, never invent facts."
- **Gemini SDK.** Uses Google's official `@google/genai` package (`GoogleGenAI` client,
  `ai.models.generateContent`), with `responseMimeType: "application/json"` requested for reliable
  structured output. Default model is `gemini-3.5-flash-lite` (see "Gemini model notes" below for why).
- **Defensive sanitization.** After Gemini responds, the backend strips any `applicationLink` or
  `sources[].url` that wasn't actually present in the SerpApi results it was given, and drops any scheme
  left with zero verifiable sources. This is a safety net against hallucinated links, on top of the prompt
  instructions.
- **TypeScript 7 / `tsx`.** `npm install typescript` currently resolves to TypeScript 7, which broke
  `ts-node-dev`'s internal API. The backend dev server uses `tsx` instead, which has no such issue.
- **Tailwind v4.** Installed via `@tailwindcss/vite` (no `tailwind.config.js` needed) — styling lives in
  `frontend/src/index.css`.
- **No router library.** The frontend is a single-page state machine (`home` → `form` → `loading` →
  `results`) inside `App.tsx` rather than React Router — there's no deep-linking requirement for the MVP,
  so this avoids an extra dependency.
- **In-memory rate limiting** on `/api/search` (15 requests / 5 minutes per IP) keeps SerpApi/Gemini usage
  bounded during the demo. Not distributed-safe — fine for a single-instance hackathon deployment.

## Verified working

- Backend and frontend both typecheck and build cleanly.
- `GET /api/health`, `POST /api/search` validation, 404 handling, and CORS all verified with `curl`.
- Full UI flow (Home → Profile form → Loading → error display with preserved form values) verified in
  a browser.
- End-to-end live search (SerpApi + Gemini actually returning scheme results) **has been verified** with
  real API keys, using profile: age 21, Tamil Nadu, engineering student, undergraduate, family income
  ₹75,000, General category — both before and after the result-quality improvements below.
  - First pass: 6 AI-generated queries → 31 unique live SerpApi results → 8 real schemes extracted (Post
    Matric Scholarship, PM-USP Central Sector Scheme, PM-Vidyalaxmi, etc.).
  - After the quality/reliability pass: 6 AI-generated queries correctly covering both `scholarships.gov.in`
    /`aicte-india.org` (Central) and `tn.gov.in`/`tnschools.gov.in` (Tamil Nadu) → 1 high-confidence scheme
    (Central Sector Scheme of Scholarship, `possibly_eligible`, merit criterion named as the missing fact)
    with 3 merged sources, zero other-state noise. Fewer results than the first pass, but each one is
    higher-precision — a direct, expected effect of the stricter official-source and relevance rules.

## Gemini model notes (found while testing with a real key)

- `gemini-2.5-flash` and `gemini-2.5-pro` return **404 "no longer available to new users"** on a fresh
  Google AI Studio key — Google has retired them for new accounts.
- `gemini-3.6-flash` and `gemini-flash-latest` returned **503 "high demand"** repeatedly during testing —
  they exist and are valid, just capacity-constrained on the free tier at times.
- **`gemini-3.5-flash-lite` worked reliably** and is now the default (`GEMINI_MODEL` in `.env.example`). If
  you hit 404s or 503s with a different key/quota, run this to see what your specific key can actually call,
  and pick another model from the list if needed:

  ```bash
  cd backend
  node -e "
  require('dotenv').config();
  const { GoogleGenAI } = require('@google/genai');
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  (async () => {
    const pager = await ai.models.list();
    for await (const m of pager) if (m.supportedActions?.includes('generateContent')) console.log(m.name);
  })();
  "
  ```
- The agent's fallback query-generation (template queries, see `geminiService.ts`) is not just theoretical —
  it was actually triggered during testing when Gemini returned a transient 503, and the pipeline still
  completed successfully end-to-end using SerpApi with the fallback queries.

## Result-quality and reliability improvements

Made after the first successful live runs surfaced real quality issues (see below) — all in
`agentService.ts`, `geminiService.ts`, and two utils:

- **Official-source priority is now enforced in code, not just prompt text.** New
  `selectAuthoritativeSources()` in `domainFilter.ts`: keeps official `.gov.in`/`.nic.in` sources first,
  and **drops** blogs/coaching sites/news outlets (`isLowQualitySource`, a real domain block-list —
  byjus, shiksha, collegedunia, timesofindia, etc.) **entirely** whenever at least one relevant official
  source exists, instead of just ranking them lower. They're only kept as a last resort if zero official
  sources were found at all (with a warning surfaced to the user).
- **State-relevance filtering (new — this was a real bug found during testing).** The first
  post-migration test run got diluted by *other states'* official portals (`odisha.gov.in`,
  `gujarat.gov.in`, `up.gov.in`, Telangana's `cgg.gov.in`) showing up as "official" sources for a Tamil
  Nadu citizen, since a generic query pulled in every state's scholarship portal. Added
  `stateDomains.ts` (a state-name → domain-token map) and `isOtherStateGovernmentSource()`: an official
  domain belonging to a *different* state than the citizen's is now excluded from the authoritative set
  the same way a low-quality source is. Central-level domains (`scholarships.gov.in`, `myscheme.gov.in`,
  ministry sites, etc.) are never affected by this.
- **Guaranteed Central + state query coverage.** `ensureCentralAndStateCoverage()` in `agentService.ts`
  inspects the query list Gemini returned and injects a Central-government query and/or a state-specific
  query (using the correct domain from `stateDomains.ts` — e.g. `tn.gov.in`, not a guessed
  `tamilnadu.gov.in`) if either angle is missing, without exceeding the per-request query cap.
- **Scheme deduplication.** `dedupeSchemes()` in `agentService.ts` merges schemes with the same normalized
  name (found via different queries) into one entry with a combined, de-duplicated source list, rather
  than showing the same scheme twice.
- **Stronger, more specific prompts** in `geminiService.ts`: explicit instruction to prefer an official
  source's facts over a conflicting non-official one; `possibly_eligible` is now explicitly required
  whenever a specific eligibility condition needed to decide is simply missing from the profile (never
  guess it); explicit instruction to silently skip schemes with no plausible connection to the citizen's
  profile/question; `matchReason` must now name the specific criterion, not a generic statement.
- **Deadline evidence-check.** New `isDeadlineSupportedByEvidence()`: a `deadline` is only kept if at
  least one distinctive word from it actually appears in the combined text of its own sources — a
  fabricated deadline with no grounding in the retrieved snippets gets nulled out defensively, on top of
  the prompt instruction not to invent one.
