import { Route, Routes } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import useModel from "./lib/useModel";
import TopBar from "./components/TopBar";
import AnalyzePage from "./pages/AnalyzePage";
import BatchPage from "./pages/BatchPage";

export default function App() {
  const { model, error } = useModel();

  if (!model && !error) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <TopBar />
      <Routes>
        <Route path="/" element={<AnalyzePage model={model} error={error} />} />
        <Route path="/batch" element={<BatchPage model={model} />} />
      </Routes>
    </Box>
  );
}