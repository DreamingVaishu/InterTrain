export interface CodeTestResult {
  status: string;
  stdout: string;
  stderr: string;
  compile_output: string;
  time: number | null;
  memory: number | null;
  exit_code: number | null;
  input: string;
  expected_output: string;
  passed: boolean;
}

export interface CodeReview {
  verdict: string;
  score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  time_complexity: string;
  space_complexity: string;
  tests_passed: number;
  tests_total: number;
}

export interface CodingProblem {
  question: string;
  language: string;
  starter_code: string;
  test_cases: Array<{ input: string; expected_output: string }>;
}

export interface SubmitCodeResult {
  problem: CodingProblem;
  results: CodeTestResult[];
  review: CodeReview;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function request<T>(path: string, options: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  if (!response.ok) throw new Error((await response.text()) || `Request failed: ${response.status}`);
  return response.json() as Promise<T>;
}

export function submitCode(sectionId: string, code: string, language: string) {
  return request<SubmitCodeResult>('/api/live-interview/submit-code', {
    method: 'POST',
    body: JSON.stringify({ section_id: sectionId, code, language }),
  });
}

export interface EvaluateCodeResult {
  verdict: 'Accepted' | 'Needs Improvement' | 'Rejected';
  score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  time_complexity: string;
  space_complexity: string;
  runtime_estimate?: string;
  memory_estimate?: string;
}

export function evaluateCode(
  sectionId: string,
  code: string,
  language: string,
  question: string
): Promise<EvaluateCodeResult> {
  return request<EvaluateCodeResult>('/api/evaluate-code', {
    method: 'POST',
    body: JSON.stringify({
      section_id: sectionId,
      code,
      language,
      question,
    }),
  });
}

export function runCode(code: string, language: string, testInput = '') {
  return request<{ stdout: string; stderr: string; exit_code: number | null; runtime_ms: number; error: string | null }>('/api/run-code', {
    method: 'POST',
    body: JSON.stringify({ code, language, test_input: testInput }),
  });
}


