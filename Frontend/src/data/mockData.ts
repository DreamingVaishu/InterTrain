import { HistoryFolder, PracticeTrack } from '../types';

export const INITIAL_FOLDERS: HistoryFolder[] = [
  {
    id: 'devops',
    title: 'DevOps',
    count: 12,
    description: 'CI/CD pipelines, Kubernetes, Docker, AWS infrastructure, and site reliability engineering.',
    attempts: [
      {
        attemptNumber: 1,
        date: 'Oct 14, 2026',
        role: 'DevOps Engineer',
        title: 'DevOps',
        questions: [
          {
            id: 'q1',
            question: 'Introduce yourself and tell me your past exprence and the works you did',
            response: 'Helloo uhh... i am billu and i dont know how am i even here but you can trust me with your system..... uhh and i am good at it...really',
            score: 38,
            feedback: 'Opening lacks professional positioning. Outline your technical focus and career milestones concisely.',
          },
          {
            id: 'q2',
            question: 'As you said we can trust you with the work but it not enough what are your past experience',
            response: 'I have work in Chugal for 1 years',
            score: 45,
            feedback: 'Too abrupt. Expand on what technologies you managed at Chugal, cluster scale, and key achievements.',
          },
          {
            id: 'q3',
            question: 'How do you design zero-downtime deployments on Kubernetes when database migrations are involved?',
            response: 'We configure readiness probes, use rolling updates or blue-green switchovers, and apply backward-compatible database schema migrations in advance.',
            score: 74,
            feedback: 'Good technical clarity on backward compatible migrations and readiness probes.',
          },
          {
            id: 'q4',
            question: 'Tell us about a time when a production incident occurred and how you handled root cause analysis.',
            response: 'A memory leak brought down the ingress pod. I inspected Prometheus metrics, isolated the offending worker service, triggered a rollback, and patched the leak.',
            score: 80,
            feedback: 'Structured and clear emergency response flow.',
          }
        ],
        finalSummary: 'You are very off the point and less cofident for this round and your answer is so short',
        tips: [
          'Structure answers using the STAR method (Situation, Task, Action, Result) to avoid conversational drift.',
          'State concrete metrics (e.g. 99.95% uptime, 40% build time reduction) to back up your claims.',
          'Eliminate hesitant filler words like "uhh" and self-deprecating humor in professional rounds.',
          'Elaborate on real Kubernetes architecture choices, helm chart practices, and monitoring stacks.'
        ],
        metrics: {
          confidence: 42,
          technicalAccuracy: 68,
          conciseness: 52,
          overallScore: 54
        }
      },
      {
        attemptNumber: 2,
        date: 'Oct 18, 2026',
        role: 'DevOps Engineer',
        title: 'DevOps',
        questions: [
          {
            id: 'q1-att2',
            question: 'Introduce yourself and highlight your expertise in container orchestration.',
            response: 'Hi, I am a DevOps engineer with 4 years of experience designing scalable Kubernetes clusters, optimizing CI/CD workflows, and cutting cloud infrastructure costs.',
            score: 88,
            feedback: 'Strong, articulate opening with clear domain authority.'
          },
          {
            id: 'q2-att2',
            question: 'How do you safeguard secret management in GitOps workflows?',
            response: 'We leverage HashiCorp Vault with Kubernetes External Secrets operator, keeping encrypted manifests in Git via SealedSecrets.',
            score: 92,
            feedback: 'Spot on modern GitOps security practices.'
          }
        ],
        finalSummary: 'Major improvement in clarity, structured responses, and assertive technical vocabulary!',
        tips: [
          'Maintain this clear tempo during complex architecture questions.',
          'Continue grounding trade-offs with concrete cloud provider cost comparisons.'
        ],
        metrics: {
          confidence: 86,
          technicalAccuracy: 90,
          conciseness: 84,
          overallScore: 88
        }
      }
    ]
  },
  {
    id: 'data-manager',
    title: 'Data Manager',
    count: 8,
    description: 'Data pipelines, ETL workflows, data governance, BigQuery, Snowflake, and warehouse architecture.',
    attempts: [
      {
        attemptNumber: 1,
        date: 'Oct 10, 2026',
        role: 'Data Engineering Lead',
        title: 'Data Manager',
        questions: [
          {
            id: 'dm-q1',
            question: 'How do you ensure data quality and lineage across multi-source real-time streams?',
            response: 'We use Great Expectations for automated assertion tests and OpenLineage integrated with Apache Airflow DAGs.',
            score: 78,
            feedback: 'Strong tooling choices and clear lineage tracking explanation.'
          }
        ],
        finalSummary: 'Solid data architecture understanding with good emphasis on automated validation.',
        tips: [
          'Discuss cost optimization strategies for large scale partition tables.',
          'Emphasize compliance and GDPR/HIPAA access governance.'
        ],
        metrics: {
          confidence: 75,
          technicalAccuracy: 82,
          conciseness: 79,
          overallScore: 78
        }
      }
    ]
  },
  {
    id: 'backend',
    title: 'Backend',
    count: 8,
    description: 'Distributed systems, microservices, REST/gRPC APIs, Redis caching, and relational databases.',
    attempts: [
      {
        attemptNumber: 1,
        date: 'Oct 08, 2026',
        role: 'Senior Backend Engineer',
        title: 'Backend',
        questions: [
          {
            id: 'be-q1',
            question: 'Explain your strategy for mitigating cache stampede in high-throughput endpoints.',
            response: 'I implement probabilistic early expiration (XFetch algorithm) combined with mutex locks around cache misses.',
            score: 90,
            feedback: 'Exceptional mastery of distributed caching failure modes.'
          }
        ],
        finalSummary: 'Excellent technical depth and architectural reasoning demonstrated throughout the interview.',
        tips: [
          'Include database connection pool tuning nuances when scaling write replicas.'
        ],
        metrics: {
          confidence: 88,
          technicalAccuracy: 92,
          conciseness: 85,
          overallScore: 89
        }
      }
    ]
  },
  {
    id: 'ui-ux',
    title: 'Ui/UX',
    count: 1,
    description: 'Design systems, accessibility WCAG 2.1, Figma prototyping, user research, and interaction design.',
    attempts: [
      {
        attemptNumber: 1,
        date: 'Oct 02, 2026',
        role: 'Senior Product Designer',
        title: 'Ui/UX',
        questions: [
          {
            id: 'ui-q1',
            question: 'How do you balance aesthetic delight with strict WCAG AA accessibility compliance?',
            response: 'Delight and accessibility are synergistic. High-contrast typography and thoughtful rhythmic spacing enhance usability for everyone.',
            score: 84,
            feedback: 'Thoughtful philosophy backed by clear token management.'
          }
        ],
        finalSummary: 'Good foundational principles and user-centered empathy.',
        tips: [
          'Walk through usability testing methodology and user validation benchmarks.'
        ],
        metrics: {
          confidence: 80,
          technicalAccuracy: 85,
          conciseness: 82,
          overallScore: 82
        }
      }
    ]
  }
];

