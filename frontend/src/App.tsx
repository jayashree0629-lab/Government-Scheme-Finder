import { useState } from "react";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { SearchProgress } from "./components/SearchProgress";
import { Home } from "./pages/Home";
import { Results } from "./pages/Results";
import { searchSchemes, ApiError } from "./api/client";
import type { SearchApiResponse, UserProfileInput } from "./types/scheme";

type View = "home" | "loading" | "results";

export default function App() {
  const [view, setView] = useState<View>("home");
  const [result, setResult] = useState<SearchApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastProfile, setLastProfile] = useState<UserProfileInput | undefined>(undefined);

  function goHome() {
    setView("home");
    setError(null);
  }

  async function handleProfileSubmit(profile: UserProfileInput) {
    setView("loading");
    setError(null);
    setLastProfile(profile);
    try {
      const response = await searchSchemes(profile);
      setResult(response);
      setView("results");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something unexpected went wrong. Please try again.");
      setView("home");
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header onHomeClick={goHome} showNav={view === "home"} />

      <main className="flex-1">
        {view === "home" && <Home onSubmit={handleProfileSubmit} initialProfile={lastProfile} error={error} />}

        {view === "loading" && <SearchProgress />}

        {view === "results" && result && (
          <Results result={result} profile={lastProfile} onNewSearch={goHome} />
        )}
      </main>

      <Footer />
    </div>
  );
}
