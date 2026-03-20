import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import AppRoutes from './routes/AppRoutes';

function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen w-full flex flex-col items-center bg-gray-200 p-2 sm:p-4">
                <div className="w-full h-[calc(100vh-2rem)] max-w-[1600px] bg-background rounded-3xl overflow-hidden flex flex-col shadow-lg border border-white/50">
                    <Navbar />
                    <AppRoutes />
                </div>
            </div>
        </BrowserRouter>
    );
}

export default App;
