import { HistoryFolder, PracticeTrack } from '../types';

export const INITIAL_FOLDERS: HistoryFolder[] = [
  {
    id: 'devops',
    title: 'DevOps & Site Reliability',
    count: 15,
    description: 'CI/CD pipelines, Kubernetes, Docker, AWS infrastructure, and site reliability engineering.',
    attempts: [
      {
        attemptNumber: 5,
        date: '2 Oct 2026',
        duration: '21 mins',
        role: 'DevOps & Site Reliability Engineer',
        title: 'DevOps & Site Reliability',
        cheerQuote: 'Strong technical agility demonstrated! Keep practicing to reach the next level!',
        finalSummary: 'You demonstrated strong understanding of DevOps concepts, with clear explanations on CI/CD, containerization, and system reliability. Your problem-solving approach and real-world examples were impressive.',
        strengths: [
          'Strong understanding of DevOps fundamentals',
          'Good real-world examples',
          'Clear communication and confidence',
          'Practical knowledge of CI/CD and containers',
        ],
        areasToImprove: [
          'Include more specific tools and commands',
          'Provide deeper technical depth in system design',
          'Use more structured frameworks (e.g., STAR)',
          'Elaborate on edge cases and trade-offs',
        ],
        tips: [
          'Include more specific tools and commands',
          'Provide deeper technical depth in system design',
          'Use more structured frameworks (e.g., STAR)',
          'Elaborate on edge cases and trade-offs',
        ],
        metrics: {
          confidence: 90,
          technicalAccuracy: 88,
          conciseness: 82,
          overallScore: 85,
        },
        questions: [
          {
            id: 'q1-att5',
            question: 'What is DevOps and why is it important?',
            shortFeedback: 'Clear and concise explanation with good real-world examples.',
            score: 10,
            timeSpent: '3m 15s',
            category: 'DevOps Fundamentals',
            response: 'DevOps is a set of cultural philosophies, practices, and tools that combines software development (Dev) and IT operations (Ops) to shorten the systems development life cycle while delivering features, fixes, and updates rapidly with high reliability. It breaks down organizational silos, automates manual handoffs with continuous integration and continuous deployment (CI/CD), and establishes feedback loops through monitoring and observability. In my previous work, introducing automated testing and infrastructure-as-code reduced deployment lead time from 2 weeks to 45 minutes and dropped change failure rate under 2%.',
            feedback: 'Clear and concise explanation with good real-world examples.',
            idealAnswer: 'DevOps merges development, quality assurance, and operations into unified workflows, emphasizing automation (CI/CD, IaC), shared responsibility, fast feedback loops, and metrics like DORA (Deployment Frequency, Lead Time, MTTR, Change Failure Rate).',
            keyPoints: ['Cultural shift & breaking silos', 'CI/CD pipeline automation', 'Measurable DORA metrics', 'Infrastructure as Code (IaC)'],
          },
          {
            id: 'q2-att5',
            question: 'Explain the CI/CD pipeline and its stages.',
            shortFeedback: 'Well-structured answer covering all key stages with relevant tools.',
            score: 9,
            timeSpent: '4m 30s',
            category: 'CI/CD & Automation',
            response: 'A CI/CD pipeline automates delivery from code commit to production. It has five core stages: 1) Source Stage: Triggered via Git webhooks on pull request. 2) Build Stage: Compiling code, running dependency vulnerability scans, and packaging into Docker images. 3) Test Stage: Running unit tests, integration tests, and static code analysis (SonarQube) with quality gates. 4) Release & Deploy Stage: Automated canary or blue-green rollout using ArgoCD onto Kubernetes clusters. 5) Monitoring: Tracking real-time error rates and latency in Prometheus/Grafana with automated rollback on health probe failures.',
            feedback: 'Well-structured answer covering all key stages with relevant tools.',
            idealAnswer: 'Comprehensive coverage includes Commit/Trigger, Artifact Build & Scanning, Automated Testing Matrix, Progressive Delivery (Canary/Blue-Green), and Post-deploy verification.',
            keyPoints: ['Git webhook triggers', 'Docker artifact creation', 'Automated security/test gates', 'Canary/Blue-Green deployment', 'Observability & rollbacks'],
          },
          {
            id: 'q3-att5',
            question: 'What are containers and how do they differ from virtual machines?',
            shortFeedback: 'Good comparison with clear understanding of concepts.',
            score: 9,
            timeSpent: '3m 45s',
            category: 'Containerization',
            response: 'Containers package application code, dependencies, and runtime libraries into a lightweight, standalone artifact. The key distinction is the virtualization layer: VMs virtualize hardware via a hypervisor (like KVM or ESXi), requiring each guest VM to run a full operating system kernel with dedicated memory and disk overhead. Containers, in contrast, virtualize at the OS layer by sharing the host Linux kernel while using namespaces for isolation (PID, net, mount) and cgroups for resource constraints (CPU, RAM). This makes containers start in milliseconds with minimal resource footprint compared to gigabytes-heavy VMs.',
            feedback: 'Good comparison with clear understanding of concepts.',
            idealAnswer: 'Highlight OS-level vs hardware-level virtualization, Linux kernel primitives (namespaces, cgroups, chroot), startup latency, and memory density.',
            keyPoints: ['Kernel sharing vs Hypervisor', 'Linux Namespaces (isolation)', 'Control Groups / cgroups (resource limits)', 'Startup overhead & image footprint'],
          },
          {
            id: 'q4-att5',
            question: 'How would you ensure high availability in a distributed system?',
            shortFeedback: 'Solid approach with practical solutions and trade-offs.',
            score: 8,
            timeSpent: '5m 10s',
            category: 'System Architecture',
            response: 'High availability requires eliminating single points of failure across all architectural tiers: 1) Compute: Distributing stateless services across multiple Availability Zones behind resilient Application Load Balancers with auto-scaling groups and aggressive health checks. 2) Data Layer: Primary-replica database topologies with automated failover (e.g. AWS Aurora Multi-AZ) and read replicas. 3) Resilience patterns: Implementing timeouts, exponential backoff with jitter, rate limiting, and circuit breakers (Resilience4j). 4) Disaster Recovery: Regular chaos engineering tests to ensure failovers work seamlessly.',
            feedback: 'Solid approach with practical solutions and trade-offs.',
            idealAnswer: 'Emphasize multi-region/multi-AZ topologies, load balancing with health probes, consensus-backed data replication, chaos engineering, and circuit breaking.',
            keyPoints: ['Multi-AZ redundancy', 'Stateless tier auto-scaling', 'Database failover & replication', 'Circuit breaker resilience patterns'],
          },
          {
            id: 'q5-att5',
            question: 'Explain monitoring and logging in DevOps.',
            shortFeedback: 'Good explanation, but could have included more specific tools and examples.',
            score: 8,
            timeSpent: '4m 20s',
            category: 'Observability & SRE',
            response: 'Monitoring and logging form the backbone of observability. Monitoring is metric-driven, tracking the Four Golden Signals: Latency, Traffic, Errors, and Saturation using Prometheus and alerting via Alertmanager/PagerDuty. Logging captures discrete chronological events across microservices; we aggregate structured JSON logs via Fluentbit into OpenSearch/Loki, correlating traces with correlation IDs (OpenTelemetry) to diagnose latency bottlenecks across distributed spans.',
            feedback: 'Good explanation, but could have included more specific tools and examples.',
            idealAnswer: 'Distinguish between Metrics, Logs, and Traces (the 3 pillars of observability). Reference Google SRE Golden Signals, distributed tracing with OpenTelemetry, and structured JSON logs with centralized querying.',
            keyPoints: ['Four Golden Signals', 'Centralized log aggregation (Loki/ELK)', 'Distributed tracing with OpenTelemetry', 'Actionable alerting policies & SLIs'],
          },
        ],
      },
      {
        attemptNumber: 4,
        date: '30 Sep 2026',
        duration: '18 mins',
        role: 'DevOps & Site Reliability Engineer',
        title: 'DevOps & Site Reliability',
        cheerQuote: 'Great improvement on architectural trade-offs! Keep refining your system design answers.',
        finalSummary: 'Solid understanding of cloud infrastructure, Kubernetes pods, and monitoring workflows.',
        strengths: [
          'Detailed knowledge of Kubernetes architecture',
          'Good grasp of Prometheus alerting',
          'Confident explanations of GitOps',
        ],
        areasToImprove: [
          'Deepen coverage of zero-downtime database migrations',
          'Provide more concrete metrics for latency reduction',
        ],
        tips: [
          'Deepen coverage of zero-downtime database migrations',
          'Provide more concrete metrics for latency reduction',
        ],
        metrics: {
          confidence: 84,
          technicalAccuracy: 80,
          conciseness: 76,
          overallScore: 78,
        },
        questions: [
          {
            id: 'q1-att4',
            question: 'How do you structure zero-downtime deployments on Kubernetes?',
            shortFeedback: 'Good understanding of RollingUpdate and readiness probes.',
            score: 8,
            timeSpent: '4m 00s',
            category: 'Kubernetes',
            response: 'We use RollingUpdate deployment strategy with maxUnavailable set to 0 and maxSurge set to 25%, paired with readiness probes so traffic only routes once pods are healthy.',
            feedback: 'Clear, accurate response with good Kubernetes manifest parameters.',
          },
          {
            id: 'q2-att4',
            question: 'What is Infrastructure as Code (IaC) and why do you use Terraform?',
            shortFeedback: 'Good explanation of declarative states and drift detection.',
            score: 8,
            timeSpent: '4m 20s',
            category: 'IaC',
            response: 'IaC manages infrastructure through machine-readable definition files rather than physical hardware configuration or interactive configuration tools. Terraform provides declarative state management and drift detection.',
            feedback: 'Well articulated value of immutable infrastructure.',
          },
        ],
      },
      {
        attemptNumber: 3,
        date: '28 Sep 2026',
        duration: '24 mins',
        role: 'DevOps & Site Reliability Engineer',
        title: 'DevOps & Site Reliability',
        cheerQuote: 'Solid technical foundation! Work on verbal conciseness and STAR pacing.',
        finalSummary: 'Good technical clarity on Linux fundamentals and Docker container build optimization.',
        strengths: ['Docker multi-stage builds', 'Basic network troubleshooting'],
        areasToImprove: ['Use STAR framework more consistently', 'Avoid pauses when handling edge cases'],
        tips: ['Use STAR framework more consistently', 'Avoid pauses when handling edge cases'],
        metrics: {
          confidence: 86,
          technicalAccuracy: 88,
          conciseness: 82,
          overallScore: 88,
        },
        questions: [
          {
            id: 'q1-att3',
            question: 'How do you optimize Docker image build size and speed?',
            shortFeedback: 'Strong technical explanation of multi-stage builds.',
            score: 9,
            timeSpent: '3m 30s',
            category: 'Docker',
            response: 'Using multi-stage builds, minimal base images like Alpine or distroless, ordering layers from least to most frequently modified for caching, and using .dockerignore.',
            feedback: 'Practical best practices mentioned.',
          },
        ],
      },
      {
        attemptNumber: 2,
        date: '25 Sep 2026',
        duration: '20 mins',
        role: 'DevOps Engineer',
        title: 'DevOps & Site Reliability',
        cheerQuote: 'Good step forward! Keep practicing your answers aloud.',
        finalSummary: 'Clear improvement in vocabulary, understanding of GitOps, and secrets management.',
        strengths: ['GitOps basics', 'HashiCorp Vault familiarity'],
        areasToImprove: ['Elaborate on production incident response', 'Speak with more confidence'],
        tips: ['Elaborate on production incident response', 'Speak with more confidence'],
        metrics: {
          confidence: 80,
          technicalAccuracy: 84,
          conciseness: 78,
          overallScore: 82,
        },
        questions: [
          {
            id: 'q1-att2',
            question: 'How do you safeguard secret management in GitOps workflows?',
            shortFeedback: 'Spot on modern GitOps security practices.',
            score: 8,
            timeSpent: '3m 50s',
            category: 'Security',
            response: 'We leverage HashiCorp Vault with Kubernetes External Secrets operator, keeping encrypted manifests in Git via SealedSecrets.',
            feedback: 'Spot on modern GitOps security practices.',
          },
        ],
      },
      {
        attemptNumber: 1,
        date: '20 Sep 2026',
        duration: '18 mins',
        role: 'DevOps & Site Reliability Engineer',
        title: 'DevOps & Site Reliability',
        cheerQuote: 'Great first attempt! Review the question feedback to build your technical depth.',
        finalSummary: 'Initial baseline attempt. Shows curiosity but answers need more technical depth and structured framing.',
        strengths: ['Willingness to learn', 'Basic familiarity with cloud'],
        areasToImprove: ['Use STAR framework to avoid conversational drift', 'State concrete metrics to back up claims'],
        tips: ['Use STAR framework to avoid conversational drift', 'State concrete metrics to back up claims'],
        metrics: {
          confidence: 54,
          technicalAccuracy: 62,
          conciseness: 56,
          overallScore: 58,
        },
        questions: [
          {
            id: 'q1-att1',
            question: 'Introduce yourself and tell me your past experience.',
            shortFeedback: 'Opening needs more professional positioning and clear milestones.',
            score: 6,
            timeSpent: '2m 10s',
            category: 'Introduction',
            response: 'Hi, I have worked with Linux servers and some cloud environments.',
            feedback: 'Opening lacks professional positioning. Outline your technical focus and career milestones concisely.',
          },
        ],
      },
    ],
  },
  {
    id: 'data-manager',
    title: 'Data Manager',
    count: 8,
    description: 'Data pipelines, ETL workflows, data governance, BigQuery, Snowflake, and warehouse architecture.',
    attempts: [
      {
        attemptNumber: 2,
        date: '22 Sep 2026',
        duration: '18 mins',
        role: 'Data Manager & Analytics',
        title: 'Data Manager & Analytics',
        finalSummary: 'Solid data architecture understanding with good emphasis on automated validation.',
        tips: [
          'Discuss cost optimization strategies for large scale partition tables.',
          'Emphasize compliance and GDPR/HIPAA access governance.',
        ],
        metrics: {
          confidence: 76,
          technicalAccuracy: 80,
          conciseness: 74,
          overallScore: 76,
        },
        questions: [
          {
            id: 'dm-q2',
            question: 'How do you ensure data quality and lineage across multi-source real-time streams?',
            shortFeedback: 'Strong tooling choices and clear lineage tracking explanation.',
            response: 'We use Great Expectations for automated assertion tests and OpenLineage integrated with Apache Airflow DAGs.',
            score: 8,
            feedback: 'Strong tooling choices and clear lineage tracking explanation.',
          },
        ],
      },
      {
        attemptNumber: 1,
        date: '16 Sep 2026',
        duration: '16 mins',
        role: 'Data Manager & Analytics',
        title: 'Data Manager & Analytics',
        finalSummary: 'Initial data architecture exploration.',
        tips: ['Structure responses around pipeline throughput and latency.'],
        metrics: {
          confidence: 50,
          technicalAccuracy: 55,
          conciseness: 48,
          overallScore: 50,
        },
        questions: [
          {
            id: 'dm-q1',
            question: 'What is the role of an ETL pipeline in distributed analytics?',
            response: 'It extracts data from transactional databases, transforms schemas, and loads into lakes.',
            score: 6,
            feedback: 'Good overview of extract, transform, and load stages.',
          },
        ],
      },
    ],
  },
  {
    id: 'backend',
    title: 'Backend',
    count: 8,
    description: 'Distributed systems, microservices, REST/gRPC APIs, Redis caching, and relational databases.',
    attempts: [
      {
        attemptNumber: 2,
        date: '24 Sep 2026',
        duration: '25 mins',
        role: 'Senior Backend Engineer',
        title: 'Backend',
        finalSummary: 'Excellent technical depth and architectural reasoning demonstrated throughout the interview.',
        tips: ['Include database connection pool tuning nuances when scaling write replicas.'],
        metrics: {
          confidence: 88,
          technicalAccuracy: 94,
          conciseness: 85,
          overallScore: 89,
        },
        questions: [
          {
            id: 'be-q2',
            question: 'Explain your strategy for mitigating cache stampede in high-throughput endpoints.',
            shortFeedback: 'Exceptional mastery of distributed caching failure modes.',
            response: 'I implement probabilistic early expiration (XFetch algorithm) combined with mutex locks around cache misses.',
            score: 9,
            feedback: 'Exceptional mastery of distributed caching failure modes.',
          },
        ],
      },
      {
        attemptNumber: 1,
        date: '12 Sep 2026',
        duration: '20 mins',
        role: 'Backend Engineer',
        title: 'Backend',
        finalSummary: 'Foundational backend API knowledge.',
        tips: ['Deepen understanding of asynchronous queues and concurrency models.'],
        metrics: {
          confidence: 45,
          technicalAccuracy: 48,
          conciseness: 40,
          overallScore: 42,
        },
        questions: [
          {
            id: 'be-q1',
            question: 'How do you design a robust RESTful API with versioning?',
            response: 'Use URI path versioning, clean HTTP status codes, and idempotency keys on POST requests.',
            score: 5,
            feedback: 'Good basics on REST conventions.',
          },
        ],
      },
    ],
  },
  {
    id: 'ui-ux',
    title: 'UI/UX',
    count: 2,
    description: 'Design systems, accessibility WCAG 2.1, Figma prototyping, user research, and interaction design.',
    attempts: [
      {
        attemptNumber: 2,
        date: '14 Sep 2026',
        duration: '18 mins',
        role: 'UI/UX Designer',
        title: 'UI/UX',
        finalSummary: 'Strong user empathy and design system token comprehension.',
        tips: ['Elaborate on quantitative user testing metrics.'],
        metrics: {
          confidence: 80,
          technicalAccuracy: 85,
          conciseness: 82,
          overallScore: 82,
        },
        questions: [
          {
            id: 'ui-q2',
            question: 'How do you balance aesthetic delight with strict WCAG AA accessibility compliance?',
            shortFeedback: 'Thoughtful philosophy backed by clear token management.',
            response: 'Delight and accessibility are synergistic. High-contrast typography and thoughtful rhythmic spacing enhance usability for everyone.',
            score: 8,
            feedback: 'Thoughtful philosophy backed by clear token management.',
          },
        ],
      },
      {
        attemptNumber: 1,
        date: '8 Sep 2026',
        duration: '15 mins',
        role: 'Senior Product Designer',
        title: 'UI/UX',
        finalSummary: 'Initial design review.',
        tips: ['Practice explaining component variant props in design tokens.'],
        metrics: {
          confidence: 32,
          technicalAccuracy: 35,
          conciseness: 30,
          overallScore: 30,
        },
        questions: [
          {
            id: 'ui-q1',
            question: 'What are the core fundamentals of atomic design?',
            response: 'Atoms, molecules, organisms, templates, and pages.',
            score: 4,
            feedback: 'Brief but accurate atomic breakdown.',
          },
        ],
      },
    ],
  },
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
