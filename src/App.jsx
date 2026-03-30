import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import AppRoutes from './routes/AppRoutes';
import './App.css';

function App() {
    return (
        <BrowserRouter>
            <div className="app-container">
                <div className="main-wrapper">
                    <Navbar />
                    <div className="main-content">
                        <AppRoutes />
                    </div>
                </div>
            </div>
        </BrowserRouter>
    );
}

export default App;
