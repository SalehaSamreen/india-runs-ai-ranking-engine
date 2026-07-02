import { useBehavioralAnalysis } from "../hooks/useRankings";
import { Spinner, Card, SectionLabel, Badge } from "../components/ui";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ScatterChart, Scatter } from "recharts";
import { TrendingUp, Users, MessageSquare, Github, AlertCircle } from "lucide-react";

export default function BehavioralAnalysis() {
  const { data, loading } = useBehavioralAnalysis();

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Spinner size={32} /></div>;
  }

  if (!data) return <div className="p-6 text-gray-500">Behavioral data not available</div>;

  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Behavioral Analysis</h1>
        <p className="text-sm text-gray-500 mt-1">Engagement signals and interview readiness metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Recruiter Response Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {(data.summary.avg_recruiter_response_rate * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Top 100 average</p>
            </div>
            <span className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <MessageSquare size={18} />
            </span>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Interview Completion</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {(data.summary.avg_interview_completion_rate * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Completion rate</p>
            </div>
            <span className="p-2 bg-green-50 rounded-lg text-green-600">
              <TrendingUp size={18} />
            </span>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Open to Work</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {data.summary.open_to_work_percent}%
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Available candidates</p>
            </div>
            <span className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <Users size={18} />
            </span>
          </div>
        </Card>
      </div>

      {/* Engagement by company */}
      <Card>
        <SectionLabel>Engagement metrics by company</SectionLabel>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-2">Company</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-2">Count</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-2">Recruiter Response</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-2">Interview Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.by_company.map((company, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{company.company}</td>
                  <td className="px-4 py-3 text-gray-700">{company.count} candidates</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${company.avg_response_rate * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-700">
                        {(company.avg_response_rate * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={company.avg_interview_rate > 0.90 ? "green" : "blue"}>
                      {(company.avg_interview_rate * 100).toFixed(0)}%
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Response rate distribution */}
      <Card>
        <SectionLabel>Recruiter response rate distribution</SectionLabel>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.by_company} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <XAxis dataKey="company" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} domain={[0, 1]} />
            <Tooltip
              formatter={(value) => `${(value * 100).toFixed(1)}%`}
              contentStyle={{ fontSize: 12 }}
            />
            <Bar dataKey="avg_response_rate" radius={[4, 4, 0, 0]}>
              {data.by_company.map((_, idx) => (
                <Cell key={idx} fill={colors[idx % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* GitHub Activity */}
      <Card>
        <SectionLabel>GitHub activity score</SectionLabel>
        <div className="flex items-center gap-4">
          <span className="p-3 bg-gray-100 rounded-lg text-gray-600">
            <Github size={24} />
          </span>
          <div>
            <p className="text-2xl font-bold text-gray-900">{data.summary.avg_github_activity_score}</p>
            <p className="text-sm text-gray-500">Average activity score (0-100)</p>
          </div>
        </div>
      </Card>

      {/* Key signals */}
      <Card>
        <SectionLabel>Key behavioral signals</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <span className="text-green-500 text-lg">✓</span>
            <div>
              <p className="font-medium text-gray-900">{data.summary.actively_interviewing} candidates</p>
              <p className="text-sm text-gray-500">actively interviewing</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-500 text-lg">✓</span>
            <div>
              <p className="font-medium text-gray-900">{data.summary.open_to_work_percent}%</p>
              <p className="text-sm text-gray-500">open to work</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
