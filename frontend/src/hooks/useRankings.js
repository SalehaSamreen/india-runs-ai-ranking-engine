import { useState, useEffect } from "react";
import {
  getTop100, getDashboardMetrics, getJDProfile, getPipelineMetrics,
  getBehavioralAnalysis, getFraudDetection, getExplainability,
  getCandidateBehavioral, getCandidateFraudAnalysis, getCandidateExplainability,
} from "../services/api";

export function useRankings() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getTop100()
      .then(setCandidates)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { candidates, loading, error };
}

export function useMetrics() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardMetrics()
      .then(setMetrics)
      .finally(() => setLoading(false));
  }, []);

  return { metrics, loading };
}

export function useJDProfile() {
  const [jd, setJD] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getJDProfile()
      .then(setJD)
      .finally(() => setLoading(false));
  }, []);

  return { jd, loading };
}

export function usePipelineMetrics() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPipelineMetrics()
      .then(setMetrics)
      .finally(() => setLoading(false));
  }, []);

  return { metrics, loading };
}

export function useBehavioralAnalysis() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBehavioralAnalysis()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

export function useFraudDetection() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFraudDetection()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

export function useExplainability() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getExplainability()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

// Single candidate details
export function useCandidateBehavioral(candidateId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (candidateId) {
      getCandidateBehavioral(candidateId)
        .then(setData)
        .finally(() => setLoading(false));
    }
  }, [candidateId]);

  return { data, loading };
}

export function useCandidateFraud(candidateId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (candidateId) {
      getCandidateFraudAnalysis(candidateId)
        .then(setData)
        .finally(() => setLoading(false));
    }
  }, [candidateId]);

  return { data, loading };
}

export function useCandidateExplainability(candidateId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (candidateId) {
      getCandidateExplainability(candidateId)
        .then(setData)
        .finally(() => setLoading(false));
    }
  }, [candidateId]);

  return { data, loading };
}
