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
- Evidence/source links kept and shown for every scheme
- Benefits and required documents shown only when supported by retrieved evidence
- Deadline information shown only when supported by evidence (checked, not just asserted)
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
2. Gemini generates several targeted search queries covering both Central and the citizen's state.
3. SerpApi performs those searches live against Google.
4. Results are filtered and ranked: official sources first, low-quality and other-state sources dropped
   when enough relevant official coverage exists.
5. Gemini reads the retrieved snippets, extracts distinct schemes, and evaluates eligibility against the
   citizen's profile using only that retrieved evidence.
6. The backend deduplicates schemes and returns a structured JSON response.
7. The frontend displays each scheme's eligibility status, the reasoning behind it, benefits, required
   documents, a deadline (when evidenced), an official application link, and its sources.

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

Safeguards implemented in the backend to keep results grounded in what was actually retrieved:

- **Official-source prioritization** — `.gov.in`/`.nic.in` sources are kept first; low-quality sources
  (coaching sites, blogs, news outlets) are dropped once enough official coverage exists.
- **Other-state source filtering** — an official source belonging to a different state than the citizen's
  is excluded from the authoritative set, so a Tamil Nadu request isn't diluted by another state's portal.
- **Scheme deduplication** — the same scheme found via multiple queries is merged into one entry with a
  combined source list, rather than shown twice.
- **Source URL sanitization** — any application link or source URL Gemini returns is checked against the
  URLs it was actually given; anything not present in the retrieved results is discarded.
- **Removal of unverifiable schemes** — a scheme with zero surviving verifiable sources is dropped
  entirely rather than shown without evidence.
- **Deadline evidence checking** — a deadline is only kept if it is actually grounded in the retrieved
  snippet text; otherwise it's returned as not specified rather than guessed.
- **Evidence-only instructions to Gemini** — the model is explicitly instructed to use only the retrieved
  snippets, never invent eligibility criteria, benefits, documents, deadlines, or links, and to treat
  retrieved web content as untrusted data rather than instructions.
- **Fallback query generation** — if the Gemini call that generates search queries fails or times out, a
  deterministic template-based query set (still built from the citizen's profile) keeps the SerpApi search
  running rather than failing the whole request.

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
| `MAX_SEARCH_QUERIES_PER_REQUEST` | No | Caps SerpApi calls per request (default 6) |
| `MAX_RESULTS_PER_QUERY` | No | Caps organic results kept per query (default 6) |

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
