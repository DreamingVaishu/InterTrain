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
