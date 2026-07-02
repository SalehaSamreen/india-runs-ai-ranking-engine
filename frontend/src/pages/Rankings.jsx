import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Eye,
  ChevronUp,
  ChevronDown,
  Download as DownloadIcon,
} from "lucide-react";

import {
  RankBadge,
  ScoreBar,
  Badge,
  Card,
  Spinner,
  EmptyState,
} from "../components/ui";

import { useRankings } from "../hooks/useRankings";
import { downloadCSV, downloadXLSX } from "../services/api";

const PAGE_SIZE = 20;

export default function Rankings() {
  const { candidates, loading } = useRankings();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [minScore, setMinScore] = useState("");
  const [sortKey, setSortKey] = useState("rank");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    const threshold = parseFloat(minScore) || 0;

    let result = candidates.filter((c) => {
      return (
        (c.candidate_id?.toLowerCase().includes(q) ||
          c.profile?.anonymized_name?.toLowerCase().includes(q) ||
          c.profile?.current_title?.toLowerCase().includes(q) ||
          c.profile?.current_company?.toLowerCase().includes(q) ||
          c.profile?.location?.toLowerCase().includes(q)) &&
        c.score >= threshold
      );
    });

    result.sort((a, b) => {
      let av = 0;
      let bv = 0;

      switch (sortKey) {
        case "rank":
          av = a.rank;
          bv = b.rank;
          break;

        case "score":
          av = a.score;
          bv = b.score;
          break;

        case "yoe":
          av = a.profile?.years_of_experience || 0;
          bv = b.profile?.years_of_experience || 0;
          break;

        default:
          break;
      }

      return sortDir === "asc" ? av - bv : bv - av;
    });

    return result;
  }, [candidates, query, minScore, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const paged = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  function SortIcon({ col }) {
    if (sortKey !== col)
      return <ChevronUp size={12} className="text-gray-300" />;

    return sortDir === "asc" ? (
      <ChevronUp size={12} className="text-blue-500" />
    ) : (
      <ChevronDown size={12} className="text-blue-500" />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          Top 100 Ranked Candidates
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          {filtered.length} candidates
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center">

        <div className="relative flex-1 min-w-56">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            className="w-full pl-8 pr-3 py-2 border rounded-lg"
            placeholder="Search candidates..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} />

          <select
            value={minScore}
            onChange={(e) => {
              setMinScore(e.target.value);
              setPage(1);
            }}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">All scores</option>
            <option value="0.95">≥ 0.95</option>
            <option value="0.90">≥ 0.90</option>
            <option value="0.85">≥ 0.85</option>
            <option value="0.80">≥ 0.80</option>
          </select>
        </div>

        <button
          onClick={() => downloadCSV(filtered)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <DownloadIcon size={14} />
          CSV
        </button>

        <button
          onClick={() => downloadXLSX(filtered)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <DownloadIcon size={14} />
          XLSX
        </button>
      </div>

      {/* Table */}
      <Card padding={false}>
        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead>
              <tr className="bg-gray-50 border-b">

                <th
                  onClick={() => toggleSort("rank")}
                  className="px-4 py-3 cursor-pointer"
                >
                  <span className="flex items-center gap-1">
                    Rank
                    <SortIcon col="rank" />
                  </span>
                </th>

                <th className="px-4 py-3">Candidate</th>
                <th className="px-4 py-3">Company</th>

                <th
                  onClick={() => toggleSort("yoe")}
                  className="px-4 py-3 cursor-pointer"
                >
                  <span className="flex items-center gap-1">
                    Experience
                    <SortIcon col="yoe" />
                  </span>
                </th>

                <th className="px-4 py-3">Location</th>

                <th
                  onClick={() => toggleSort("score")}
                  className="px-4 py-3 cursor-pointer"
                >
                  <span className="flex items-center gap-1">
                    Score
                    <SortIcon col="score" />
                  </span>
                </th>

                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>

            <tbody>
              {paged.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <EmptyState
                      title="No candidates found"
                    />
                  </td>
                </tr>
              )}

              {paged.map((c) => (
                <tr
                  key={c.candidate_id}
                  className="border-b hover:bg-blue-50 cursor-pointer"
                  onClick={() =>
                    navigate(`/candidate/${c.candidate_id}`)
                  }
                >
                  <td className="px-4 py-3">
                    <RankBadge rank={c.rank} />
                  </td>

                  <td className="px-4 py-3">
                    <div className="font-medium">
                      {c.profile?.anonymized_name}
                    </div>

                    <div className="text-xs text-gray-500">
                      {c.profile?.current_title}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    {c.profile?.current_company}
                  </td>

                  <td className="px-4 py-3">
                    {c.profile?.years_of_experience} yrs
                  </td>

                  <td className="px-4 py-3">
                    {c.profile?.location}
                  </td>

                  <td className="px-4 py-3">
                    <ScoreBar score={c.score} />
                  </td>

                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        c.redrob_signals?.open_to_work_flag
                          ? "green"
                          : "yellow"
                      }
                    >
                      {c.redrob_signals?.open_to_work_flag
                        ? "Open"
                        : "Passive"}
                    </Badge>
                  </td>

                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/candidate/${c.candidate_id}`);
                      }}
                      className="text-blue-600"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">

          <span className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>

          <div className="flex gap-2">

            <button
              disabled={page === 1}
              onClick={() =>
                setPage((p) => Math.max(1, p - 1))
              }
              className="border px-3 py-1 rounded"
            >
              Previous
            </button>

            <button
              disabled={page === totalPages}
              onClick={() =>
                setPage((p) => Math.min(totalPages, p + 1))
              }
              className="border px-3 py-1 rounded"
            >
              Next
            </button>

          </div>
        </div>
      )}
    </div>
  );
}