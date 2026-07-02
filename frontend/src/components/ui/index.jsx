import { Loader2 } from "lucide-react";

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ variant = "gray", children, className = "" }) {
  const variants = {
    green:  "bg-green-100 text-green-800",
    yellow: "bg-yellow-100 text-yellow-800",
    red:    "bg-red-100 text-red-800",
    blue:   "bg-blue-100 text-blue-800",
    purple: "bg-purple-100 text-purple-800",
    gray:   "bg-gray-100 text-gray-700",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

// ─── RankBadge ────────────────────────────────────────────────────────────────
export function RankBadge({ rank }) {
  const styles =
    rank === 1 ? "bg-yellow-400 text-yellow-900" :
    rank === 2 ? "bg-gray-300 text-gray-800" :
    rank === 3 ? "bg-orange-300 text-orange-900" :
    "bg-gray-100 text-gray-600 border border-gray-200";
  return (
    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${styles}`}>
      {rank}
    </span>
  );
}

// ─── ScoreBar ────────────────────────────────────────────────────────────────
export function ScoreBar({ score, showLabel = true }) {
  const pct = Math.round(score * 100);
  const color = pct >= 90 ? "bg-green-500" : pct >= 75 ? "bg-blue-500" : pct >= 60 ? "bg-yellow-500" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      {showLabel && <span className="text-xs font-semibold text-gray-700 tabular-nums">{score.toFixed(3)}</span>}
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className = "", padding = true }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${padding ? "p-5" : ""} ${className}`}>
      {children}
    </div>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 20, className = "" }) {
  return <Loader2 size={size} className={`animate-spin text-blue-600 ${className}`} />;
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, icon: Icon, color = "blue" }) {
  const colors = {
    blue:   "bg-blue-50 text-blue-600",
    green:  "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
        </div>
        {Icon && (
          <span className={`p-2 rounded-lg ${colors[color]}`}>
            <Icon size={18} />
          </span>
        )}
      </div>
    </Card>
  );
}

// ─── SkillTag ─────────────────────────────────────────────────────────────────
export function SkillTag({ children, matched = null }) {
  if (matched === true)  return <span className="px-2.5 py-0.5 rounded-full text-xs bg-green-100 text-green-800 border border-green-200">{children}</span>;
  if (matched === false) return <span className="px-2.5 py-0.5 rounded-full text-xs bg-red-100 text-red-700 border border-red-200">{children}</span>;
  return <span className="px-2.5 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700 border border-gray-200">{children}</span>;
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && <Icon size={40} className="text-gray-300 mb-3" />}
      <p className="text-sm font-medium text-gray-600">{title}</p>
      {description && <p className="text-xs text-gray-400 mt-1 max-w-xs">{description}</p>}
    </div>
  );
}

// ─── SectionLabel ─────────────────────────────────────────────────────────────
export function SectionLabel({ children }) {
  return (
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">{children}</p>
  );
}
