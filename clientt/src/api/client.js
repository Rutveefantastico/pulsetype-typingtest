const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

async function handleResponse(response) {
  if (response.status === 401) {
    const error = new Error("Authentication required");
    error.code = 401;
    throw error;
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.detail || "Something went wrong");
  }

  return response.json();
}

export async function fetchText(difficulty, timeLimit = 60) {
  const response = await fetch(
    `${API_BASE_URL}/text?difficulty=${encodeURIComponent(difficulty)}&time_limit=${encodeURIComponent(timeLimit)}`,
    { credentials: "include" }
  );
  return handleResponse(response);
}

export async function saveResult(payload) {
  const response = await fetch(`${API_BASE_URL}/result`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

export async function fetchLeaderboard(limit = 10, difficulty = "") {
  const params = new URLSearchParams({ limit: String(limit) });
  if (difficulty) {
    params.set("difficulty", difficulty);
  }

  const response = await fetch(`${API_BASE_URL}/leaderboard?${params.toString()}`, {
    credentials: "include",
  });
  return handleResponse(response);
}

export async function fetchSession() {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    credentials: "include",
  });
  return handleResponse(response);
}

export async function logoutUser() {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  return handleResponse(response);
}

export async function fetchDashboard() {
  const response = await fetch(`${API_BASE_URL}/user/stats`, {
    credentials: "include",
  });
  return handleResponse(response);
}

export async function fetchAuthProviders() {
  const response = await fetch(`${API_BASE_URL}/auth/providers`, {
    credentials: "include",
  });
  return handleResponse(response);
}

export async function fetchUserProfile() {
  const response = await fetch(`${API_BASE_URL}/user/profile`, {
    credentials: "include",
  });
  return handleResponse(response);
}

export async function updateUserProfile(payload) {
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("theme_preference", payload.theme_preference);
  formData.append("preferred_difficulty", payload.preferred_difficulty);
  formData.append("preferred_time_limit", String(payload.preferred_time_limit));
  formData.append("typing_sound", String(payload.typing_sound));

  if (payload.profile_pic_url) {
    formData.append("profile_pic_url", payload.profile_pic_url);
  }
  if (payload.profile_pic_file) {
    formData.append("profile_pic_file", payload.profile_pic_file);
  }

  const response = await fetch(`${API_BASE_URL}/user/profile/update`, {
    method: "PUT",
    credentials: "include",
    body: formData,
  });
  return handleResponse(response);
}

export async function fetchRecommendations() {
  const response = await fetch(`${API_BASE_URL}/user/recommendations`, {
    credentials: "include",
  });
  return handleResponse(response);
}
