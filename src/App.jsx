import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import Jobs from "./pages/Jobs.jsx";
import NotFound from "./pages/NotFound.jsx";

// Every page sits inside Layout so the header and footer come along for free.
export default function App()
  {
    return (
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    );
  }
