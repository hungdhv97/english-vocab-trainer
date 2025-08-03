import { ThemeProvider } from "@/components/theme-provider"
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Words from "@/pages/Words";
import TodayReview from "@/pages/TodayReview";
import History from "@/pages/History";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/words" element={<Words />} />
          <Route path="/today-review" element={<TodayReview />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App