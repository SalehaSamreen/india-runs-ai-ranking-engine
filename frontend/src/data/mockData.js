// Mock data built from real candidates.jsonl schema
// Replace with real API calls from src/services/api.js

export const JD_PROFILE = {
  title: "Senior AI Engineer — Founding Team",
  company: "Redrob AI",
  location: "Pune / Noida, India",
  experience: "5–9 years",
  type: "Full-time · Hybrid",
  required_skills: ["Python", "Embeddings", "Vector databases", "Retrieval systems", "Ranking systems", "NDCG/MAP evaluation"],
  preferred_skills: ["LoRA / QLoRA", "Learning-to-rank", "LLM fine-tuning", "Open source AI"],
  rejection_signals: ["Services-only career", "Pure research background", "Title chasing", "CV/speech-only"],
  hidden_signals: [
    "Production ranking system at 10M+ user scale",
    "Open source contribution to embedding models or ranking libraries",
    "Interview loop completions (signal of availability)",
    "GitHub profile with retrieval/ranking projects"
  ],
};

export const PIPELINE_METRICS = {
  stages: [
    { stage: "Job Understanding", input: 1, output: 1, time_ms: 124, candidates_processed: 0 },
    { stage: "Candidate Parsing", input: 100000, output: 100000, time_ms: 2341, candidates_processed: 100000 },
    { stage: "Semantic Matching", input: 100000, output: 87462, time_ms: 8932, candidates_processed: 100000 },
    { stage: "Behavioral Analysis", input: 87462, output: 87462, time_ms: 3124, candidates_processed: 87462 },
    { stage: "Fraud Detection", input: 87462, output: 86231, time_ms: 1844, candidates_processed: 87462 },
    { stage: "Feature Engineering", input: 86231, output: 86231, time_ms: 2156, candidates_processed: 86231 },
    { stage: "Ranking", input: 86231, output: 86231, time_ms: 4321, candidates_processed: 86231 },
    { stage: "Explainability", input: 86231, output: 100, time_ms: 892, candidates_processed: 100 },
  ],
  total_runtime_ms: 23734,
  candidates_eliminated: {
    semantic_mismatch: 12538,
    fraud_detected: 1231,
    total: 13769,
  },
};

export const BEHAVIORAL_DATA = {
  summary: {
    avg_recruiter_response_rate: 0.81,
    avg_interview_completion_rate: 0.89,
    avg_github_activity_score: 74,
    open_to_work_percent: 92,
    actively_interviewing: 67,
  },
  by_company: [
    { company: "Swiggy", count: 12, avg_response_rate: 0.85, avg_interview_rate: 0.90 },
    { company: "Google", count: 8, avg_response_rate: 0.72, avg_interview_rate: 0.88 },
    { company: "Amazon", count: 10, avg_response_rate: 0.78, avg_interview_rate: 0.91 },
    { company: "Microsoft", count: 6, avg_response_rate: 0.88, avg_interview_rate: 0.92 },
    { company: "Meta", count: 5, avg_response_rate: 0.74, avg_interview_rate: 0.85 },
  ],
};

export const FRAUD_DETECTION_DATA = {
  total_analyzed: 86231,
  fraud_detected: 1231,
  fraud_rate: 0.0143,
  by_type: [
    { type: "Keyword stuffing", count: 342, severity: "low", rate: 0.0040 },
    { type: "Fake experience claims", count: 198, severity: "high", rate: 0.0023 },
    { type: "Career inconsistency", count: 421, severity: "medium", rate: 0.0049 },
    { type: "Job hopping anomaly", count: 270, severity: "medium", rate: 0.0031 },
  ],
  risk_distribution: [
    { risk: "No risk", count: 84678, percent: 98.2 },
    { risk: "Low risk", count: 943, percent: 1.1 },
    { risk: "Medium risk", count: 477, percent: 0.6 },
    { risk: "High risk", count: 133, percent: 0.2 },
  ],
};

export const EXPLAINABILITY_DATA = {
  avg_confidence: 0.78,
  score_drivers: [
    { driver: "Career relevance", impact: 0.30, trend: "up" },
    { driver: "Semantic match", impact: 0.25, trend: "stable" },
    { driver: "Skill overlap", impact: 0.20, trend: "down" },
    { driver: "Product experience", impact: 0.10, trend: "up" },
    { driver: "Behavioral score", impact: 0.10, trend: "stable" },
    { driver: "Stability", impact: 0.05, trend: "stable" },
  ],
  top_strengths: [
    "Production system experience",
    "Required skill match",
    "Company stability",
    "Educational background",
    "High engagement",
  ],
  top_concerns: [
    "Notice period > 60 days",
    "Non-product background",
    "No open source contributions",
    "Low GitHub activity",
    "Missing specific tool experience",
  ],
};

