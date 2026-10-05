#Demo

Watch the project demo - https://drive.google.com/file/d/1EqFLzOoZfk2CvJSDYlV-PV003CCXkBFc/view?usp=sharing

A short walkthrough demonstrating the live SerpApi search, Gemini-powered eligibility analysis, government scheme results, evidence, and source verification.

# AI Government Scheme & Benefits Finder

**Find government schemes and benefits you may be eligible for.**

An AI agent that turns a citizen's profile — or a plain-English question — into live government-web
research, using SerpApi for search and Google Gemini for reasoning. No scheme data is hardcoded; every
result comes from a fresh search performed at request time.

## Problem / Solution

Indian citizens looking for scholarships, subsidies, or welfare schemes have to know which scheme to look
for in the first place, then hunt across dozens of central and state government websites, each with its
own eligibility wording, documents, and deadlines. There is no single place to ask "what am I eligible
for?" in plain language.

This project lets a citizen provide a short profile (age, state, occupation, education, family income,
category) and/or ask a free-text question. The backend uses that input to run live, targeted searches
against government sources with **SerpApi**, then uses **Gemini** to read the retrieved evidence, extract
scheme details, and reason about eligibility — returning structured, cited results instead of a wall of
search links.

MVP scope: **Tamil Nadu + Central Government schemes.** The architecture (state-domain mapping, source
filtering, query generation) is not hardcoded to Tamil Nadu and can be extended to other states.

## Key Features

- Natural-language questions — no need to know a scheme's name
- Citizen profile-based scheme discovery (age, state, occupation, education, income, category)
- Live government web search via SerpApi (multiple targeted queries per request, not one generic search)
- Gemini-powered search-query generation and scheme extraction/eligibility analysis
- Official government-source prioritization, with low-quality and other-state sources filtered out
- Tamil Nadu + Central Government coverage
- Three-way eligibility classification: **Likely Eligible / Possibly Eligible / Doesn't Match**
- Per-scheme breakdown of **what matches your profile, what still needs confirmation, and what conflicts**
  with it — each backed by evidence, not a generic status alone
