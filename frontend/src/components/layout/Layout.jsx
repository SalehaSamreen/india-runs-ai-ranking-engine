import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, ListOrdered, Upload, Download,
  ChevronRight, Zap, GitBranch, Users, AlertTriangle,
  Lightbulb, Eye,
} from "lucide-react";

const NAV_MAIN = [
  { to: "/",        icon: LayoutDashboard, label: "Dashboard" },
  { to: "/ranking", icon: ListOrdered,     label: "Rankings" },
];

const NAV_INSIGHTS = [
  { to: "/pipeline",           icon: GitBranch,      label: "AI Pipeline" },
  { to: "/behavioral",         icon: Users,          label: "Behavioral" },
  { to: "/fraud-detection",    icon: AlertTriangle,  label: "Fraud Detection" },
  { to: "/explainability",     icon: Lightbulb,      label: "Explainability" },
  { to: "/view-jd",            icon: Eye,            label: "View JD" },
];

const NAV_TOOLS = [
  { to: "/upload",  icon: Upload,   label: "Upload JD" },
  { to: "/export",  icon: Download, label: "Export" },
];

export function Layout({ children }) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="w-56 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
      {/* Logo */}
      <div className="p-4 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Zap size={14} className="text-white" />
          </span>
          <div>
            <div className="text-sm font-bold text-gray-900">TalentRank AI</div>
            <div className="text-[10px] text-gray-400">Candidate Intelligence Platform</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-6 overflow-y-auto">
        {/* Main */}
        <div className="space-y-0.5">
          <p className="text-xs font-semibold text-gray-400 uppercase px-3 py-2 tracking-wide">Main</p>
          {NAV_MAIN.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} className={isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"} />
                  {label}
                  {isActive && <ChevronRight size={12} className="ml-auto text-blue-400" />}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Insights & Analytics */}
        <div className="space-y-0.5">
          <p className="text-xs font-semibold text-gray-400 uppercase px-3 py-2 tracking-wide">Analysis</p>
          {NAV_INSIGHTS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} className={isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"} />
                  {label}
                  {isActive && <ChevronRight size={12} className="ml-auto text-blue-400" />}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Tools */}
        <div className="space-y-0.5">
          <p className="text-xs font-semibold text-gray-400 uppercase px-3 py-2 tracking-wide">Tools</p>
          {NAV_TOOLS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} className={isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"} />
                  {label}
                  {isActive && <ChevronRight size={12} className="ml-auto text-blue-400" />}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 bg-gray-50 flex-shrink-0 space-y-2">
        <div className="text-xs text-gray-500 space-y-1">
          <p><span className="font-semibold">Ranking:</span> Top 100 Ranked Candidates</p>
          <p className="text-green-600 font-medium">✓ Ranking pipeline completed</p>
        </div>
      </div>
    </aside>
  );
}

function Topbar() {
  const location = useLocation();
  const titles = {
    "/":                 { title: "Dashboard", sub: "Dashboard — Candidate Ranking Overview" },
    "/ranking":          { title: "Rankings", sub: "Top 100 candidates ranked by fit" },
    "/pipeline":         { title: "AI Pipeline", sub: "Visual ranking pipeline flow" },
    "/behavioral":       { title: "Behavioral Analysis", sub: "Engagement and interview signals" },
    "/fraud-detection":  { title: "Fraud Detection", sub: "Keyword stuffing and profile validation" },
    "/explainability":   { title: "Explainability", sub: "Understanding ranking decisions" },
    "/view-jd":          { title: "View JD", sub: "Job description and matching criteria" },
    "/upload":           { title: "Upload JD", sub: "Job description parser" },
    "/export":           { title: "Export", sub: "Candidate submission file" },
  };
  // handle dynamic routes like /candidate/:id
  const base = location.pathname.startsWith("/candidate")
    ? { title: "Candidate Detail", sub: "Profile, explainability, and signals" }
    : titles[location.pathname] || { title: "TalentRank AI", sub: "" };

  return (
    <header className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
      <div>
        <span className="text-sm font-semibold text-gray-900">{base.title}</span>
        {base.sub && <span className="ml-2 text-xs text-gray-400">{base.sub}</span>}
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
        TalentRank AI — Candidate Intelligence Platform
      </div>
    </header>
  );
}
