import { BrowserRouter, Routes, Route, } from "react-router-dom";
import "./App.css";

import Index from "./pages/Index.jsx";
import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login.jsx";
import ProtectedRoute, { FallbackRedirect } from "./components/ProtectedRoute.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import DashboardHome from "./pages/DashboardHome.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Profile from "./pages/Profile.jsx";
import CreateWorkspace from "./pages/workspace.jsx";
import MyWorkspace from "./pages/MyWorkspace.jsx";
import Members from "./pages/Members.jsx";
import AcceptInvitation from "./pages/AcceptInvitation";
import Activity from "./pages/Activity.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login/>}/>
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Dashboard */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
          <Route index element={<DashboardHome />} />
          {/* Note: Removed duplicate 'index' route pointing to Profile to prevent React Router conflicts */}
          <Route path="profile" element={<Profile />} />
          <Route path="workspace" element={<MyWorkspace />} />
          <Route path="members" element={<Members/>} />
          <Route path="activity" element={<Activity/>} />
          <Route path="create-workspace" element={<CreateWorkspace />}/>
          
          {/* 2. Catch invalid nested URLs inside the Dashboard layout (e.g., /dashboard/ets) */}
          <Route path="*" element={<FallbackRedirect />} />
        </Route>
        
        <Route path="/accept-invitation" element={<AcceptInvitation />} /> 
        <Route path="/accept-invitation/accept" element={<AcceptInvitation />}/> 

        {/* 3. Catch all other global invalid URLs (e.g., /efrg) */}
        <Route path="*" element={<FallbackRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;




// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import "./App.css";

// import Index from "./pages/Index.jsx";
// import Signup from "./pages/Signup.jsx";
// import Login from "./pages/Login.jsx";
// import  ProtectedRoute  from "./components/ProtectedRoute.jsx"
// import Dashboard from "./pages/Dashboard.jsx";
// import DashboardHome from "./pages/DashboardHome.jsx";
//  import VerifyEmail from "./pages/VerifyEmail.jsx";
//  import ResetPassword from "./pages/ResetPassword.jsx";
// import Profile from "./pages/Profile.jsx";
// import CreateWorkspace from "./pages/workspace.jsx";
// import MyWorkspace from "./pages/MyWorkspace.jsx";
// import Members from "./pages/Members.jsx";
// import AcceptInvitation from "./pages/AcceptInvitation";
// import Activity from "./pages/Activity.jsx";
// import ForgotPassword from "./pages/ForgotPassword.jsx";

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Index />} />
//         <Route path="/signup" element={<Signup />} />
//         <Route path="/login" element={<Login/>}/>
//         <Route path="/forgot-password" element={<ForgotPassword />} />
//          <Route path="/verify-email" element={<VerifyEmail />} />
//          <Route path="/reset-password" element={<ResetPassword />} />
//         {/* Dashboard */}
//         <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
//           <Route index element={<DashboardHome />} />
//           <Route index element={<Profile />} />

//           <Route path="profile" element={<Profile />} />

//           <Route path="workspace" element={<MyWorkspace />} />


//            <Route path="members" element={<Members/>} />

//           <Route path="activity" element={<Activity/>} />

//           <Route path="create-workspace" element={<CreateWorkspace />}/>
//         </Route>
//          <Route
//   path="/accept-invitation"
//   element={<AcceptInvitation />}
// /> 
//          <Route path="/accept-invitation/accept" element={<AcceptInvitation />}/> 
//          {/* <Route path="/profile" element={<Profile/>}/>
//          <Route path="/create-workspace" element={<CreateWorkspace/>}/>
//          <Route path="/my-workspace" element={<MyWorkspace/>}/> */}
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;