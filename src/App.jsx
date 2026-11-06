import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import SignedIn from "./components/auth/SignedIn.jsx";
import Home from "./pages/Home.jsx";
import Jobs from "./pages/Jobs.jsx";
import JobHunter from "./pages/JobHunter.jsx";
import Login from "./pages/Login.jsx";
import NotFound from "./pages/NotFound.jsx";

// Every page sits inside Layout so the header and footer come along for free, and behind SignedIn so only a signed-in
// person gets in. Login and sign-up stand on their own, no sidebar, and share one page.
export default function App()
  {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Login signUp />} />
        <Route element={<SignedIn />}>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/job-hunter" element={<JobHunter />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
    );
  }
