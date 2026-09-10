export interface LiveInterviewResult {
  section_id: string;
  round: number;
  total_rounds: number;
  question?: string;
  audio_url?: string;
  completed: boolean;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function request<T>(path: string, options: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function startLiveInterview(sectionId: string, subject: string, difficulty: string) {
  return request<LiveInterviewResult>('/api/live-interview/start', {
    method: 'POST',
    body: JSON.stringify({ section_id: sectionId, subject, difficulty }),
  });
}

export function submitLiveAnswer(sectionId: string, answer: string) {
  return request<LiveInterviewResult>('/api/live-interview/answer', {
    method: 'POST',
    body: JSON.stringify({ section_id: sectionId, answer }),
  });
}
