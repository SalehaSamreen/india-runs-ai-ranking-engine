import { useNavigate } from "react-router-dom";
import { Users, Trophy, AlertTriangle, Zap, TrendingUp, Activity } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { StatCard, Card, RankBadge, ScoreBar, Badge, Spinner, SectionLabel } from "../components/ui";
import { useRankings, useMetrics } from "../hooks/useRankings";

const PIE_COLORS = ["#3b82f6","#10b981","#f59e0b","#ef4444","#8b5cf6","#6b7280"];

export default function Dashboard() {
  const { candidates, loading: cLoading } = useRankings();
  const { metrics, loading: mLoading } = useMetrics();
  const navigate = useNavigate();

  if (mLoading || cLoading) {
    return <div className="flex items-center justify-center h-64"><Spinner size={32} /></div>;
  }

  const mins = Math.floor(metrics.runtimeSeconds / 60);
  const secs = metrics.runtimeSeconds % 60;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AI-Powered Candidate Discovery Dashboard</h1>
        <p className="text-base text-gray-600 mt-1">Comprehensive candidate analysis using semantic understanding, behavioral intelligence, fraud detection, and hybrid scoring.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Profiles analyzed" value={metrics.totalCandidates.toLocaleString()}
          sub="from input source" icon={Users} color="blue" />
        <StatCard label="Final shortlisted candidates" value={metrics.top100Selected}
          sub={`avg score ${metrics.avgScore.toFixed(2)}`} icon={Trophy} color="green" />
        <StatCard label="Fraudulent profiles detected" value={metrics.honeypotsDetected}
          sub="penalized & excluded" icon={AlertTriangle} color="orange" />
        <StatCard label="Processing runtime" value={`${mins}m ${secs}s`}
          sub={`${metrics.ramUsedGB} GB RAM used`} icon={Zap} color="purple" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Score distribution */}
        <Card className="lg:col-span-2">
          <SectionLabel>Candidate score distribution</SectionLabel>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={metrics.scoreBuckets} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis dataKey="range" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Location breakdown */}
        <Card>
          <SectionLabel>Candidate geographic distribution</SectionLabel>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={metrics.locationBreakdown} dataKey="count" nameKey="city"
                cx="50%" cy="50%" outerRadius={70} label={false}>
                {metrics.locationBreakdown.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Skill distribution */}
      <Card>
          <SectionLabel>Top skills among shortlisted candidates</SectionLabel>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { skill: "Python", candidates: candidates.filter(c => c.skills?.some(s => s.name === "Python")).length },
            { skill: "Embeddings", candidates: candidates.filter(c => c.skills?.some(s => s.name === "Embeddings")).length },
            { skill: "Retrieval systems", candidates: candidates.filter(c => c.skills?.some(s => s.name === "Retrieval systems")).length },
            { skill: "Ranking systems", candidates: candidates.filter(c => c.skills?.some(s => s.name === "Ranking systems")).length },
            { skill: "Vector databases", candidates: candidates.filter(c => c.skills?.some(s => s.name.includes("database"))).length },
            { skill: "NDCG/MAP evaluation", candidates: candidates.filter(c => c.skills?.some(s => s.name.includes("NDCG"))).length },
          ].map(({ skill, candidates: count }) => (
            <div key={skill} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-semibold text-gray-900">{skill}</p>
              <p className="text-lg font-bold text-blue-600 mt-1">{count}</p>
              <p className="text-xs text-gray-500 mt-0.5">{((count / candidates.length) * 100).toFixed(0)}% of top 100</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Signal weights */}
      <Card>
          <SectionLabel>Hybrid ranking model weights</SectionLabel>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {metrics.signalWeights.map((s) => (
            <div key={s.signal} className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-600">{s.signal}</span>
                  <span className="text-xs font-semibold text-gray-800">{s.weight}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${s.weight * 3}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Behavioral signals */}
      <Card>
          <SectionLabel>Behavioral intelligence metrics</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Open to Work</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {candidates.filter(c => c.redrob_signals?.open_to_work_flag).length}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {((candidates.filter(c => c.redrob_signals?.open_to_work_flag).length / candidates.length) * 100).toFixed(0)}% available
                </p>
              </div>
              <Activity size={20} className="text-green-600" />
            </div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Avg Response Rate</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {(candidates.reduce((sum, c) => sum + (c.redrob_signals?.recruiter_response_rate || 0), 0) / candidates.length * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-gray-500 mt-0.5">recruiter engagement</p>
              </div>
              <TrendingUp size={20} className="text-blue-600" />
            </div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Interview Rate</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {(candidates.reduce((sum, c) => sum + (c.redrob_signals?.interview_completion_rate || 0), 0) / candidates.length * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-gray-500 mt-0.5">completion rate</p>
              </div>
              <Trophy size={20} className="text-purple-600" />
            </div>
          </div>
        </div>
      </Card>

      {/* Top 10 table */}
      <Card padding={false}>
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Highest ranked candidates</h3>
          <button onClick={() => navigate("/ranking")}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium">
            View all 100 →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Rank", "Candidate", "Current Role", "Experience", "Location", "Score", "Status"].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {candidates.slice(0, 10).map((c) => (
                <tr key={c.candidate_id}
                  onClick={() => navigate(`/candidate/${c.candidate_id}`)}
                  className="hover:bg-blue-50/50 cursor-pointer transition-colors">
                  <td className="px-4 py-3"><RankBadge rank={c.rank} /></td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{c.profile.anonymized_name}</div>
                    <div className="text-xs text-gray-400 font-mono">{c.candidate_id}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-800">{c.profile.current_title}</div>
                    <div className="text-xs text-gray-400">{c.profile.current_company}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{c.profile.years_of_experience} yrs</td>
                  <td className="px-4 py-3 text-gray-700">{c.profile.location}</td>
                  <td className="px-4 py-3"><ScoreBar score={c.score} /></td>
                  <td className="px-4 py-3">
                    <Badge variant={c.redrob_signals.open_to_work_flag ? "green" : "yellow"}>
                      {c.redrob_signals.open_to_work_flag ? "Open" : "Passive"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
