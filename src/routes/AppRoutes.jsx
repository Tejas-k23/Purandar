import React from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Home from '../pages/public/Home';
import BuyPage from '../pages/public/BuyPage';
import RentPage from '../pages/public/RentPage';
import ContactUs from '../pages/public/ContactUs';
import PostProperty from '../pages/public/PostProperty';
import PostPropertyForm from '../pages/public/PostPropertyForm';
import AddProjectForm from '../pages/public/AddProjectForm';
import ProjectsPage from '../pages/public/ProjectsPage';
import ProjectDetails from '../pages/public/ProjectDetails';
import NewsInsights from '../pages/public/NewsInsights';
import NewsInsightDetail from '../pages/public/NewsInsightDetail';
import WhyInvestPurandar from '../pages/public/WhyInvestPurandar';
import PropertyDetails from '../pages/public/PropertyDetails';
import LocationListingsPage from '../pages/public/LocationListingsPage';
import PrivacyPolicy from '../pages/public/PrivacyPolicy';
import TermsConditions from '../pages/public/TermsConditions';
import ProfileLayout from '../pages/profile/ProfileLayout';
import MyProfile from '../pages/profile/MyProfile';
import SavedProperties from '../pages/profile/SavedProperties';
import MyProperties from '../pages/profile/MyProperties';
import Dashboard from '../pages/profile/Dashboard';
import MyEnquiries from '../pages/profile/MyEnquiries';
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import AdminLayout from '../layouts/AdminLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';
import PendingProperties from '../pages/admin/PendingProperties';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminProperties from '../pages/admin/AdminProperties';
import AdminProjects from '../pages/admin/AdminProjects';
import AdminBlogs from '../pages/admin/AdminBlogs';
import AdminBlogForm from '../pages/admin/AdminBlogForm';
import ScrollToTop from '../components/common/ScrollToTop';
import AdminEnquiries from '../pages/admin/AdminEnquiries';
import AdminLogin from '../pages/admin/AdminLogin';
import AdminFeedback from '../pages/admin/AdminFeedback';
import AdminNotifications from '../pages/admin/AdminNotifications';

export default function AppRoutes() {
  const location = useLocation();
  const backgroundLocation = location.state?.backgroundLocation;

  return (
    <>
      <ScrollToTop />
      <Routes location={backgroundLocation || location}>
        <Route path="/" element={<Home />} />
        <Route path="/buy" element={<BuyPage />} />
        <Route path="/rent" element={<RentPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<ProjectDetails />} />
        <Route path="/news-insights" element={<NewsInsights />} />
        <Route path="/news-insights/:slug" element={<NewsInsightDetail />} />
        <Route path="/property/:id" element={<PropertyDetails />} />
        <Route path="/property-in-:location" element={<LocationListingsPage mode="location" />} />
        <Route path="/property-near-:landmark" element={<LocationListingsPage mode="landmark" />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/why-invest" element={<WhyInvestPurandar />} />
        <Route path="/post-property" element={<PostProperty />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsConditions />} />
        {!backgroundLocation ? <Route path="/login" element={<Login />} /> : null}
        {!backgroundLocation ? <Route path="/signup" element={<Signup />} /> : null}
        <Route path="/tk23" element={<AdminLogin />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/post-property/form" element={<PostPropertyForm />} />
          <Route path="/post-project/form" element={<AddProjectForm />} />
          <Route path="/profile" element={<ProfileLayout />}>
            <Route index element={<MyProfile />} />
            <Route path="saved" element={<SavedProperties />} />
            <Route path="properties" element={<MyProperties />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="enquiries" element={<MyEnquiries />} />
          </Route>
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="enquiries" element={<AdminEnquiries />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="feedback" element={<AdminFeedback />} />
            <Route path="properties" element={<AdminProperties />} />
            <Route path="properties/form" element={<PostPropertyForm />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="projects/form" element={<AddProjectForm />} />
            <Route path="add-project" element={<AddProjectForm />} />
            <Route path="blogs" element={<AdminBlogs />} />
            <Route path="blogs/:id" element={<AdminBlogForm />} />
            <Route path="properties/pending" element={<PendingProperties />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {backgroundLocation ? (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      ) : null}
    </>
  );
}
