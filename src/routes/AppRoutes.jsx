import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/public/Home';
import BuyPage from '../pages/public/BuyPage';
import ContactUs from '../pages/public/ContactUs';
import WhyInvestPurandar from '../pages/public/WhyInvestPurandar';

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/buy-rent" element={<BuyPage />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/why-invest" element={<WhyInvestPurandar />} />
            {/* Profile routes handled separately */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
