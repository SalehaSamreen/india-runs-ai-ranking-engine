import { useState, useRef } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, Play, X } from "lucide-react";
import { Card, Badge, SkillTag, Spinner, SectionLabel } from "../components/ui";
import { uploadJD, startRanking } from "../services/api";
import { JD_PROFILE } from "../data/mockData";

export default function UploadJD() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [ranking, setRanking] = useState(false);
  const [uploadResult, setUploadResult] = useState(null); // {ok, message}
  const [rankResult, setRankResult] = useState(null);
  const inputRef = useRef();

  function onFileChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const valid = [".txt", ".md", ".docx"].some(ext => f.name.endsWith(ext));
    if (!valid) { alert("Please upload a .txt, .md, or .docx file"); return; }
    setFile(f);
    setUploadResult(null);
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadJD(file);
      setUploadResult({ ok: true, message: res.message });
    } catch (e) {
      setUploadResult({ ok: false, message: e.message });
    } finally {
      setUploading(false);
    }
  }

  async function handleRank() {
    setRanking(true);
    try {
      const res = await startRanking();
      setRankResult(res);
    } catch (e) {
      setRankResult({ status: "error", message: e.message });
    } finally {
      setRanking(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-5">

      {/* Drop zone */}
      <Card>
        <SectionLabel>Upload job description</SectionLabel>
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) { inputRef.current.files = e.dataTransfer.files; onFileChange({ target: { files: [f] } }); } }}
          className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-colors"
        >
          <Upload size={36} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm font-medium text-gray-700">Drag & drop your JD here, or click to browse</p>
          <p className="text-xs text-gray-400 mt-1">Accepts .txt · .md · .docx</p>
          <input ref={inputRef} type="file" accept=".txt,.md,.docx" onChange={onFileChange} className="hidden" />
        </div>

        {file && (
          <div className="mt-4 flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <FileText size={18} className="text-blue-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
              <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button onClick={() => { setFile(null); setUploadResult(null); }}>
              <X size={14} className="text-gray-400 hover:text-gray-600" />
            </button>
          </div>
        )}

        {uploadResult && (
          <div className={`mt-3 flex items-center gap-2 p-3 rounded-lg text-sm ${uploadResult.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
            {uploadResult.ok ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
            {uploadResult.message}
          </div>
        )}

        <div className="flex gap-3 mt-4">
          <button onClick={handleUpload} disabled={!file || uploading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {uploading ? <Spinner size={14} /> : <Upload size={14} />}
            {uploading ? "Parsing JD…" : "Parse JD"}
          </button>
          <button onClick={handleRank} disabled={!uploadResult?.ok || ranking}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {ranking ? <Spinner size={14} /> : <Play size={14} />}
            {ranking ? "Processing rankings…" : "Start Ranking"}
          </button>
        </div>

        {rankResult && rankResult.status === "ok" && (
          <div className="mt-3 p-3 bg-green-50 rounded-lg text-sm text-green-800 flex items-center gap-2">
            <CheckCircle2 size={15} />
            Ranking complete in {rankResult.runtime_seconds}s — check the Rankings page!
          </div>
        )}
      </Card>

      {/* Currently loaded JD */}
      <Card>
        <SectionLabel>Currently loaded job description</SectionLabel>
        <div className="mb-4">
          <h3 className="text-base font-semibold text-gray-900">{JD_PROFILE.title}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{JD_PROFILE.company} · {JD_PROFILE.location} · {JD_PROFILE.experience} · {JD_PROFILE.type}</p>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">Required skills extracted</p>
            <div className="flex flex-wrap gap-2">
              {JD_PROFILE.required_skills.map(s => <SkillTag key={s} matched={true}>{s}</SkillTag>)}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">Preferred skills</p>
            <div className="flex flex-wrap gap-2">
              {JD_PROFILE.preferred_skills.map(s => <SkillTag key={s}>{s}</SkillTag>)}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2">Rejection signals</p>
            <div className="flex flex-wrap gap-2">
              {JD_PROFILE.rejection_signals.map(s => <SkillTag key={s} matched={false}>{s}</SkillTag>)}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
