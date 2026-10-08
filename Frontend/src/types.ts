export type NavTab = 'home' | 'practices' | 'analytics' | 'best-practices' | 'review' | 'live-practice' | 'practice-setup' | 'history';

export interface InterviewConfig {
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  isCameraEnabled: boolean;
  isMicEnabled: boolean;
}

export interface QuestionResponse {
  id: string;
  question: string;
  response: string;
  feedback?: string;
  score?: number;
  timeSpent?: string;
}

export interface AttemptReview {
  attemptNumber: number;
  date: string;
  role: string;
  title: string;
  questions: QuestionResponse[];
  finalSummary: string;
  tips: string[];
  metrics: {
    confidence: number;
    technicalAccuracy: number;
    conciseness: number;
    overallScore: number;
  };
  codeProblem?: {
    question: string;
    language: string;
    starter_code: string;
    test_cases: Array<{ input: string; expected_output: string }>;
  };
  codeReview?: {
    verdict: string;
    score: number;
    summary: string;
    strengths: string[];
    improvements: string[];
    time_complexity: string;
    space_complexity: string;
    tests_passed: number;
    tests_total: number;
  };
  code?: string;
  language?: string;
}

export interface HistoryFolder {
  id: string;
  title: string;
  count: number;
  description: string;
  attempts: AttemptReview[];
}

export interface PracticeTrack {
  id: string;
  title: string;
  category: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  topics: string[];
  interviewers: Array<{ name: string; role: string; avatarColor: string }>;
  defaultCode: {
    language: string;
    code: string;
  };
  questions: string[];
}
