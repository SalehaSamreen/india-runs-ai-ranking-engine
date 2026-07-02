import { useExplainability } from "../hooks/useRankings";
import { Spinner, Card, SectionLabel, Badge } from "../components/ui";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";
import { TrendingUp, TrendingDown, Zap } from "lucide-react";

export default function Explainability() {
  const { data, loading } = useExplainability();

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Spinner size={32} /></div>;
  }

  if (!data) return <div className="p-6 text-gray-500">Explainability data not available</div>;

  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ranking Explainability</h1>
        <p className="text-sm text-gray-500 mt-1">Understanding what drives candidate scores and ranking decisions</p>
      </div>

      {/* Average confidence */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Average Confidence Score</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {(data.avg_confidence * 100).toFixed(1)}%
            </p>
            <p className="text-sm text-gray-500 mt-1">How certain the ranking algorithm is</p>
          </div>
          <span className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <Zap size={28} />
          </span>
        </div>
      </Card>

      {/* Score drivers */}
      <Card>
        <SectionLabel>Score component importance</SectionLabel>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.score_drivers} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="driver"
              tick={{ fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 11 }} domain={[0, 0.35]} />
            <Tooltip
              formatter={(value) => (value * 100).toFixed(1) + "%"}
              contentStyle={{ fontSize: 12 }}
            />
            <Bar dataKey="impact" radius={[4, 4, 0, 0]}>
              {data.score_drivers.map((_, idx) => (
                <Cell key={idx} fill={colors[idx]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Score drivers detail */}
      <Card>
        <SectionLabel>Score component breakdown</SectionLabel>
        <div className="space-y-4">
          {data.score_drivers.map((driver, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">{driver.driver}</span>
                  {driver.trend === "up" && (
                    <span className="text-green-500 flex items-center gap-0.5">
                      <TrendingUp size={14} /> Increasing
                    </span>
                  )}
                  {driver.trend === "down" && (
                    <span className="text-red-500 flex items-center gap-0.5">
                      <TrendingDown size={14} /> Decreasing
                    </span>
                  )}
                  {driver.trend === "stable" && (
                    <span className="text-gray-500 text-sm">Stable</span>
                  )}
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {(driver.impact * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${colors[idx % colors.length].replace("#", "bg-")}`}
                  style={{
                    width: `${driver.impact * 100}%`,
                    backgroundColor: colors[idx]
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Key strengths */}
      <Card>
        <SectionLabel>Top candidate strengths</SectionLabel>
        <div className="space-y-2">
          {data.top_strengths.map((strength, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <span className="text-green-600 text-lg flex-shrink-0">✓</span>
              <p className="text-sm text-green-900">{strength}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Key concerns */}
      <Card>
        <SectionLabel>Common candidate concerns</SectionLabel>
        <div className="space-y-2">
          {data.top_concerns.map((concern, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <span className="text-yellow-600 text-lg flex-shrink-0">⚠</span>
              <p className="text-sm text-yellow-900">{concern}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Explanation framework */}
      <Card>
        <SectionLabel>How we calculate scores</SectionLabel>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-900 text-sm mb-2">1. Career Relevance (30%)</h4>
            <p className="text-sm text-gray-700">
              Years of relevant experience, progression level, and product company background. Higher weight for candidates from companies with proven ranking/retrieval systems.
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-900 text-sm mb-2">2. Semantic Match (25%)</h4>
            <p className="text-sm text-gray-700">
              Profile summary and headline similarity to JD using embedding-based similarity. Detects candidates who understand the problem domain.
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-900 text-sm mb-2">3. Skill Overlap (20%)</h4>
            <p className="text-sm text-gray-700">
              Explicit match on required skills (Python, Embeddings, Vector DB, etc.) and proficiency levels. Bonus for preferred skills and open-source contributions.
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-900 text-sm mb-2">4. Product Experience (10%)</h4>
            <p className="text-sm text-gray-700">
              Indicator of shipping mindset vs. research-only background. Bonus for large-scale production systems and A/B testing experience.
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-900 text-sm mb-2">5. Behavioral Score (10%)</h4>
            <p className="text-sm text-gray-700">
              Recruiter response rates, interview completion, GitHub activity, and engagement signals. Indicates availability and responsiveness.
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-900 text-sm mb-2">6. Stability (5%)</h4>
            <p className="text-sm text-gray-700">
              Career tenure, notice period, and job hopping patterns. Predicts likelihood of accepting offer and staying with the company.
            </p>
          </div>
        </div>
      </Card>

      {/* Confidence intervals */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="font-semibold text-blue-900 text-sm">Confidence Score Interpretation</p>
        <div className="mt-3 space-y-2 text-sm text-blue-800">
          <p><span className="font-semibold">90-100%:</span> Excellent match with strong signals across all dimensions</p>
          <p><span className="font-semibold">80-89%:</span> Good match with one or two minor concerns</p>
          <p><span className="font-semibold">70-79%:</span> Moderate match with some missing skills or signals</p>
          <p><span className="font-semibold">&lt;70%:</span> Candidate may have profile or availability concerns</p>
        </div>
      </div>
    </div>
  );
}
