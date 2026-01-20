import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Public Module
import PublicLanding from './modules/public/PublicLanding';
import KnowYourEC from './modules/public/KnowYourEC';
import ApplicationStatus from './modules/public/ApplicationStatus';

// Public Service Info Pages
import GroundwaterServices from './modules/public/pages/GroundwaterServices';
import RigRegistrationInfo from './modules/public/pages/RigRegistrationInfo';
import VendorRegistrationInfo from './modules/public/pages/VendorRegistrationInfo';
import PublicGuidelines from './modules/public/pages/PublicGuidelines';

// Officer Module
import OfficerLogin from './modules/officer/OfficerLogin';
import ProtectedRoute from './modules/officer/shared/components/ProtectedRoute';

// DGO Module
import DGODashboard from './modules/officer/dgo/DGODashboard';
import DGOApplicationDetail from './modules/officer/dgo/DGOApplicationDetail';
import ApplicationViewer from './modules/officer/dgo/ApplicationViewer';
import ApplicationsList from './modules/officer/dgo/ApplicationsList';
import DGOInspectionList from './modules/officer/dgo/InspectionList';
import QueriesList from './modules/officer/dgo/QueriesList';
import OfficerReports from './modules/officer/dgo/OfficerReports';

import InspectionReport from './modules/officer/dgo/InspectionReport';

// SGWA Module
import SGWADashboard from './modules/officer/sgwa/SGWADashboard';
import SGWAApplicationsList from './modules/officer/sgwa/SGWAApplicationsList';
import SGWAApplicationViewer from './modules/officer/sgwa/SGWAApplicationViewer';
import SGWATechnicalReview from './modules/officer/sgwa/SGWATechnicalReview';

// Enforcement Module
import EnforcementDashboard from './modules/officer/enforcement/EnforcementDashboard';
import EnforcementApprovalQueue from './modules/officer/enforcement/EnforcementApprovalQueue';
import EnforcementApprovedList from './modules/officer/enforcement/EnforcementApprovedList';
import EnforcementRejectedList from './modules/officer/enforcement/EnforcementRejectedList';
import EnforcementCompliance from './modules/officer/enforcement/EnforcementCompliance';
import EnforcementApplicationViewer from './modules/officer/enforcement/EnforcementApplicationViewer';
import ApprovalForm from './modules/officer/enforcement/ApprovalForm';

// Inspection Module
import InspectionDashboard from './modules/officer/inspection/InspectionDashboard';
import InspectionList from './modules/officer/inspection/InspectionList';
import ConductInspection from './modules/officer/inspection/ConductInspection';
import InspectionHistory from './modules/officer/inspection/InspectionHistory';
import ViewInspectionReport from './modules/officer/inspection/ViewInspectionReport';

// Existing NOC Module imports
import NOCLogin from './modules/noc/NOCLogin';
import NOCRegister from './modules/noc/NOCRegister';
import CompanyProfile from './modules/noc/CompanyProfile';
import UserProfile from './modules/noc/UserProfile';
import NOCDashboard from './modules/noc/NOCDashboard';
import NOCApplication from './modules/noc/NOCApplication';
import EligibilityChecker from './modules/noc/EligibilityChecker';
import ApplicationSummary from './modules/noc/ApplicationSummary';
import NOCCertificatePage from './modules/noc/NOCCertificatePage';
import PaymentDetails from './modules/noc/PaymentDetails';
import ApplicationList from './modules/noc/ApplicationList';
import ApplicationStatusTracker from './modules/noc/ApplicationStatusTracker';
import ContactUpdate from './modules/noc/ContactUpdate';
import SelfCompliance from './modules/noc/SelfCompliance';
import AccountSettings from './modules/noc/AccountSettings';
import NOCQueries from './modules/noc/NOCQueries';
import EACDashboard from './modules/noc/EACDashboard';
import IssueReporting from './modules/noc/IssueReporting';
import ChargeRevision from './modules/noc/ChargeRevision';
import NOCReports from './modules/noc/NOCReports';
import NOCUtilities from './modules/noc/NOCUtilities';
import NOCHelp from './modules/noc/NOCHelp';

