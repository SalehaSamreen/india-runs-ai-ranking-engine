import { usePipelineMetrics } from "../hooks/useRankings";
import { Spinner, Card, SectionLabel } from "../components/ui";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ArrowRight, Database, Zap } from "lucide-react";

export default function Pipeline() {
  const { metrics, loading } = usePipelineMetrics();

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Spinner size={32} /></div>;
  }

  if (!metrics) return <div className="p-6 text-gray-500">Pipeline metrics not available</div>;

  const colors = [
    "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
    "#ec4899", "#06b6d4", "#14b8a6"
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Ranking Pipeline</h1>
        <p className="text-sm text-gray-500 mt-1">Visual flow of candidate processing through ranking stages</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Total Runtime</div>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {(metrics.total_runtime_ms / 1000).toFixed(2)}s
          </p>
        </Card>
        <Card>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Processed</div>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {metrics.stages[0].input.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">candidates</p>
        </Card>
        <Card>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Eliminated</div>
          <p className="text-2xl font-bold text-red-600 mt-2">
            {metrics.candidates_eliminated.total.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {((metrics.candidates_eliminated.total / metrics.stages[0].input) * 100).toFixed(1)}%
          </p>
        </Card>
      </div>

      {/* Pipeline Flow Diagram */}
      <Card>
        <SectionLabel>Pipeline stages</SectionLabel>
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-2 min-w-max">
            {metrics.stages.map((stage, idx) => (
              <div key={idx} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className="w-24 bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                    <div className="text-xs font-semibold text-gray-700 truncate">{stage.stage}</div>
                    <div className="text-xs text-gray-500 mt-1">{stage.time_ms}ms</div>
                    <div className="text-xs font-mono text-blue-600 mt-1.5">
                      {stage.output.toLocaleString()}
                    </div>
                  </div>
                </div>
                {idx < metrics.stages.length - 1 && (
                  <ArrowRight size={20} className="text-gray-400 mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Timing by stage */}
      <Card>
        <SectionLabel>Runtime by stage</SectionLabel>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={metrics.stages} margin={{ top: 4, right: 4, left: -20, bottom: 80 }}>
            <XAxis 
              dataKey="stage" 
              tick={{ fontSize: 10 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip 
              formatter={(value) => `${value}ms`}
              contentStyle={{ fontSize: 12 }}
            />
            <Bar dataKey="time_ms" radius={[4, 4, 0, 0]}>
              {metrics.stages.map((_, idx) => (
                <Cell key={idx} fill={colors[idx % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Candidate flow */}
      <Card>
        <SectionLabel>Candidate flow through pipeline</SectionLabel>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={metrics.stages} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="stage"
              tick={{ fontSize: 10 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ fontSize: 12 }} />
            <Line 
              type="monotone"
              dataKey="output"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Elimination breakdown */}
      <Card>
        <SectionLabel>Candidate eliminations</SectionLabel>
        <div className="space-y-3">
          {[
            { label: "Semantic mismatch", value: metrics.candidates_eliminated.semantic_mismatch },
            { label: "Fraud detected", value: metrics.candidates_eliminated.fraud_detected },
          ].map((item, idx) => {
            const pct = (item.value / metrics.candidates_eliminated.total) * 100;
            return (
              <div key={idx}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-700">{item.label}</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {item.value.toLocaleString()} ({pct.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${idx === 0 ? "bg-yellow-500" : "bg-red-500"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
