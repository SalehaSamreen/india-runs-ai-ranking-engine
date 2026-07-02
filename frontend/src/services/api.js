import axios from "axios";
import {
  MOCK_RANKED, DASHBOARD_METRICS, JD_PROFILE, PIPELINE_METRICS,
  BEHAVIORAL_DATA, FRAUD_DETECTION_DATA, EXPLAINABILITY_DATA
} from "../data/mockData";

const USE_MOCK = true; // ← set to false when backend is ready

const client = axios.create({
  baseURL: "/api",
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// ─── Ranking ──────────────────────────────────────────────────────────────────

export async function getTop100() {
  if (USE_MOCK) return MOCK_RANKED;
  const { data } = await client.get("/top100");
  return data;
}

export async function getCandidate(id) {
  if (USE_MOCK) return MOCK_RANKED.find((c) => c.candidate_id === id) ?? null;
  const { data } = await client.get(`/candidate/${id}`);
  return data;
}

export async function getDashboardMetrics() {
  if (USE_MOCK) return DASHBOARD_METRICS;
  const { data } = await client.get("/metrics");
  return data;
}

// ─── Job Description ──────────────────────────────────────────────────────────

export async function getJDProfile() {
  if (USE_MOCK) return JD_PROFILE;
  const { data } = await client.get("/jd-profile");
  return data;
}

// ─── AI Pipeline Visualization ────────────────────────────────────────────────

export async function getPipelineMetrics() {
  if (USE_MOCK) return PIPELINE_METRICS;
  const { data } = await client.get("/pipeline-metrics");
  return data;
}

// ─── Behavioral Analysis ──────────────────────────────────────────────────────

export async function getBehavioralAnalysis() {
  if (USE_MOCK) return BEHAVIORAL_DATA;
  const { data } = await client.get("/behavioral-analysis");
  return data;
}

export async function getCandidateBehavioral(id) {
  if (USE_MOCK) {
    const candidate = MOCK_RANKED.find(c => c.candidate_id === id);
    if (!candidate) return null;
    return {
      candidate_id: id,
      recruiter_response_rate: candidate.redrob_signals?.recruiter_response_rate || 0.85,
      avg_response_time_hours: candidate.redrob_signals?.avg_response_time_hours || 6.2,
      interview_completion_rate: candidate.redrob_signals?.interview_completion_rate || 0.88,
      github_activity_score: candidate.redrob_signals?.github_activity_score || 75,
      open_to_work_flag: candidate.redrob_signals?.open_to_work_flag || true,
      last_active_date: candidate.redrob_signals?.last_active_date || "2026-06-28",
      profile_views_30d: candidate.redrob_signals?.profile_views_received_30d || 50,
    };
  }
  const { data } = await client.get(`/behavioral-analysis/${id}`);
  return data;
}

// ─── Fraud Detection ──────────────────────────────────────────────────────────

export async function getFraudDetection() {
  if (USE_MOCK) return FRAUD_DETECTION_DATA;
  const { data } = await client.get("/fraud-detection");
  return data;
}

export async function getCandidateFraudAnalysis(id) {
  if (USE_MOCK) {
    return {
      candidate_id: id,
      keyword_stuffing_score: 0.12,
      fake_profile_score: 0.08,
      career_inconsistency_score: 0.15,
      job_hopping_score: 0.22,
      overall_fraud_risk: "low",
      flags: [],
    };
  }
  const { data } = await client.get(`/fraud-analysis/${id}`);
  return data;
}

// ─── Explainability ───────────────────────────────────────────────────────────

export async function getExplainability() {
  if (USE_MOCK) return EXPLAINABILITY_DATA;
  const { data } = await client.get("/explainability");
  return data;
}

export async function getCandidateExplainability(id) {
  if (USE_MOCK) {
    const candidate = MOCK_RANKED.find(c => c.candidate_id === id);
    if (!candidate) return null;
    return {
      candidate_id: id,
      score: candidate.score,
      score_breakdown: candidate.score_breakdown || {
        semantic: 0.92, skill: 0.95, career: 0.96, behavioral: 0.88, product: 0.98, stability: 0.91
      },
      reasoning: candidate.reasoning || "Strong match based on experience and skills",
      strengths: candidate.strengths || [],
      concerns: candidate.concerns || [],
      confidence_score: Math.min(1, candidate.score + 0.01),
    };
  }
  const { data } = await client.get(`/explainability/${id}`);
  return data;
}

// ─── JD Upload ────────────────────────────────────────────────────────────────

export async function uploadJD(file) {
  if (USE_MOCK) {
    await delay(1200);
    return { status: "ok", message: "JD parsed successfully" };
  }
  const form = new FormData();
  form.append("file", file);
  const { data } = await client.post("/upload-jd", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function startRanking() {
  if (USE_MOCK) {
    await delay(2000);
    return { status: "ok", runtime_seconds: 134, candidates_processed: MOCK_RANKED.length };
  }
  const { data } = await client.post("/rank");
  return data;
}

// ─── Export ───────────────────────────────────────────────────────────────────

export function downloadCSV(candidates) {
  const header = "candidate_id,rank,score,name,title,company,experience,location,reasoning\n";
  const rows = candidates
    .map((c) => {
      const reason = (c.reasoning || "").replace(/"/g, '""');
      return `${c.candidate_id},${c.rank},${c.score.toFixed(3)},"${c.profile.anonymized_name}","${c.profile.current_title}","${c.profile.current_company}",${c.profile.years_of_experience},"${c.profile.location}","${reason}"`;
    })
    .join("\n");
  const blob = new Blob([header + rows], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "redrob_top100_candidates.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

export function downloadXLSX(candidates) {
  // Simple CSV export with XLSX extension - in production use a proper library like xlsx
  downloadCSV(candidates);
}

// ─── Utils ────────────────────────────────────────────────────────────────────

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