- Evidence/source links kept and shown for every scheme
- Benefits and required documents shown only when supported by retrieved evidence
- Deadline information shown only when supported by dated evidence and not already past
- Bounded retry: a government level (Central or the citizen's state) that returns too few useful official
  results is automatically retried with alternative query angles, within a fixed search budget
- Search-query transparency (the actual SerpApi queries are viewable, kept secondary in the UI)
- Friendly error and empty states for citizens, not raw error codes
- Responsive frontend (tested on desktop and mobile widths)
- No hardcoded scheme database — nothing to keep manually up to date
- API keys kept strictly on the backend, never exposed to the frontend

## Why SerpApi?

SerpApi is a **core, load-bearing part of this application** — not an optional or cosmetic integration.
There is no static list of schemes anywhere in this codebase; every request triggers real search traffic.

```
Citizen profile / question
  → Gemini generates several targeted search queries
  → SerpApi executes those queries as live Google searches
  → results are filtered and ranked for official/government relevance
  → Gemini analyzes the retrieved snippets
  → structured, cited scheme results are returned to the user
```

**Every search request retrieves fresh web results through SerpApi** — there is no caching layer or
fallback to stored scheme data. The application does not claim that every individual search result is a
government website; instead, it actively prioritizes authoritative `.gov.in`/`.nic.in` sources and filters
out irrelevant or low-quality ones (see [Evidence & Reliability](#evidence--reliability)) before handing
results to Gemini for analysis.

## How It Works

1. The citizen enters profile fields and/or a free-text question.
2. Gemini generates several targeted search queries, covering multiple kinds of benefit (scholarships, fee
   assistance, loans, welfare, skill training, etc.), for both Central and the citizen's state. If this call
   fails, deterministic profile-derived template queries are used instead, so retrieval never depends on it.
3. SerpApi performs those searches live against Google, scoped per government level.
4. Any level (Central or the citizen's state) that comes back with too few useful official results is
   retried with alternative query angles, within a fixed overall search budget — not unbounded retrying.
5. Results are filtered and ranked: official sources first, low-quality and other-state sources dropped
   when enough relevant official coverage exists.
6. Gemini reads the retrieved snippets, extracts distinct schemes, and evaluates eligibility against the
   citizen's profile using only that retrieved evidence — producing, per scheme, what **matches** the
   profile, what still **needs confirmation**, and what **conflicts** with it.
7. The backend deduplicates schemes, runs the evidence guards described below, and returns a structured
   JSON response.
8. The frontend displays each scheme's eligibility status, the matches/needs-confirmation/conflicts
   breakdown, benefits, required documents, a deadline (when evidenced), a clearly labelled source/
   application link, and its sources.

## Eligibility Logic

Every scheme is classified as exactly one of:

| Status | Meaning |
|---|---|
| `likely_eligible` | The profile satisfies the eligibility criteria stated in the retrieved sources |
| `possibly_eligible` | Eligibility is unclear, partial, or an important condition can't be determined from the profile/evidence available |
| `not_matching` | The profile clearly and explicitly fails a criterion stated in the sources |

`possibly_eligible` is the expected, normal outcome whenever a detail needed to fully decide (an exact
income cutoff, a category requirement, a merit threshold, etc.) is missing — the system does not guess or
invent that missing fact, and it does not drop the scheme just because the detail is unavailable. The
system never claims guaranteed eligibility or approval, regardless of status.

## Evidence & Reliability

Safeguards implemented in the backend to keep results grounded in what was actually retrieved. These are
deterministic checks applied after Gemini responds — they constrain the model's output rather than trusting
it outright:

- **Official-source prioritization** — `.gov.in`/`.nic.in` sources are kept first; low-quality sources
  (coaching sites, blogs, news outlets) are dropped once enough official coverage exists.
- **Other-state source filtering** — an official source belonging to a different state than the citizen's
  is excluded from the authoritative set, so a Tamil Nadu request isn't diluted by another state's portal.
- **Scheme deduplication** — the same scheme found via multiple queries is merged into one entry with a
  combined source list, rather than shown twice.
- **Source traceability** — a source is attached to a scheme only if it was actually among the URLs given
  to Gemini for that request *and* it is plausibly about that scheme (checked by name overlap); a source
  that doesn't clearly belong to the scheme is dropped rather than kept as loose "supporting" evidence.
- **Verbatim excerpt verification** — each source's evidence excerpt is checked against that source's own
  retrieved text; an excerpt that isn't actually present in the source falls back to the real retrieved
  snippet instead of being shown as a quote.
- **Numeric grounding** — amounts, percentages, and other figures mentioned in the eligibility summary,
  benefits, or match reasoning must appear either in the scheme's own retrieved evidence or in the
  citizen's own profile (e.g. their income); unsupported figures are stripped out.
- **Document grounding** — required documents are kept only when the evidence text actually names them.
- **Deadline grounding** — a deadline is kept only if it is grounded in dated evidence text *and* is not
  already in the past; otherwise it's returned as not specified rather than guessed.
- **Status consistency enforcement** — the three-way status is reconciled against the scheme's own
  matched/needs-confirmation/conflicts lists rather than taken as-is from the model:
  - any known conflict with a stated requirement forces `not_matching`;
  - a status of `not_matching` with no concrete conflict (e.g. the model's own reasoning admits the
    deciding fact is unknown) is downgraded to `possibly_eligible` — missing information is never treated
    as a mismatch;
  - `likely_eligible` requires both an empty conflicts list and an empty needs-confirmation list.
- **Removal of unverifiable schemes** — a scheme with zero surviving verifiable sources is dropped
  entirely rather than shown without evidence.
- **Honest link labelling** — a source/application link is only labelled "Apply on official portal" when
  the evidence shows that page is where one applies, and only when it's on an official government domain;
  otherwise it's labelled "Official information page" or, for a non-`.gov.in`/`.nic.in` source, flagged as
  not an official government site.
- **Evidence-only instructions to Gemini** — the model is explicitly instructed to use only the retrieved
  snippets, never invent eligibility criteria, benefits, documents, deadlines, or links, and to treat
  retrieved web content and the citizen's free-text input as untrusted data rather than instructions.
- **Fallback query generation** — if the Gemini call that generates search queries fails or times out, a
  deterministic template-based query set (still built from the citizen's profile) keeps the SerpApi search
  running rather than failing the whole request.

None of this makes eligibility results certain — see [Limitations / Disclaimer](#limitations--disclaimer).
It only ensures that what's shown traces back to something actually retrieved.

## Security & Reliability

- **API keys are backend-only** — `SERPAPI_API_KEY` and `GEMINI_API_KEY` are read only inside `backend/`;
  the frontend never receives either key in any form.
- **Rate limiting** on the search endpoint — a per-IP request limit over a short window, plus one shared
  hourly search budget across all clients, to bound SerpApi/Gemini usage.
- **Concurrent search limit** — only a small, configurable number of searches run at the same time; extra
  requests get a friendly "busy, try again shortly" response instead of being queued unbounded.
- **Prompt-input sanitization** — citizen free-text and profile fields are flattened to single lines,
  length-capped, and wrapped in a delimiter before being placed in the Gemini prompt, so neither the
  citizen's own text nor a scraped web snippet can inject fake instructions into the model.
- **Generic error responses** — client-facing errors never leak upstream provider error text, stack
  traces, or request internals; details go to the server log only.
- **http(s)-only links** — every link returned by the backend or rendered by the frontend is checked to be
  a plain `http`/`https` URL before it's shown or followed; anything else (e.g. a `javascript:` URL) is
  discarded.
- **Protection against unsupported AI-generated claims** — see [Evidence & Reliability](#evidence--reliability)
  above; it is the main defense against the model asserting something the retrieved evidence doesn't
  support.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Search | SerpApi |
| AI | Google Gemini, via the official `@google/genai` SDK |

## Architecture

```
Frontend (React)
      ↓
Backend API (Express)
      ↓
Gemini — query generation
      ↓
SerpApi — live government search
      ↓
Source filtering / ranking
      ↓
Gemini — scheme extraction + eligibility reasoning
      ↓
Structured JSON results
      ↓
Frontend
```

```
backend/   Node.js + Express + TypeScript API (SerpApi + Gemini orchestration)
frontend/  React + Vite + TypeScript + Tailwind CSS UI
```

`SERPAPI_API_KEY` and `GEMINI_API_KEY` are read only inside `backend/`; the frontend calls only the
backend's own `/api/*` routes and never sees either key.

## Setup

### Prerequisites

- Node.js 18+ (tested on Node 24)
- A [SerpApi](https://serpapi.com/manage-api-key) API key
- A [Google Gemini](https://aistudio.google.com/app/apikey) API key (free tier available via Google AI Studio)

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

### Troubleshooting a fresh clone

- `backend/.env` does not exist until you copy it from `backend/.env.example` — the server will start and
  `/api/health` will respond, but every search will fail (503) until you've filled in real keys.
- A real `SERPAPI_API_KEY` and `GEMINI_API_KEY` are both required for an actual search to return results;
  there is no mock/offline mode.
- The frontend talks to the backend via `VITE_API_BASE_URL` (see below) — it never reads or needs either
  API key. Do not put `SERPAPI_API_KEY` or `GEMINI_API_KEY` in `frontend/.env.local` or anywhere under
  `frontend/`.

## Environment Variables

**`backend/.env`** — must never be committed (it's gitignored). API keys are backend-only; the frontend
never receives `SERPAPI_API_KEY` or `GEMINI_API_KEY` in any form.

| Variable | Required | Purpose |
|---|---|---|
| `SERPAPI_API_KEY` | Yes | Live Google search of government sources |
| `GEMINI_API_KEY` | Yes | Query generation + scheme extraction/eligibility reasoning |
| `GEMINI_MODEL` | No | Defaults to `gemini-3.5-flash-lite` |
| `PORT` | No | Defaults to `3001` |
| `FRONTEND_ORIGIN` | No | CORS allow-list, defaults to `http://localhost:5173` |
| `MAX_RESULTS_PER_QUERY` | No | Caps organic results kept per query (default 6) |
| `MAX_QUERIES_PER_LEVEL` | No | First-round search queries per government level (default 4) |
| `MAX_RETRY_QUERIES_PER_LEVEL` | No | Extra retry queries for a level with too few useful results (default 2) |
| `MAX_TOTAL_SEARCH_QUERIES` | No | Absolute cap on SerpApi searches for one request, both rounds and levels combined (default 12) |
| `MIN_USEFUL_RESULTS_PER_LEVEL` | No | Official, relevant results a level needs before retries stop (default 3) |
| `MAX_SEARCHES_PER_HOUR` | No | Shared hourly search budget across all clients (default 150) |
| `MAX_CONCURRENT_SEARCHES` | No | Searches allowed to run at the same time (default 4) |
| `MAX_SEARCH_QUERIES_PER_REQUEST` | No | **Deprecated, no longer used** — superseded by `MAX_TOTAL_SEARCH_QUERIES`. Safe to leave unset. |

**`frontend/.env.local`**

| Variable | Required | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | No | Defaults to `http://localhost:3001` |

`GET /api/health` reports whether both keys are configured on the server, without exposing their values.

## AI Tools Used

**AI used by the application (runtime):**
- **Google Gemini** (`@google/genai` SDK) — generates the SerpApi search queries and performs scheme
  extraction / eligibility reasoning over the retrieved evidence. This is the only AI model the running
  application calls.

**AI tools used during development (not part of the running application):**
- **Claude** (Anthropic) was used as a coding assistant while building this project. Claude is not called
  by the application at runtime and plays no role in generating search queries or eligibility results.

## Limitations / Disclaimer

- The MVP currently focuses on **Tamil Nadu + Central Government** schemes.
- Results depend entirely on what is available in the web sources retrieved at request time.
- Government scheme rules, benefits, and deadlines can change and may not always be reflected in the
  latest search results.
- This system provides **informational guidance only**.
- Results **do not guarantee eligibility, approval, or receipt of benefits**.
- Always verify eligibility, required documents, deadlines, and application steps on the official
  government source linked in each result before applying.

## SerpApi India Hackathon 2026

This project was built for the **SerpApi India Hackathon 2026**.

Intended track: **Knowledge & Public Interest**

It demonstrates a meaningful, load-bearing use of SerpApi — live, multi-query government search driving
every result the application returns — combined with Gemini for reasoning over that retrieved evidence, in
service of helping citizens discover public-benefit information they may otherwise miss.

## Verified Working

- Frontend and backend both typecheck and build successfully.
- The live SerpApi → Gemini pipeline has been tested end-to-end with real API keys and returned genuine
  government scheme results (not mock data), correctly classified across all three eligibility statuses
  with real `.gov.in`/`.nic.in` sources.
- The responsive UI has been tested at both desktop and mobile widths.
- Eligibility badges, "why this match" reasoning, evidence/sources, and the disclaimer are all confirmed
  to render correctly against real backend responses.
