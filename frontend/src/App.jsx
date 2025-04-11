import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login/login";
import Register from "./pages/register/register";
import ProtectedRoute from "./pages/ProtectedRoute";
import DashboardCreated from "./pages/dasbhboard";
import DashboardNull from "./pages/dashboardnull";
import AcademicFB from "./pages/academicfb";
import Assets from "./pages/assets";
import CreateSurvey from "./pages/createsurvey";
import FeedbackForm from "./pages/Feedbackform";
import EditableTable from "./pages/producttemplate";

import SurveyQuestions from "./pages/surveyquestions";
import UserDetails from "./pages/user-details";
import User from "./pages/userdashboard";
import PageNotFound from "./pages/PageNotFound";
import { AuthProvider } from "./context/AuthContext";
import AssetsDict from "./pages/assets";
import MentorDashboard from "./pages/menteedashboard";
import AcademicFeedbackForm from "./pages/academicfb";
import Feedbackorm from "./pages/Feedbackform";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/surveyquestions/:title" element={<SurveyQuestions />} />
            <Route path="/dashboard" element={<DashboardCreated />} />
            <Route path="/dashboardnull" element={<DashboardNull />} />
           <Route path="/templates" element={<AssetsDict />} />
           <Route path="/producttemplate" element={<EditableTable />} />
           <Route path="/dashboardnull" element={<DashboardNull />} />
           <Route path="/academic-feedback" element={<AcademicFB />} />
           <Route path="/assets" element={<Assets />} />
           <Route path="/create-survey" element={<CreateSurvey />} />
           <Route path="/feedback-form" element={<FeedbackForm />} />
           <Route path="/menteedashboard" element={<MentorDashboard />} />
           
           {/* <Route path="/survey-questions" element={<SurveyQuestions />} /> */}
           <Route path="/user-details" element={<UserDetails />} />
           <Route path="/userdashboard" element={<User />} />
           <Route path="/academicfb" element={<AcademicFB />} />
           <Route path="/Feedbackform" element={<FeedbackForm />} />
          </Route>
          
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
  
}

export default App;