export const PRACTICE_TRACKS: PracticeTrack[] = [
  {
    id: 'ai-ml-fundamentals',
    title: 'Ai/Ml fundamentals with Gemini and claude',
    category: 'Artificial Intelligence',
    description: 'Deep dive into transformer architectures, attention mechanisms, prompt engineering, fine-tuning, and LLM evaluation with live coding.',
    difficulty: 'Advanced',
    duration: '45 mins',
    topics: ['Attention Mechanisms', 'Loss Functions', 'Evaluation & ROUGE', 'Quantization', 'Inference Optimization'],
    interviewers: [
      { name: 'Gemini', role: 'AI Model Specialist', avatarColor: '#4285F4' },
      { name: 'Claude', role: 'System Architect', avatarColor: '#D97706' }
    ],
    defaultCode: {
      language: 'python',
      code: `import numpy as np

def scaled_dot_product_attention(Q, K, V, mask=None):
    """
    Compute Scaled Dot-Product Attention:
    Attention(Q, K, V) = softmax(Q * K^T / sqrt(d_k)) * V
    """
    d_k = Q.shape[-1]
    scores = np.matmul(Q, K.swapaxes(-2, -1)) / np.sqrt(d_k)
    
    if mask is not None:
        scores = np.where(mask == 0, -1e9, scores)
        
    weights = np.exp(scores - np.max(scores, axis=-1, keepdims=True))
    weights /= np.sum(weights, axis=-1, keepdims=True)
    
    return np.matmul(weights, V), weights

# Test execution:
q = np.random.randn(1, 4, 64)
k = np.random.randn(1, 4, 64)
v = np.random.randn(1, 4, 64)
output, weights = scaled_dot_product_attention(q, k, v)
print(f"Attention output shape: {output.shape}")
print(f"Attention weights shape: {weights.shape}")
print("Status: Execution successful!")`
    },
    questions: [
      'Welcome! Gemini and I will guide you through transformer fundamentals today. Could you start by explaining how Multi-Head Attention improves representation capacity over single-head attention?',
      'Look at the editor. How would you modify the scaled_dot_product_attention function to handle causal masking for autoregressive decoding?',
      'When fine-tuning an LLM using LoRA (Low-Rank Adaptation), how does the rank parameter r affect gradient updates and memory consumption?',
      'Suppose your model suffers from hallucinations in RAG retrieval. What concrete verification or grounding techniques would you implement?'
    ]
  },
  {
    id: 'devops-full',
    title: 'DevOps & Site Reliability',
    category: 'Cloud & Infrastructure',
    description: 'Master Kubernetes orchestration, CI/CD automation with GitHub Actions, Terraform IaC, and Prometheus alerting.',
    difficulty: 'Intermediate',
    duration: '35 mins',
    topics: ['Kubernetes Probes', 'Zero-Downtime Rollouts', 'Terraform State', 'Incident Post-Mortems'],
    interviewers: [
      { name: 'Gemini', role: 'Cloud Platform Lead', avatarColor: '#4285F4' },
      { name: 'Claude', role: 'Reliability Engineer', avatarColor: '#D97706' }
    ],
    defaultCode: {
      language: 'yaml',
      code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: intertrain-service
  labels:
    app: production-core
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: production-core
    spec:
      containers:
      - name: web
        image: intertrain/core:v2.4.1
        ports:
        - containerPort: 3000
        readinessProbe:
          httpGet:
            path: /healthz
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 10`
    },
    questions: [
      'Walk us through your strategy for architecting automated canary rollouts with Argo Rollouts and Prometheus metrics analysis.',
      'How do you manage state lockouts and blast radius when collaborating on multi-region Terraform modules?',
      'Describe how you debug a node crashing with CrashLoopBackOff status in an EKS cluster.'
    ]
  },
  {
    id: 'backend-systems',
    title: 'Distributed Backend Engineering',
    category: 'Software Architecture',
    description: 'High-scale API design, database partitioning, Redis caching topologies, and Kafka stream processing.',
    difficulty: 'Advanced',
    duration: '40 mins',
    topics: ['Distributed Locks', 'Event Sourcing', 'Idempotency', 'Database Sharding'],
    interviewers: [
      { name: 'Gemini', role: 'Distributed Systems Lead', avatarColor: '#4285F4' },
      { name: 'Claude', role: 'Concurrency Specialist', avatarColor: '#D97706' }
    ],
    defaultCode: {
      language: 'typescript',
      code: `// Idempotent API transaction processor
export async function processPayment(idempotencyKey: string, amount: number) {
  const cached = await redis.get(\`idemp:\${idempotencyKey}\`);
  if (cached) {
    return JSON.parse(cached);
  }
  
  const result = await db.transaction(async (tx) => {
    const charge = await stripe.charges.create({ amount });
    await tx.insert(records).values({ key: idempotencyKey, chargeId: charge.id });
    return { success: true, chargeId: charge.id };
  });

  await redis.setex(\`idemp:\${idempotencyKey}\`, 86400, JSON.stringify(result));
  return result;
}`
    },
    questions: [
      'How do you ensure strict idempotency in financial transactions when network timeouts occur between client and gateway?',
      'Compare Saga choreography vs Saga orchestration when coordinating distributed microservice rollbacks.',
      'Explain how you would handle hot partitions in a high-volume Kafka topic.'
    ]
  },
  {
    id: 'data-manager-track',
    title: 'Data Manager & Analytics Engineering',
    category: 'Data Engineering',
    description: 'Data modeling, Kimball dimensional design, dbt pipelines, Snowflake data warehouses, and streaming pipelines.',
    difficulty: 'Intermediate',
    duration: '30 mins',
    topics: ['dbt Models', 'SCD Type 2', 'Data Lineage', 'Partition Pruning'],
    interviewers: [
      { name: 'Gemini', role: 'Data Architect', avatarColor: '#4285F4' },
      { name: 'Claude', role: 'Analytics Lead', avatarColor: '#D97706' }
    ],
    defaultCode: {
      language: 'sql',
      code: `-- Slowly Changing Dimension (SCD Type 2) Snapshot
SELECT
    user_id,
    subscription_tier,
    start_date,
    COALESCE(LEAD(start_date) OVER (PARTITION BY user_id ORDER BY start_date), '9999-12-31') AS end_date,
    CASE 
        WHEN LEAD(start_date) OVER (PARTITION BY user_id ORDER BY start_date) IS NULL THEN TRUE 
        ELSE FALSE 
    END AS is_current
FROM raw_subscription_events;`
    },
    questions: [
      'Explain how you model Slowly Changing Dimensions (Type 2) in Snowflake or BigQuery with dbt snapshots.',
      'How do you handle schema drift when receiving nested JSON event logs from multiple mobile clients?'
    ]
  },
  {
    id: 'ui-ux-design',
    title: 'UI/UX & Design Systems Engineering',
    category: 'Frontend & Design',
    description: 'Component token architectures, micro-interactions, responsive fluid grids, and accessible interactive patterns.',
    difficulty: 'Intermediate',
    duration: '30 mins',
    topics: ['Design Tokens', 'Micro-animations', 'WCAG Contrast', 'Component APIs'],
    interviewers: [
      { name: 'Gemini', role: 'Product Design Lead', avatarColor: '#4285F4' },
      { name: 'Claude', role: 'Accessibility Specialist', avatarColor: '#D97706' }
    ],
    defaultCode: {
      language: 'typescript',
      code: `// Polymorphic Accessible Button Primitive
import { forwardRef, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', isLoading, children, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        aria-busy={isLoading}
        disabled={isLoading || props.disabled}
        className={\`px-4 py-2 rounded-xl font-medium transition \${className}\`}
        {...props}
      >
        {isLoading ? <span className="animate-spin mr-2">⟳</span> : null}
        {children}
      </button>
    );
  }
);`
    },
    questions: [
      'How do you design a token hierarchy that supports seamless multi-brand and dark/light mode themes without CSS duplication?',
      'Walk us through an audit you conducted to achieve WCAG AAA keyboard navigation on a complex data table.'
    ]
  }
];
