import type { SearchApiResponse, UserProfileInput } from "../types/scheme";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export class ApiError extends Error {}

export async function searchSchemes(profile: UserProfileInput): Promise<SearchApiResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
  } catch {
    throw new ApiError("We couldn't reach the server. Please check your internet connection and try again.");
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new ApiError("The server returned an unexpected response. Please try again.");
  }

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "error" in data && typeof (data as { error: unknown }).error === "string"
        ? (data as { error: string }).error
        : "The search request failed. Please try again.";
    throw new ApiError(message);
  }

  return data as SearchApiResponse;
}
