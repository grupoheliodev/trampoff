import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Páginas Principais
import Index from './pages/Index.jsx';

// Páginas Freelancer
import FreelancerLogin from './pages/freelancer/freelancer_login.jsx';
import FreelancerRegistration from './pages/freelancer/freelancer_registration.jsx';
import FreelancerHome from './pages/freelancer/freelancer_home.jsx';
import FreelancerProjects from './pages/freelancer/freelancer_projects.jsx';
import FreelancerJobs from './pages/freelancer/freelancer_jobs.jsx';
import FreelancerMessages from './pages/freelancer/freelancer_messages.jsx';
import FreelancerProfile from './pages/freelancer/freelancer_profile.jsx';
import FreelancerSettings from './pages/freelancer/freelancer_settings.jsx';
import FreelancerContracts from './pages/freelancer/freelancer_contracts.jsx';

// Páginas Employer
import EmployerLogin from './pages/employer/employer_login.jsx';
import EmployerRegistration from './pages/employer/employer_registration.jsx';
import EmployerHome from './pages/employer/employer_home.jsx';
import EmployerWorkers from './pages/employer/employer_workers.jsx';
import EmployerContracts from './pages/employer/employer_contracts.jsx';
import EmployerMessages from './pages/employer/employer_messages.jsx';
import EmployerProfile from './pages/employer/employer_profile.jsx';
import EmployerSettings from './pages/employer/employer_settings.jsx';
import PremiumPage from './pages/premium.jsx';
import ProjectPage from './pages/projects/ProjectPage.jsx';
import ProfileSetup from './pages/ProfileSetup.jsx';
import SearchResults from './pages/SearchResults.jsx';
import JobDetail from './pages/JobDetail.jsx';
import ProjectDetail from './pages/ProjectDetail.jsx';
import SchoolEvents from './pages/SchoolEvents.jsx';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />

      {/* Rotas Freelancer */}
      <Route path="/freelancer/login" element={<FreelancerLogin />} />
      <Route path="/freelancer/registration" element={<FreelancerRegistration />} />
      <Route path="/freelancer/home" element={<FreelancerHome />} />
      <Route path="/freelancer/projects" element={<FreelancerProjects />} />
      <Route path="/freelancer/jobs" element={<FreelancerJobs />} />
      <Route path="/freelancer/messages" element={<FreelancerMessages />} />
      <Route path="/freelancer/profile" element={<FreelancerProfile />} />
  <Route path="/freelancer/settings" element={<FreelancerSettings />} />
  <Route path="/freelancer/contracts" element={<FreelancerContracts />} />

      {/* Rotas Employer */}
  <Route path="/premium" element={<PremiumPage />} />
      <Route path="/employer/login" element={<EmployerLogin />} />
      <Route path="/employer/registration" element={<EmployerRegistration />} />
      <Route path="/employer/home" element={<EmployerHome />} />
      <Route path="/employer/workers" element={<EmployerWorkers />} />
      <Route path="/employer/contracts" element={<EmployerContracts />} />
      <Route path="/employer/messages" element={<EmployerMessages />} />
      <Route path="/employer/profile" element={<EmployerProfile />} />
      <Route path="/employer/settings" element={<EmployerSettings />} />
      <Route path="/projects/:id" element={<ProjectPage />} />
      <Route path="/school-events" element={<SchoolEvents />} />
      <Route path="/profile/setup" element={<ProfileSetup />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="/jobs/:id" element={<JobDetail />} />
      <Route path="/projects/:id" element={<ProjectDetail />} />
    </Routes>
  );
};

export default AppRoutes;