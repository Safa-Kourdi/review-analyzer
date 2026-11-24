import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  direction: "rtl",
  palette: {
    primary: { main: "#1565C0" },
    success: { main: "#2E7D32" },
    error: { main: "#D32F2F" },
    warning: { main: "#ED6C02" },
    background: { default: "#F3F6FB", paper: "#FFFFFF" },
    text: { primary: "#14213D", secondary: "#5B6B84" },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: '"Cairo", "Segoe UI", Tahoma, sans-serif',
    button: { fontWeight: 700, textTransform: "none" },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: 12, padding: "10px 24px" } },
    },
  },
});

export default theme;
