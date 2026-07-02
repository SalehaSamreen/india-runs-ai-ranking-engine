import { Download, CheckCircle2, Terminal, Package, FileText } from "lucide-react";
import { Card, Badge, Spinner, SectionLabel } from "../components/ui";
import { useRankings } from "../hooks/useRankings";
import { downloadCSV, downloadXLSX } from "../services/api";

export default function Export() {
  const { candidates, loading } = useRankings();

  const scores = candidates.map(c => c.score);
  const minScore = scores.length ? Math.min(...scores).toFixed(3) : "—";
  const maxScore = scores.length ? Math.max(...scores).toFixed(3) : "—";
  const avgScore = scores.length ? (scores.reduce((a, b) => a + b) / scores.length).toFixed(3) : "—";
  const allReasoned = candidates.filter(c => c.reasoning?.trim()).length;

  const CHECKLIST = [
    { label: "Exactly 100 rows", ok: candidates.length === 100 },
    { label: "Ranks 1–100 unique", ok: candidates.every((c, idx) => c.rank === idx + 1) },
    { label: "Scores non-increasing", ok: candidates.every((c, idx) => idx === 0 || c.score <= candidates[idx - 1].score) },
    { label: "All candidate_ids valid (CAND_XXXXXXX)", ok: candidates.every(c => /^CAND_\d{7}$/.test(c.candidate_id)) },
    { label: `Reasoning filled (${allReasoned}/${candidates.length})`, ok: allReasoned === candidates.length },
    { label: "Profile data complete", ok: candidates.every(c => c.profile?.anonymized_name && c.profile?.current_title) },
    { label: "Score range valid (0.7–1.0)", ok: candidates.every(c => c.score >= 0.7 && c.score <= 1.0) },
  ];

  const passCount = CHECKLIST.filter(c => c.ok).length;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Export Top 100 Candidates</h1>
        <p className="text-sm text-gray-500 mt-1">Download candidate rankings in CSV or XLSX format</p>
      </div>

      {/* File summary */}
      <Card>
        <SectionLabel>Submission summary</SectionLabel>
        {loading ? <Spinner /> : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total candidates", value: candidates.length },
              { label: "Minimum score", value: minScore },
              { label: "Maximum score", value: maxScore },
              { label: "Average score", value: avgScore },
            ].map(r => (
              <div key={r.label} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-gray-500 uppercase tracking-wide">{r.label}</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">{r.value}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Validation checklist */}
      <Card>
        <SectionLabel>Pre-submission validation</SectionLabel>
        <div className="space-y-2 mb-4">
          {CHECKLIST.map((c, idx) => (
            <div key={idx} className="flex items-center gap-3 text-sm">
              <CheckCircle2 size={16} className={c.ok ? "text-green-500" : "text-red-400"} />
              <span className={c.ok ? "text-gray-700" : "text-red-600"}>{c.label}</span>
              {c.ok
                ? <Badge variant="green" className="ml-auto">Pass</Badge>
                : <Badge variant="red" className="ml-auto">Fail</Badge>
              }
            </div>
          ))}
        </div>
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-900">
            {passCount}/{CHECKLIST.length} checks passed
          </p>
          {passCount === CHECKLIST.length && (
            <p className="text-xs text-green-600 mt-1">✓ Ready for submission</p>
          )}
          {passCount < CHECKLIST.length && (
            <p className="text-xs text-red-600 mt-1">✗ Please review failed checks before submitting</p>
          )}
        </div>
      </Card>

      {/* File preview */}
      <Card>
        <SectionLabel>File format preview</SectionLabel>
        <div className="bg-gray-50 rounded-lg p-4 font-mono text-xs overflow-x-auto">
          <div className="space-y-1 text-gray-700">
            <div>candidate_id,rank,score,name,title,company,experience,location,reasoning</div>
            {candidates.slice(0, 3).map((c, idx) => (
              <div key={idx}>
                {c.candidate_id},
                {c.rank},
                {c.score.toFixed(3)},
                "{c.profile.anonymized_name}",
                "{c.profile.current_title}",
                "{c.profile.current_company}",
                {c.profile.years_of_experience},
                "{c.profile.location}",
                "{(c.reasoning || '').substring(0, 50)}..."
              </div>
            ))}
            <div className="text-gray-400">... ({candidates.length - 3} more rows)</div>
          </div>
        </div>
      </Card>

      {/* Download options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-100 rounded-full -mr-10 -mt-10 opacity-20" />
          <div className="relative z-10">
            <div className="flex items-start gap-3 mb-4">
              <span className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <FileText size={20} />
              </span>
              <div>
                <h3 className="font-semibold text-gray-900">CSV Format</h3>
                <p className="text-xs text-gray-500">Lightweight, universal compatibility</p>
              </div>
            </div>
            <button
              onClick={() => downloadCSV(candidates)}
              disabled={loading || candidates.length === 0}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {loading ? <Spinner size={14} /> : <Download size={14} />}
              Download CSV
            </button>
            <p className="text-xs text-gray-400 mt-2">talentrank_top100.csv (~50 KB)</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-100 rounded-full -mr-10 -mt-10 opacity-20" />
          <div className="relative z-10">
            <div className="flex items-start gap-3 mb-4">
              <span className="p-2 bg-green-100 rounded-lg text-green-600">
                <Package size={20} />
              </span>
              <div>
                <h3 className="font-semibold text-gray-900">XLSX Format</h3>
                <p className="text-xs text-gray-500">Excel spreadsheet with formatting</p>
              </div>
            </div>
            <button
              onClick={() => downloadXLSX(candidates)}
              disabled={loading || candidates.length === 0}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {loading ? <Spinner size={14} /> : <Download size={14} />}
              Download XLSX
            </button>
            <p className="text-xs text-gray-400 mt-2">talentrank_top100.xlsx (~80 KB)</p>
          </div>
        </Card>
      </div>

      {/* Submission info */}
      <Card>
        <SectionLabel>Submission instructions</SectionLabel>
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">1</div>
            <div>
              <p className="font-medium text-gray-900">Download the file</p>
              <p className="text-sm text-gray-600 mt-0.5">Use either CSV or XLSX format. Both contain identical data.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">2</div>
            <div>
              <p className="font-medium text-gray-900">Validate locally (optional)</p>
              <p className="text-sm text-gray-600 mt-0.5">
                Run the official validator: <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">python validate_submission.py file.csv</code>
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">3</div>
            <div>
              <p className="font-medium text-gray-900">Upload to submission portal</p>
              <p className="text-sm text-gray-600 mt-0.5">Submit via the official submission website before the deadline.</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Requirements */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg space-y-2">
        <p className="font-semibold text-yellow-900 text-sm">Important requirements</p>
        <ul className="text-sm text-yellow-800 space-y-1 ml-4 list-disc">
          <li>Exactly 100 candidates in descending order of score</li>
          <li>Ranks must be sequential from 1 to 100</li>
          <li>All required fields must be populated</li>
          <li>Candidate IDs must match the format CAND_XXXXXXX</li>
          <li>File must be valid UTF-8 encoded</li>
        </ul>
      </div>
    </div>
  );
}
