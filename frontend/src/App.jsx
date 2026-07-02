import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Rankings from "./pages/Rankings";
import CandidateDetail from "./pages/CandidateDetail";
import Pipeline from "./pages/Pipeline";
import BehavioralAnalysis from "./pages/BehavioralAnalysis";
import FraudDetection from "./pages/FraudDetection";
import Explainability from "./pages/Explainability";
import ViewJD from "./pages/ViewJD";
import UploadJD from "./pages/UploadJD";
import Export from "./pages/Export";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/"                   element={<Dashboard />} />
        <Route path="/ranking"            element={<Rankings />} />
        <Route path="/candidate/:id"      element={<CandidateDetail />} />
        <Route path="/pipeline"           element={<Pipeline />} />
        <Route path="/behavioral"         element={<BehavioralAnalysis />} />
        <Route path="/fraud-detection"    element={<FraudDetection />} />
        <Route path="/explainability"     element={<Explainability />} />
        <Route path="/view-jd"            element={<ViewJD />} />
        <Route path="/upload"             element={<UploadJD />} />
        <Route path="/export"             element={<Export />} />
      </Routes>
    </Layout>
  );
}
