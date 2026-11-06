import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import Jobs from "./pages/Jobs.jsx";
import JobHunter from "./pages/JobHunter.jsx";
import Login from "./pages/Login.jsx";
import NotFound from "./pages/NotFound.jsx";

// Every page sits inside Layout so the header and footer come along for free. Login stands on its own, no sidebar.
export default function App()
  {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/job-hunter" element={<JobHunter />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    );
  }
