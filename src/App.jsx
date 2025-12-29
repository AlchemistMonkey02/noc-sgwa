import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NOCLogin from './modules/noc/NOCLogin';
import NOCRegister from './modules/noc/NOCRegister';
import NOCDashboard from './modules/noc/NOCDashboard';
import NOCApplication from './modules/noc/NOCApplication';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root to NOC login */}
        <Route path="/" element={<Navigate to="/noc/login" replace />} />

        {/* NOC Portal Routes */}
        <Route path="/noc" element={<Navigate to="/noc/login" replace />} />
        <Route path="/noc/login" element={<NOCLogin />} />
        <Route path="/noc/register" element={<NOCRegister />} />
        <Route path="/noc/dashboard" element={<NOCDashboard />} />
        <Route path="/noc/application" element={<NOCApplication />} />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/noc/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

