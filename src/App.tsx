import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdminLayout } from "@/components/AdminLayout";
import Dashboard from "@/pages/Dashboard";
import NewsPage from "@/pages/NewsPage";
import FacultyPage from "@/pages/FacultyPage";
import EventsPage from "@/pages/EventsPage";
import SubmissionsPage from "@/pages/SubmissionsPage";
import ProgramsPage from "@/pages/ProgramsPage";
import CoursesPage from "@/pages/CoursesPage";
import NotificationsPage from "@/pages/NotificationsPage";
import GalleryPage from "@/pages/GalleryPage";
import FaqsPage from "@/pages/FaqsPage";
import QuickLinksPage from "@/pages/QuickLinksPage";
import ResearchPage from "@/pages/ResearchPage";
import AlumniPage from "@/pages/AlumniPage";
import SettingsPage from "@/pages/SettingsPage";
import ScholarshipsPage from "./pages/ScholarshipsPage";
import StudentStoriesPage from "@/pages/StudentStoriesPage";
import PlaceholderPage from "@/pages/PlaceholderPage";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/faculty" element={<FacultyPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/submissions" element={<SubmissionsPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/programs" element={<ProgramsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/faqs" element={<FaqsPage />} />
            <Route path="/quick-links" element={<QuickLinksPage />} />
            <Route path="/research" element={<ResearchPage />} />
            <Route path="/alumni" element={<AlumniPage />} />
            <Route path="/scholarships" element={<ScholarshipsPage />} />
            <Route path="/student-stories" element={<StudentStoriesPage />} />
            <Route path="/legal" element={<PlaceholderPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
