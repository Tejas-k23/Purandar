import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/public/Home';
import BuyPage from '../pages/public/BuyPage';
import RentPage from '../pages/public/RentPage';
import ContactUs from '../pages/public/ContactUs';
import PostProperty from '../pages/public/PostProperty';
import PostPropertyForm from '../pages/public/PostPropertyForm';
import WhyInvestPurandar from '../pages/public/WhyInvestPurandar';
import PropertyDetails from '../pages/public/PropertyDetails';
import ProfileLayout from '../pages/profile/ProfileLayout';
import MyProfile from '../pages/profile/MyProfile';
import SavedProperties from '../pages/profile/SavedProperties';
import MyProperties from '../pages/profile/MyProperties';

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/buy" element={<BuyPage />} />
            <Route path="/rent" element={<RentPage />} />
            <Route path="/property/:id" element={<PropertyDetails />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/why-invest" element={<WhyInvestPurandar />} />
            <Route path="/post-property" element={<PostProperty />} />
            <Route path="/post-property/form" element={<PostPropertyForm />} />
            
            {/* Profile Routes */}
            <Route path="/profile" element={<ProfileLayout />}>
                <Route index element={<MyProfile />} />
                <Route path="saved" element={<SavedProperties />} />
                <Route path="properties" element={<MyProperties />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