function App() {
  return (
    <Router>
      <Routes>
        {/* Root redirect to Public Landing Page */}
        <Route path="/" element={<PublicLanding />} />
        <Route path="/public/know-your-ec" element={<KnowYourEC />} />
        <Route path="/public/application-status" element={<ApplicationStatus />} />

        {/* New Service Info Routes */}
        <Route path="/public/services/noc" element={<GroundwaterServices />} />
        <Route path="/public/services/rig" element={<RigRegistrationInfo />} />
        <Route path="/public/services/vendor" element={<VendorRegistrationInfo />} />
        <Route path="/public/guidelines" element={<PublicGuidelines />} />

        {/* NOC Module Routes (Applicant Portal) */}
        <Route path="/noc" element={<Navigate to="/" replace />} />
        <Route path="/noc/login" element={<NOCLogin />} />
        <Route path="/noc/register" element={<NOCRegister />} />
        <Route path="/noc/dashboard" element={<NOCDashboard />} />
        <Route path="/noc/company-profile" element={<CompanyProfile />} />
        <Route path="/noc/user-profile" element={<UserProfile />} />
        <Route path="/noc/application" element={<NOCApplication />} />
        <Route path="/noc/application/summary" element={<ApplicationSummary />} />
        <Route path="/noc/certificate/:nocNumber" element={<NOCCertificatePage />} />
        <Route path="/noc/payment-details" element={<PaymentDetails />} />
        <Route path="/noc/track-status" element={<ApplicationList />} />
        <Route path="/noc/track-status/:id" element={<ApplicationStatusTracker />} />
        <Route path="/noc/update-contact" element={<ContactUpdate />} />
        <Route path="/noc/check-eligibility" element={<EligibilityChecker />} />
        <Route path="/noc/self-compliance" element={<SelfCompliance />} />

        {/* New Sidebar Screens */}
        <Route path="/noc/account-settings" element={<AccountSettings />} />
        <Route path="/noc/queries" element={<NOCQueries />} />
        <Route path="/noc/eac" element={<EACDashboard />} />
        <Route path="/noc/issue-reporting" element={<IssueReporting />} />
        <Route path="/noc/payment-details" element={<PaymentDetails />} /> {/* Existing but ensuring clarity */}
        <Route path="/noc/charge-revision" element={<ChargeRevision />} />
        <Route path="/noc/reports" element={<NOCReports />} />
        <Route path="/noc/utilities" element={<NOCUtilities />} />
        <Route path="/noc/help" element={<NOCHelp />} />

        {/* Officer Portal Routes */}
        <Route path="/officer" element={<Navigate to="/officer/login" replace />} />
        <Route path="/officer/login" element={<OfficerLogin />} />

        {/* DGO Routes - Protected */}
        <Route
          path="/officer/dgo/dashboard"
          element={
            <ProtectedRoute requiredRole="DGO">
              <DGODashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officer/dgo/applications"
          element={
            <ProtectedRoute requiredRole="DGO">
              <ApplicationsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officer/dgo/applications/:applicationId"
          element={
            <ProtectedRoute requiredRole="DGO">
              <ApplicationViewer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officer/dgo/applications/:applicationId/inspection-report"
          element={
            <ProtectedRoute requiredRole="DGO">
              <InspectionReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officer/dgo/inspections"
          element={
            <ProtectedRoute requiredRole="DGO">
              <DGOInspectionList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officer/dgo/queries"
          element={
            <ProtectedRoute requiredRole="DGO">
              <QueriesList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officer/dgo/reports"
          element={
            <ProtectedRoute requiredRole="DGO">
              <OfficerReports />
            </ProtectedRoute>
          }
        />

        {/* SGWA Routes - Protected */}
        <Route
          path="/officer/sgwa/dashboard"
          element={
            <ProtectedRoute requiredRole="SGWA">
              <SGWADashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officer/sgwa/applications"
          element={
            <ProtectedRoute requiredRole="SGWA">
              <SGWAApplicationsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officer/sgwa/applications/:applicationId"
          element={
            <ProtectedRoute requiredRole="SGWA">
              <SGWAApplicationViewer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/officer/sgwa/technical-review"
          element={
            <ProtectedRoute requiredRole="SGWA">
              <SGWATechnicalReview />
            </ProtectedRoute>
          }
        />

        {/* Enforcement Routes - Protected */}
        <Route
          path="/officer/enforcement/dashboard"
          element={
            <ProtectedRoute requiredRole="ENFORCEMENT">
              <EnforcementDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officer/enforcement/approval-queue"
          element={
            <ProtectedRoute requiredRole="ENFORCEMENT">
              <EnforcementApprovalQueue />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officer/enforcement/approved"
          element={
            <ProtectedRoute requiredRole="ENFORCEMENT">
              <EnforcementApprovedList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officer/enforcement/rejected"
          element={
            <ProtectedRoute requiredRole="ENFORCEMENT">
              <EnforcementRejectedList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officer/enforcement/compliance"
          element={
            <ProtectedRoute requiredRole="ENFORCEMENT">
              <EnforcementCompliance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officer/enforcement/applications/:applicationId"
          element={
            <ProtectedRoute requiredRole="ENFORCEMENT">
              <EnforcementApplicationViewer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officer/enforcement/applications/:id/approve"
          element={
            <ProtectedRoute requiredRole="ENFORCEMENT">
              <ApprovalForm />
            </ProtectedRoute>
          }
        />

        {/* Inspection Routes - Protected */}
        <Route
          path="/officer/inspection/dashboard"
          element={
            <ProtectedRoute requiredRole="INSPECTION">
              <InspectionDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officer/inspection/assignments"
          element={
            <ProtectedRoute requiredRole="INSPECTION">
              <InspectionList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officer/inspection/conduct/:inspectionId"
          element={
            <ProtectedRoute requiredRole="INSPECTION">
              <ConductInspection />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officer/inspection/history"
          element={
            <ProtectedRoute requiredRole="INSPECTION">
              <InspectionHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officer/inspection/report/:inspectionId"
          element={
            <ProtectedRoute requiredRole="INSPECTION">
              <ViewInspectionReport />
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router >
  );
}

export default App;
