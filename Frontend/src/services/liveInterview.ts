import type { CodingProblem, CodeReview, CodeTestResult } from './codeExecution';

export interface InterviewEvaluation {
  overall_score: number;
  technical_accuracy: number;
  communication: number;
  conciseness: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  coding_problem?: CodingProblem;
  code_submission?: { language: string; code: string };
  code_execution?: CodeTestResult[];
  code_review?: CodeReview;
}

export interface LiveInterviewResult {
  section_id: string;
  round: number;
  total_rounds: number;
  question?: string;
  audio_url?: string;
  completed: boolean;
  round_type?: 'interview' | 'coding';
  coding_problem?: CodingProblem;
  explanation_saved?: boolean;
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

export function completeLiveInterview(sectionId: string) {
  return request<InterviewEvaluation>('/api/live-interview/complete', {
    method: 'POST',
    body: JSON.stringify({ section_id: sectionId }),
  });
}

export function submitLiveAnswer(sectionId: string, answer: string) {
  return request<LiveInterviewResult>('/api/live-interview/answer', {
    method: 'POST',
    body: JSON.stringify({ section_id: sectionId, answer }),
  });
}


export function generateHistorySummary(payload: {
  subject: string;
  questions: Array<{ question: string; response: string }>;
  code?: string;
  language?: string;
  code_problem?: unknown;
  code_review?: unknown;
}) {
  return request<{ summary: string }>('/api/summarize-history', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function skipLiveQuestion(sectionId: string) {
  return request<LiveInterviewResult>('/api/live-interview/answer', {
    method: 'POST',
    body: JSON.stringify({ section_id: sectionId, answer: '[Skipped by candidate]' }),
  });
}
