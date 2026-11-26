import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import InsightsIcon from "@mui/icons-material/Insights";
import { NavLink } from "react-router-dom";

const LINKS = [
  { to: "/", label: "تحليل مراجعة" },
  { to: "/batch", label: "تحليل جماعي" },
  { to: "/dashboard", label: "لوحة المؤشرات" },
];

export default function TopBar() {
  return (
    <AppBar
      position="static"
      color="inherit"
      elevation={0}
      sx={{ borderBottom: 1, borderColor: "divider" }}
    >
      <Toolbar sx={{ px: { xs: 2, md: 5 }, gap: { xs: 2, md: 4 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <InsightsIcon color="primary" />
          <Typography
            variant="h6"
            fontWeight={800}
            noWrap
            sx={{ display: { xs: "none", sm: "block" } }}
          >
            محلّل المراجعات
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 0.5 }}>
          {LINKS.map((l) => (
            <Button
              key={l.to}
              component={NavLink}
              to={l.to}
              end
              color="inherit"
              sx={{
                "&.active": {
                  color: "primary.main",
                  bgcolor: "action.selected",
                },
              }}
            >
              {l.label}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
