// eslint-disable-next-line @typescript-eslint/no-explicit-any
const API_BASE: string = (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:8000';

export interface RunCodeResult {
  stdout: string;
  stderr: string;
  exit_code: number;
  runtime_ms: number;
  error: string | null;
}

export interface EvaluateCodeResult {
  verdict: 'Accepted' | 'Needs Improvement' | 'Rejected';
  score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  time_complexity: string;
  space_complexity: string;
  runtime_estimate: string;
  memory_estimate: string;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(API_BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Request failed: ' + String(res.status));
  }
  return res.json() as Promise<T>;
}

export function runCode(code: string, language: string, testInput?: string): Promise<RunCodeResult> {
  return postJson<RunCodeResult>('/api/run-code', {
    code,
    language,
    test_input: testInput ?? '',
  });
}

export function evaluateCode(
  sectionId: string,
  code: string,
  language: string,
  question: string,
): Promise<EvaluateCodeResult> {
  return postJson<EvaluateCodeResult>('/api/evaluate-code', {
    section_id: sectionId,
    code,
    language,
    question,
  });
}
