import { BookOpen, CheckCircle2, ShieldAlert, Sparkles, MessageSquare, Code2, Compass } from 'lucide-react';

export function BestPracticesView({ onStartPractice }: { onStartPractice: () => void }) {
  const guides = [
    {
      title: 'The STAR Framework for Behavioral Rounds',
      category: 'Interview Strategy',
      summary: 'Structure responses clearly without rambling into conversational drift.',
      points: [
        'Situation: Set context in 1-2 sentences. Name the team, scale, and constraints.',
        'Task: State your explicit personal responsibility in the challenge.',
        'Action: The core 70% of your answer. Walk through technical trade-offs and code choices.',
        'Result: Deliverable outcomes with concrete metrics (e.g., latency dropped 35%, 0 downtime).',
      ],
    },
    {
      title: 'Real-Time Live Coding Communication',
      category: 'Technical Execution',
      summary: 'How to converse with Gemini & Claude while writing production-grade algorithms.',
      points: [
        'Clarify assumptions, edge cases (null inputs, empty lists), and time/space constraints first.',
        'Verbalize your mental model before typing code: propose brute-force, then optimize.',
        'Dry-run code manually with a small test input before clicking Run.',
        'Acknowledge hints gracefully: AI interviewers evaluate your adaptability to feedback.',
      ],
    },
    {
      title: 'System Design Architecture Blueprints',
      category: 'Architecture',
      summary: 'High-level distributed systems guidelines for Senior & Lead candidates.',
      points: [
        'Scope the system: QPS, read/write ratio, availability SLAs (e.g., 99.99%).',
        'Define schema and API contracts before drawing network topologies.',
        'Mitigate single points of failure with health-checked load balancers and replicas.',
        'Handle cache invalidation and distributed consistency boundaries (CAP theorem).',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#DCDFE2] text-neutral-900 p-6 md:p-10 lg:p-12">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <p className="text-xl md:text-2xl font-medium text-neutral-800">
            Curated Knowledge Base
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-neutral-950 tracking-tight mt-1 font-sans">
            Best Practices
          </h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {guides.map((guide, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-7 shadow-sm border border-neutral-200/80 flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-bold text-[#0c3e74] uppercase tracking-wider">
                  {guide.category}
                </span>
                <h3 className="text-xl font-bold text-neutral-900 mt-2 mb-3">
                  {guide.title}
                </h3>
                <p className="text-sm text-neutral-600 mb-6">
                  {guide.summary}
                </p>

                <div className="space-y-3 pt-4 border-t border-neutral-100">
                  {guide.points.map((pt, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-2.5 text-xs text-neutral-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-neutral-100">
                <button
                  onClick={onStartPractice}
                  className="w-full py-2.5 rounded-xl bg-neutral-100 hover:bg-[#0c3e74] text-neutral-800 hover:text-white text-xs font-bold transition-colors text-center"
                >
                  Practice this technique →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
