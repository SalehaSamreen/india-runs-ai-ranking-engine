import { useFraudDetection } from "../hooks/useRankings";
import { Spinner, Card, SectionLabel, Badge } from "../components/ui";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { AlertTriangle, Shield } from "lucide-react";

export default function FraudDetection() {
  const { data, loading } = useFraudDetection();

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Spinner size={32} /></div>;
  }

  if (!data) return <div className="p-6 text-gray-500">Fraud detection data not available</div>;

  const colors = ["#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high": return "text-red-600 bg-red-50";
      case "medium": return "text-yellow-600 bg-yellow-50";
      case "low": return "text-blue-600 bg-blue-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Fraud Detection</h1>
        <p className="text-sm text-gray-500 mt-1">Keyword stuffing, fake profiles, career inconsistencies, and job hopping detection</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Analyzed</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {data.total_analyzed.toLocaleString()}
              </p>
            </div>
            <span className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Shield size={18} />
            </span>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fraud Detected</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {data.fraud_detected.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {(data.fraud_rate * 100).toFixed(2)}% rate
              </p>
            </div>
            <span className="p-2 bg-red-50 rounded-lg text-red-600">
              <AlertTriangle size={18} />
            </span>
          </div>
        </Card>

        <Card>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">High Risk</p>
            <p className="text-2xl font-bold text-red-600 mt-1">
              {data.risk_distribution.find(r => r.risk === "High risk")?.count || 0}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {data.risk_distribution.find(r => r.risk === "High risk")?.percent || 0}% of total
            </p>
          </div>
        </Card>

        <Card>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Clean Profiles</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {data.risk_distribution.find(r => r.risk === "No risk")?.count || 0}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {data.risk_distribution.find(r => r.risk === "No risk")?.percent || 0}% of total
            </p>
          </div>
        </Card>
      </div>

      {/* Risk distribution pie chart */}
      <Card>
        <SectionLabel>Overall fraud risk distribution</SectionLabel>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data.risk_distribution}
              dataKey="count"
              nameKey="risk"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ risk, percent }) => `${risk} ${percent}%`}
            >
              <Cell fill="#10b981" />
              <Cell fill="#f59e0b" />
              <Cell fill="#f97316" />
              <Cell fill="#ef4444" />
            </Pie>
            <Tooltip
              formatter={(value) => value.toLocaleString()}
              contentStyle={{ fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      {/* Fraud types breakdown */}
      <Card>
        <SectionLabel>Fraud detection by type</SectionLabel>
        <div className="space-y-4">
          {data.by_type.map((fraud, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">{fraud.type}</span>
                  <Badge variant={fraud.severity === "high" ? "red" : fraud.severity === "medium" ? "yellow" : "blue"}>
                    {fraud.severity}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{fraud.count.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{(fraud.rate * 100).toFixed(2)}%</p>
                </div>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    fraud.severity === "high"
                      ? "bg-red-500"
                      : fraud.severity === "medium"
                      ? "bg-yellow-500"
                      : "bg-blue-500"
                  }`}
                  style={{ width: `${(fraud.count / data.fraud_detected) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Fraud types chart */}
      <Card>
        <SectionLabel>Fraud cases by type</SectionLabel>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.by_type} margin={{ top: 4, right: 4, left: -20, bottom: 80 }}>
            <XAxis
              dataKey="type"
              tick={{ fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(value) => value.toLocaleString()}
              contentStyle={{ fontSize: 12 }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.by_type.map((_, idx) => (
                <Cell key={idx} fill={colors[idx]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Fraud detection methods */}
      <Card>
        <SectionLabel>Detection methods</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="font-semibold text-gray-900 text-sm">Keyword Stuffing</p>
            <p className="text-xs text-gray-600 mt-2">Detects unnatural repetition of required keywords in profile without context.</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="font-semibold text-gray-900 text-sm">Fake Profile Detection</p>
            <p className="text-xs text-gray-600 mt-2">Identifies profiles with suspicious patterns, missing verification, or inconsistent data.</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="font-semibold text-gray-900 text-sm">Career Inconsistency</p>
            <p className="text-xs text-gray-600 mt-2">Flags gaps, timeline mismatches, and illogical career progression patterns.</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="font-semibold text-gray-900 text-sm">Job Hopping Anomaly</p>
            <p className="text-xs text-gray-600 mt-2">Detects excessive job changes suggesting instability or inflated experience claims.</p>
          </div>
        </div>
      </Card>

      {/* Information box */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
        <AlertTriangle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-blue-900 text-sm">Fraud Detection Context</p>
          <p className="text-sm text-blue-700 mt-1">
            These signals help identify candidates with potential credibility issues. All flagged candidates are still included in the top 100 but marked with concern flags in their profiles for recruiter review.
          </p>
        </div>
      </div>
    </div>
  );
}
