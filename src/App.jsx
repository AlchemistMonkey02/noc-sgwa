import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import NOCLogin from './modules/noc/NOCLogin';
import NOCRegister from './modules/noc/NOCRegister';
import NOCDashboard from './modules/noc/NOCDashboard';
import NOCApplication from './modules/noc/NOCApplication';
import RigNOCApplication from './modules/noc/RigNOCApplication';
import RigOperationApplication from './modules/noc/RigOperationApplication';
import ApplicationStatusTracker from './modules/noc/ApplicationStatusTracker';
import ECCalculator from './modules/noc/ECCalculator';
import AbstractionChargesCalculator from './modules/noc/AbstractionChargesCalculator';
import WaterBudgetCalculator from './modules/noc/WaterBudgetCalculator';
import PenaltiesInfo from './modules/noc/PenaltiesInfo';
import DocumentRequirements from './modules/noc/DocumentRequirements';
import OfficerLogin from './modules/noc/officer/OfficerLogin';
import OfficerDashboard from './modules/noc/officer/OfficerDashboard';
import ApplicationReview from './modules/noc/officer/ApplicationReview';
import RegisteredAgenciesList from './modules/noc/RegisteredAgenciesList';
import RigRegistrationPermit from './modules/noc/RigRegistrationPermit';
import PermitRequests from './modules/noc/PermitRequests';
import RenewalTracking from './modules/noc/RenewalTracking';
import InstructionsGuidelines from './modules/noc/InstructionsGuidelines';
import LegalDisclaimer from './components/LegalDisclaimer';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Home Page with external login/register links */}
        <Route path="/" element={<Navigate to="/noc/login" replace />} />

        {/* NOC Portal Routes */}
        <Route path="/noc" element={<Navigate to="/noc/login" replace />} />
        <Route path="/noc/login" element={<NOCLogin />} />
        <Route path="/noc/register" element={<NOCRegister />} />
        <Route path="/noc/dashboard" element={<NOCDashboard />} />
        <Route path="/noc/application" element={<NOCApplication />} />
        <Route path="/noc/rig-application" element={<RigNOCApplication />} />
        <Route path="/noc/rig-operation" element={<RigOperationApplication />} />
        <Route path="/noc/track-status/:id" element={<ApplicationStatusTracker />} />
        <Route path="/noc/ec-calculator" element={<ECCalculator />} />
        <Route path="/noc/abstraction-charges" element={<AbstractionChargesCalculator />} />
        <Route path="/noc/water-budget-calculator" element={<WaterBudgetCalculator />} />
        <Route path="/noc/penalties" element={<PenaltiesInfo />} />
        <Route path="/noc/document-requirements" element={<DocumentRequirements />} />

        {/* Public Drilling Agencies Portal Routes */}
        <Route path="/agencies/list" element={<RegisteredAgenciesList />} />
        <Route path="/agencies/registration" element={<RigRegistrationPermit />} />
        <Route path="/agencies/permits" element={<PermitRequests />} />
        <Route path="/agencies/renewal" element={<RenewalTracking />} />
        <Route path="/agencies/guidelines" element={<InstructionsGuidelines />} />

        {/* Officer Portal Routes */}
        <Route path="/noc/officer/login" element={<OfficerLogin />} />
        <Route path="/noc/officer/dashboard" element={<OfficerDashboard />} />
        <Route path="/noc/officer/application/:id" element={<ApplicationReview />} />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <LegalDisclaimer />
    </Router>
  );
}

export default App;

