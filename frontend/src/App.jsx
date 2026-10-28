import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import Dashboard from "./pages/dashboard/Dashboard";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Spaces from "./pages/spaces/Spaces";
import SpaceDetails from "./pages/spaces/SpaceDetails";
import Projects from "./pages/projects/Projects";
import ProjectDetails from "./pages/projects/ProjectDetails";
import ProjectOverview from "./pages/projects/ProjectOverview";
import Materials from "./pages/projects/Materials";
import Tutor from "./pages/projects/Tutor";
import Quiz from "./pages/projects/Quiz";
import Mastery from "./pages/projects/Mastery";
import Growth from "./pages/projects/Growth";
import Activity from "./pages/projects/Activity";
import ProjectAnalytics from "./pages/projects/ProjectAnalytics";
import Analytics from "./pages/analytics/Analytics";
import Recommendations from "./pages/recommendations/Recommendations";
import Admin from "./pages/admin/Admin";
import Home from "./pages/Home";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/spaces" element={<Spaces />} />
        <Route path="/spaces/:spaceId" element={<SpaceDetails />} />

        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:projectId" element={<ProjectDetails />}>
          <Route index element={<ProjectOverview />} />
          <Route path="materials" element={<Materials />} />
          <Route path="tutor" element={<Tutor />} />
          <Route path="quiz" element={<Quiz />} />
          <Route path="mastery" element={<Mastery />} />
          <Route path="growth" element={<Growth />} />
          <Route path="activity" element={<Activity />} />
          <Route path="analytics" element={<ProjectAnalytics />} />
        </Route>

        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <Admin />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