export const MOCK_RANKED = Array.from({ length: 100 }, (_, idx) => {
  const baseScore = 0.99 - idx * 0.001;
  const companies = [
    "Swiggy", "Google", "Amazon", "Microsoft", "Meta", "Flipkart",
    "OYO", "Unacademy", "Razorpay", "PhonePe", "Figma", "Stripe",
    "Meesho", "Dunzo", "Nykaa", "InMobi", "Juspay", "Vernacular.ai"
  ];
  const locations = ["Bangalore", "Hyderabad", "Pune", "Delhi NCR", "Mumbai", "Gurugram"];
  const titles = [
    "Senior ML Engineer", "ML Engineer", "AI Engineer", "Data Scientist",
    "Search Engineer", "Applied ML Scientist", "Research Engineer",
    "ML Scientist", "AI Scientist", "Analytics Engineer"
  ];
  
  const candidate = {
    candidate_id: `CAND_${String(idx + 1).padStart(7, '0')}`,
    rank: idx + 1,
    score: Math.max(0.70, baseScore),
    profile: {
      anonymized_name: `Candidate ${idx + 1}`,
      headline: `${titles[idx % titles.length]} | Search & Ranking`,
      summary: "Experienced ML professional with strong background in production systems and data-driven decision making.",
      location: locations[idx % locations.length],
      country: "India",
      years_of_experience: 5 + (idx % 8),
      current_title: titles[idx % titles.length],
      current_company: companies[idx % companies.length],
      current_company_size: "1001-5000",
      current_industry: ["Tech", "Fintech", "E-commerce", "AdTech"][idx % 4],
    },
    career_history: [
      {
        company: companies[idx % companies.length],
        title: titles[idx % titles.length],
        duration_months: 24 + (idx % 48),
        is_current: true,
        industry: ["Tech", "Fintech", "E-commerce"][idx % 3],
        company_size: "1001-5000",
        description: "Building scalable machine learning systems for production environments.",
      },
    ],
    education: [
      {
        institution: ["IIT Bombay", "IIT Delhi", "NIT Trichy", "BITS Pilani", "IIIT Hyderabad"][idx % 5],
        degree: "B.Tech",
        field_of_study: "Computer Science",
        start_year: 2014,
        end_year: 2018,
        tier: idx % 2 === 0 ? "tier_1" : "tier_2",
      },
    ],
    skills: [
      { name: "Python", proficiency: "expert", endorsements: 80 + idx % 20, duration_months: 60 + idx % 30 },
      { name: "Embeddings", proficiency: idx % 2 === 0 ? "expert" : "advanced", endorsements: 60 + idx % 20, duration_months: 48 + idx % 24 },
      { name: "Retrieval systems", proficiency: "advanced", endorsements: 50 + idx % 20, duration_months: 42 + idx % 24 },
      { name: "Ranking systems", proficiency: "advanced", endorsements: 45 + idx % 15, duration_months: 36 + idx % 20 },
    ],
    certifications: [],
    redrob_signals: {
      profile_completeness_score: 85 + (idx % 15),
      signup_date: "2025-09-01",
      last_active_date: "2026-06-28",
      open_to_work_flag: idx % 10 < 8,
      profile_views_received_30d: 50 + (idx % 100),
      applications_submitted_30d: idx % 5,
      recruiter_response_rate: 0.65 + (idx % 35) * 0.01,
      avg_response_time_hours: 4 + (idx % 20),
      skill_assessment_scores: { Python: 80 + idx % 15, Embeddings: 75 + idx % 15 },
      connection_count: 300 + (idx % 500),
      endorsements_received: 80 + (idx % 150),
      notice_period_days: 15 + (idx % 90),
      expected_salary_range_inr_lpa: { min: 25 + (idx % 40), max: 45 + (idx % 50) },
      preferred_work_mode: ["hybrid", "remote", "office"][idx % 3],
      willing_to_relocate: idx % 3 !== 2,
      github_activity_score: 50 + (idx % 50),
      search_appearance_30d: 150 + (idx % 250),
      saved_by_recruiters_30d: 5 + (idx % 20),
      interview_completion_rate: 0.75 + (idx % 20) * 0.01,
      offer_acceptance_rate: 0.60 + (idx % 35) * 0.01,
      verified_email: true,
      verified_phone: idx % 5 !== 0,
      linkedin_connected: true,
    },
    score_breakdown: {
      semantic: 0.90 + (idx % 10) * 0.01,
      skill: 0.92 + (idx % 8) * 0.01,
      career: 0.88 + (idx % 12) * 0.01,
      behavioral: 0.80 + (idx % 15) * 0.01,
      product: 0.95 + (idx % 5) * 0.01,
      stability: 0.85 + (idx % 10) * 0.01,
    },
    reasoning: `Strong match based on ${idx % 2 === 0 ? "production system experience" : "semantic skill alignment"}. ${idx % 3 === 0 ? "Excellent recruiter engagement." : ""}`,
    strengths: [
      "Production system experience",
      "Required skill match",
      "Strong engagement signals"
    ],
    concerns: idx % 4 === 0 ? ["Notice period > 60 days"] : [],
  };
  return candidate;
});

export const DASHBOARD_METRICS = {
  totalCandidates: 100000,
  top100Selected: 100,
  honeypotsDetected: 73,
  runtimeSeconds: 134,
  avgScore: 0.81,
  ramUsedGB: 12.4,
  scoreBuckets: [
    { range: "0.95–1.00", count: 2 },
    { range: "0.90–0.95", count: 8 },
    { range: "0.85–0.90", count: 19 },
    { range: "0.80–0.85", count: 31 },
    { range: "0.70–0.80", count: 28 },
    { range: "<0.70",     count: 12 },
  ],
  signalWeights: [
    { signal: "Career relevance",  weight: 30 },
    { signal: "Semantic match",    weight: 25 },
    { signal: "Skill overlap",     weight: 20 },
    { signal: "Product experience",weight: 10 },
    { signal: "Behavioral score",  weight: 10 },
    { signal: "Stability",         weight: 5  },
  ],
  locationBreakdown: [
    { city: "Bangalore",  count: 42 },
    { city: "Hyderabad",  count: 18 },
    { city: "Pune",       count: 14 },
    { city: "Delhi NCR",  count: 11 },
    { city: "Mumbai",     count: 9  },
    { city: "Other",      count: 6  },
  ],
};
