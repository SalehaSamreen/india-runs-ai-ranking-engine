import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ArrowLeft, MapPin, Briefcase, GraduationCap,
  Github, Mail, Phone, Linkedin, CheckCircle2, XCircle, AlertCircle,
} from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { getCandidate } from "../services/api";
import { Card, Badge, RankBadge, ScoreBar, Spinner, SkillTag, SectionLabel } from "../components/ui";
import { JD_PROFILE } from "../data/mockData";

export default function CandidateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("profile");

  useEffect(() => {
    getCandidate(id).then(setCandidate).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size={32} /></div>;
  if (!candidate) return <div className="p-8 text-gray-500">Candidate not found.</div>;

  const { profile, career_history, education, skills, redrob_signals: sig, score_breakdown, reasoning, strengths, concerns } = candidate;

  // Build radar data from score_breakdown
  const radarData = Object.entries(score_breakdown).map(([key, val]) => ({
    subject: key.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase()),
    score: Math.round(val * 100),
  }));

  // Skill match
  const jdRequired = JD_PROFILE.required_skills;
  const candidateSkillNames = skills.map(s => s.name.toLowerCase());
  const matchedRequired = jdRequired.filter(j => candidateSkillNames.some(cs => cs.includes(j.toLowerCase().split(" ")[0])));
  const missingRequired = jdRequired.filter(j => !matchedRequired.includes(j));

  const proficiencyColor = { beginner: "bg-gray-200", intermediate: "bg-yellow-400", advanced: "bg-blue-500", expert: "bg-green-500" };

  const TABS = ["profile", "explainability", "signals"];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-5">

      {/* Back + header */}
      <div className="flex items-start gap-4">
        <button onClick={() => navigate(-1)}
          className="mt-1 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft size={15} /> Back
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <RankBadge rank={candidate.rank} />
            <h1 className="text-xl font-bold text-gray-900">{profile.anonymized_name}</h1>
            <ScoreBar score={candidate.score} />
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{profile.current_title} · {profile.current_company} · {profile.location}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
              tab === t ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* ── Profile tab ──────────────────────────────────────────────────── */}
      {tab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">

            {/* Summary */}
            <Card>
              <SectionLabel>Summary</SectionLabel>
              <p className="text-sm text-gray-700 leading-relaxed">{profile.summary}</p>
              <div className="flex flex-wrap gap-3 mt-4 text-xs text-gray-500">
                <span className="flex items-center gap-1"><MapPin size={12} />{profile.location}, {profile.country}</span>
                <span className="flex items-center gap-1"><Briefcase size={12} />{profile.years_of_experience} years exp.</span>
                <span className="flex items-center gap-1"><GraduationCap size={12} />{education[0]?.degree} · {education[0]?.institution}</span>
              </div>
            </Card>

            {/* Career history */}
            <Card>
              <SectionLabel>Career history</SectionLabel>
              <div className="space-y-4">
                {career_history.map((c, i) => (
                  <div key={i} className="relative pl-4 border-l-2 border-gray-200">
                    <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-blue-500" />
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{c.title}</p>
                        <p className="text-xs text-gray-500">{c.company} · {c.company_size} · {c.industry}</p>
                      </div>
                      <div className="text-right text-xs text-gray-400">
                        <p>{Math.floor(c.duration_months / 12)}y {c.duration_months % 12}m</p>
                        {c.is_current && <Badge variant="green" className="mt-0.5">Current</Badge>}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{c.description}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Education */}
            <Card>
              <SectionLabel>Education</SectionLabel>
              {education.map((e, i) => (
                <div key={i} className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{e.institution}</p>
                    <p className="text-xs text-gray-500">{e.degree} in {e.field_of_study} · {e.start_year}–{e.end_year}</p>
                  </div>
                  <Badge variant={e.tier === "tier_1" ? "blue" : e.tier === "tier_2" ? "purple" : "gray"}>
                    {e.tier?.replace("_", " ")}
                  </Badge>
                </div>
              ))}
            </Card>
          </div>

          {/* Right panel */}
          <div className="space-y-5">
            {/* Skills */}
            <Card>
              <SectionLabel>Skills</SectionLabel>
              <div className="space-y-2">
                {skills.map(s => (
                  <div key={s.name} className="flex items-center gap-2">
                    <div className="flex-1 text-xs text-gray-700 truncate">{s.name}</div>
                    <div className="w-16 h-1.5 bg-gray-100 rounded-full">
                      <div className={`h-full rounded-full ${proficiencyColor[s.proficiency] || "bg-gray-300"}`}
                        style={{ width: s.proficiency === "expert" ? "100%" : s.proficiency === "advanced" ? "75%" : s.proficiency === "intermediate" ? "50%" : "25%" }} />
                    </div>
                    <span className="text-xs text-gray-400 w-20 text-right capitalize">{s.proficiency}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick signals */}
            <Card>
              <SectionLabel>Key signals</SectionLabel>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Response rate", value: `${Math.round(sig.recruiter_response_rate * 100)}%` },
                  { label: "GitHub score", value: sig.github_activity_score === -1 ? "N/A" : sig.github_activity_score },
                  { label: "Notice period", value: `${sig.notice_period_days}d` },
                  { label: "Interview rate", value: `${Math.round(sig.interview_completion_rate * 100)}%` },
                  { label: "Profile complete", value: `${sig.profile_completeness_score}%` },
                  { label: "Last active", value: sig.last_active_date },
                ].map(s => (
                  <div key={s.label} className="bg-gray-50 rounded-lg p-2.5">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">{s.label}</p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {sig.verified_email   && <Badge variant="green"><Mail size={10} className="mr-1" />Email ✓</Badge>}
                {sig.verified_phone   && <Badge variant="green"><Phone size={10} className="mr-1" />Phone ✓</Badge>}
                {sig.linkedin_connected && <Badge variant="blue"><Linkedin size={10} className="mr-1" />LinkedIn</Badge>}
                {sig.github_activity_score > 0 && <Badge variant="gray"><Github size={10} className="mr-1" />GitHub</Badge>}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── Explainability tab ───────────────────────────────────────────── */}
      {tab === "explainability" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Radar chart */}
          <Card>
            <SectionLabel>Score breakdown radar</SectionLabel>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </Card>

          {/* Bar chart */}
          <Card>
            <SectionLabel>Score component breakdown</SectionLabel>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={radarData} layout="vertical" margin={{ left: 30, right: 20 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="subject" tick={{ fontSize: 11 }} width={90} />
                <Tooltip formatter={v => `${v}%`} contentStyle={{ fontSize: 11 }} />
                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                  {radarData.map((_, i) => (
                    <Cell key={i} fill={_.score >= 90 ? "#10b981" : _.score >= 75 ? "#3b82f6" : "#f59e0b"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* AI Reasoning */}
          <Card className="lg:col-span-2">
            <SectionLabel>AI reasoning</SectionLabel>
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4 mb-4">
              <p className="text-sm text-blue-900 leading-relaxed">{reasoning}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <CheckCircle2 size={13} /> Strengths
                </p>
                <ul className="space-y-1.5">
                  {strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 size={14} className="text-green-500 mt-0.5 flex-shrink-0" /> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <AlertCircle size={13} /> Concerns
                </p>
                {concerns.length === 0
                  ? <p className="text-sm text-gray-400 italic">No significant concerns identified.</p>
                  : <ul className="space-y-1.5">
                      {concerns.map((c, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <XCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" /> {c}
                        </li>
                      ))}
                    </ul>
                }
              </div>
            </div>
          </Card>

          {/* Skill match */}
          <Card className="lg:col-span-2">
            <SectionLabel>JD skill match analysis</SectionLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-medium text-green-700 mb-2">Required skills — matched ({matchedRequired.length}/{jdRequired.length})</p>
                <div className="flex flex-wrap gap-2">
                  {jdRequired.map(s => (
                    <SkillTag key={s} matched={matchedRequired.includes(s)}>{s}</SkillTag>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">Preferred skills from JD</p>
                <div className="flex flex-wrap gap-2">
                  {JD_PROFILE.preferred_skills.map(s => (
                    <SkillTag key={s}>{s}</SkillTag>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ── Signals tab ──────────────────────────────────────────────────── */}
      {tab === "signals" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: "Profile completeness", value: `${sig.profile_completeness_score}%`, color: sig.profile_completeness_score >= 80 ? "green" : "yellow" },
            { label: "Last active date", value: sig.last_active_date, color: "gray" },
            { label: "Open to work", value: sig.open_to_work_flag ? "Yes" : "No", color: sig.open_to_work_flag ? "green" : "yellow" },
            { label: "Profile views (30d)", value: sig.profile_views_received_30d, color: "blue" },
            { label: "Applications (30d)", value: sig.applications_submitted_30d, color: "gray" },
            { label: "Recruiter response rate", value: `${Math.round(sig.recruiter_response_rate * 100)}%`, color: sig.recruiter_response_rate >= 0.7 ? "green" : "yellow" },
            { label: "Avg response time", value: `${sig.avg_response_time_hours}h`, color: "gray" },
            { label: "Connection count", value: sig.connection_count, color: "gray" },
            { label: "Endorsements received", value: sig.endorsements_received, color: "gray" },
            { label: "Notice period", value: `${sig.notice_period_days} days`, color: sig.notice_period_days <= 30 ? "green" : sig.notice_period_days <= 60 ? "yellow" : "red" },
            { label: "Salary range (LPA)", value: `₹${sig.expected_salary_range_inr_lpa.min}–${sig.expected_salary_range_inr_lpa.max}L`, color: "gray" },
            { label: "Work mode", value: sig.preferred_work_mode, color: "blue" },
            { label: "Willing to relocate", value: sig.willing_to_relocate ? "Yes" : "No", color: sig.willing_to_relocate ? "green" : "yellow" },
            { label: "GitHub activity score", value: sig.github_activity_score === -1 ? "No GitHub" : sig.github_activity_score, color: sig.github_activity_score > 60 ? "green" : "yellow" },
            { label: "Saved by recruiters (30d)", value: sig.saved_by_recruiters_30d, color: "gray" },
            { label: "Interview completion rate", value: `${Math.round(sig.interview_completion_rate * 100)}%`, color: sig.interview_completion_rate >= 0.8 ? "green" : "yellow" },
            { label: "Offer acceptance rate", value: sig.offer_acceptance_rate === -1 ? "No history" : `${Math.round(sig.offer_acceptance_rate * 100)}%`, color: "gray" },
            { label: "Verified email", value: sig.verified_email ? "Yes" : "No", color: sig.verified_email ? "green" : "red" },
            { label: "Verified phone", value: sig.verified_phone ? "Yes" : "No", color: sig.verified_phone ? "green" : "red" },
            { label: "LinkedIn connected", value: sig.linkedin_connected ? "Yes" : "No", color: sig.linkedin_connected ? "blue" : "gray" },
          ].map(s => (
            <Card key={s.label} className="flex justify-between items-center">
              <p className="text-xs text-gray-500">{s.label}</p>
              <Badge variant={s.color}>{s.value}</Badge>
            </Card>
          ))}
          {/* Skill assessment scores */}
          {Object.keys(sig.skill_assessment_scores).length > 0 && (
            <Card className="col-span-full">
              <SectionLabel>Skill assessment scores (TalentRank AI Platform)</SectionLabel>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(sig.skill_assessment_scores).map(([skill, score]) => (
                  <div key={skill} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">{skill}</p>
                    <p className="text-lg font-bold text-gray-900 mt-0.5">{score}</p>
                    <div className="h-1 bg-gray-200 rounded mt-1.5">
                      <div className={`h-full rounded ${score >= 80 ? "bg-green-500" : score >= 60 ? "bg-blue-500" : "bg-yellow-400"}`}
                        style={{ width: `${score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
