import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { ApiProvider } from "./contexts/ApiProvider";
import { Layout } from "./components/Layout";
import { Toaster } from "./components/ui/toaster";
import DashboardPage from "./pages/DashboardPage";
import MessagesPage from "./pages/MessagesPage";

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <ApiProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/messages" element={<MessagesPage />} />
            </Routes>
          </Layout>
          <Toaster />
        </BrowserRouter>
      </ApiProvider>
    </ThemeProvider>
  );
}

export default App;
