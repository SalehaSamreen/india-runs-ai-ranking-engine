import { useJDProfile } from "../hooks/useRankings";
import { Spinner, Card, SectionLabel, SkillTag } from "../components/ui";
import { MapPin, Briefcase, Clock, Code, Eye } from "lucide-react";

export default function ViewJD() {
  const { jd, loading } = useJDProfile();

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Spinner size={32} /></div>;
  }

  if (!jd) return <div className="p-6 text-gray-500">Job description not available</div>;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{jd.title}</h1>
        <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
          <span className="flex items-center gap-1.5">
            <Briefcase size={16} /> {jd.company}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin size={16} /> {jd.location}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={16} /> {jd.type}
          </span>
        </div>
      </div>

      {/* Main info */}
      <Card>
        <SectionLabel>Position Details</SectionLabel>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Experience Required</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">{jd.experience}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Job Type</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">{jd.type}</p>
          </div>
        </div>
      </Card>

      {/* Required Skills */}
      <Card>
        <SectionLabel>Required Skills</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {jd.required_skills.map((skill, idx) => (
            <SkillTag key={idx} matched={true}>
              {skill}
            </SkillTag>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Candidates must demonstrate proficiency in all required skills.
        </p>
      </Card>

      {/* Preferred Skills */}
      <Card>
        <SectionLabel>Preferred Skills</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {jd.preferred_skills.map((skill, idx) => (
            <span
              key={idx}
              className="px-2.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800 border border-blue-200"
            >
              {skill}
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Bonus points for candidates with preferred skills or equivalent experience.
        </p>
      </Card>

      {/* Hidden Signals */}
      <Card>
        <SectionLabel>Hidden Signals (Explainability Context)</SectionLabel>
        <div className="space-y-3">
          {jd.hidden_signals.map((signal, idx) => (
            <div key={idx} className="flex gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <Eye size={16} className="text-purple-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-purple-900">{signal}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          These signals are derived from the JD but not explicitly mentioned. The ranking algorithm learns to detect candidates matching these patterns.
        </p>
      </Card>

      {/* Rejection Signals */}
      <Card>
        <SectionLabel>Rejection Signals</SectionLabel>
        <div className="space-y-2">
          {jd.rejection_signals.map((signal, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <span className="text-red-600 text-lg">✗</span>
              <p className="text-sm text-red-900">{signal}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Candidates showing these patterns are penalized or excluded from consideration.
        </p>
      </Card>

      {/* Scoring Context */}
      <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Code size={18} className="text-blue-600" />
          Scoring Methodology
        </h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            <span className="font-semibold">Semantic Matching:</span> Candidate profiles are embedded and compared against the JD description using cosine similarity.
          </p>
          <p>
            <span className="font-semibold">Skill Matching:</span> Required and preferred skills are matched using NLP with fuzzy matching for variants.
          </p>
          <p>
            <span className="font-semibold">Career Trajectory:</span> Years of experience, company tiers, and role progression are analyzed for domain fit.
          </p>
          <p>
            <span className="font-semibold">Behavioral Analysis:</span> Response rates, engagement, and availability signals boost scores for responsive candidates.
          </p>
          <p>
            <span className="font-semibold">Fraud Detection:</span> Keyword stuffing and inconsistencies are detected and penalized.
          </p>
        </div>
      </div>

      {/* Interpretation */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="font-semibold text-green-900 text-sm">How to Use This Information</p>
        <p className="text-sm text-green-800 mt-2">
          Use this JD profile when reviewing candidate details to understand how each candidate aligns with the position requirements. The ranking algorithm uses these skills and signals to compute final scores presented in the Rankings page.
        </p>
      </div>
    </div>
  );
}
