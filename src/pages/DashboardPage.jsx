import { useMemo } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import RateReviewIcon from "@mui/icons-material/RateReview";
import ThumbsUpDownIcon from "@mui/icons-material/ThumbsUpDown";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import SentimentNeutralIcon from "@mui/icons-material/SentimentNeutral";
import usePersistentState from "../lib/usePersistentState";
import { analyze } from "../lib/sentiment";

const VERDICTS = {
  positive: {
    label: "إيجابي",
    color: "success",
    Icon: SentimentSatisfiedAltIcon,
  },
  negative: {
    label: "سلبي",
    color: "error",
    Icon: SentimentVeryDissatisfiedIcon,
  },
  neutral: { label: "محايد", color: "warning", Icon: SentimentNeutralIcon },
};

const TOOLTIP_STYLE = {
  direction: "rtl",
  fontFamily: "inherit",
  borderRadius: 8,
};

function KpiCard({ label, value, hint, color, Icon }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        display: "flex",
        alignItems: "center",
        gap: 2,
        borderColor: "divider",
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          bgcolor: (t) => alpha(t.palette[color].main, 0.12),
          color: `${color}.main`,
        }}
      >
        <Icon sx={{ fontSize: 32 }} />
      </Box>
      <Box>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography sx={{ fontSize: 28, fontWeight: 800, lineHeight: 1.3 }}>
          {value}
        </Typography>
        {hint && (
          <Typography variant="caption" color="text.secondary">
            {hint}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

function ChartCard({ title, children }) {
  return (
    <Paper
      variant="outlined"
      sx={{ p: { xs: 2, md: 3 }, borderColor: "divider" }}
    >
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        {title}
      </Typography>
      {children}
    </Paper>
  );
}

function WordsBars({ data, color }) {
  if (data.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ py: 8, textAlign: "center" }}>
        لا توجد كلمات كافية للعرض.
      </Typography>
    );
  }

  const max = Math.max(...data.map((d) => d.count));

  return (
    <Box
      sx={{
        minHeight: 320,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 2,
      }}
    >
      {data.map((d) => (
        <Box
          key={d.word}
          sx={{ display: "flex", alignItems: "center", gap: 2 }}
        >
          <Typography
            noWrap
            title={d.word}
            sx={{ width: 100, flexShrink: 0, fontSize: 16, fontWeight: 600 }}
          >
            {d.word}
          </Typography>
          <Box
            sx={{
              flex: 1,
              height: 12,
              borderRadius: 6,
              overflow: "hidden",
              bgcolor: (t) => alpha(t.palette[color].main, 0.12),
            }}
          >
            <Box
              sx={{
                width: `${(d.count / max) * 100}%`,
                height: "100%",
                borderRadius: 6,
                bgcolor: `${color}.main`,
              }}
            />
          </Box>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ width: 32, textAlign: "end" }}
          >
            {d.count}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
export default function DashboardPage({ model }) {
  const theme = useTheme();
  const [rows] = usePersistentState("batch-rows", null);

  const stats = useMemo(() => {
    if (!rows || rows.length === 0 || !model) return null;

    const counts = { positive: 0, negative: 0, neutral: 0 };
    let sumP = 0;
    const pos = {};
    const neg = {};

    rows.forEach((row) => {
      counts[row.verdict] += 1;
      sumP += row.p;

      analyze(model, row.text).all.forEach(({ word }) => {
        if (word.includes(" ")) return;
        const weight = model.vocab[word][1];
        if (weight > 0.5) pos[word] = (pos[word] || 0) + 1;
        else if (weight < -0.5) neg[word] = (neg[word] || 0) + 1;
      });
    });

    const top = (obj) =>
      Object.entries(obj)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([word, count]) => ({ word, count }));

    const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];

    return {
      total: rows.length,
      counts,
      avg: Math.round((sumP / rows.length) * 100),
      pos: top(pos),
      neg: top(neg),
      dominant,
    };
  }, [rows, model]);

  const pieData = stats
    ? [
        {
          name: "إيجابية",
          value: stats.counts.positive,
          color: theme.palette.success.main,
        },
        {
          name: "سلبية",
          value: stats.counts.negative,
          color: theme.palette.error.main,
        },
        {
          name: "محايدة",
          value: stats.counts.neutral,
          color: theme.palette.warning.main,
        },
      ].filter((d) => d.value > 0)
    : [];

  const dominant = stats ? VERDICTS[stats.dominant] : null;

  return (
    <Box>
      <Box
        sx={{
          color: "#fff",
          pt: { xs: 5, md: 8 },
          pb: { xs: 14, md: 16 },
          background: "linear-gradient(135deg, #0D47A1 0%, #1976D2 100%)",
        }}
      >
        <Container maxWidth={false} sx={{ px: { xs: 2, md: 5 } }}>
          <Typography
            component="h1"
            sx={{ fontSize: { xs: 30, md: 42 }, fontWeight: 800, mb: 1.5 }}
          >
            لوحة المؤشرات
          </Typography>
          <Typography sx={{ fontSize: { xs: 16, md: 18 }, opacity: 0.9 }}>
            ملخّص مرئي لنتائج آخر تحليل جماعي: توزيع المشاعر وأكثر الكلمات
            تكراراً في المراجعات الإيجابية والسلبية.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth={false} sx={{ mt: -9, pb: 8, px: { xs: 2, md: 5 } }}>
        {!stats ? (
          <Paper
            variant="outlined"
            sx={{ p: { xs: 2.5, md: 4 }, borderColor: "divider" }}
          >
            <Alert
              severity="info"
              action={
                <Button
                  color="inherit"
                  size="small"
                  component={RouterLink}
                  to="/batch"
                >
                  فتح التحليل الجماعي
                </Button>
              }
            >
              لا توجد بيانات لعرضها. قم بتنفيذ تحليل جماعي أولاً.
            </Alert>
          </Paper>
        ) : (
          <>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                gap: 2,
              }}
            >
              <KpiCard
                label="عدد المراجعات المحلَّلة"
                value={stats.total}
                color="primary"
                Icon={RateReviewIcon}
              />
              <KpiCard
                label="متوسط نسبة الإيجابية"
                value={`${stats.avg}%`}
                color="primary"
                Icon={ThumbsUpDownIcon}
              />
              <KpiCard
                label="الاتجاه العام"
                value={dominant.label}
                hint={`${stats.counts[stats.dominant]} من ${stats.total} مراجعة`}
                color={dominant.color}
                Icon={dominant.Icon}
              />
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", lg: "repeat(3, 1fr)" },
                gap: 2,
                mt: 2,
              }}
            >
              <ChartCard title="توزيع المراجعات">
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={2}
                    >
                      {pieData.map((d) => (
                        <Cell key={d.name} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      formatter={(value, name) => [`${value} مراجعة`, name]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="أكثر الكلمات الإيجابية تكراراً">
                <WordsBars data={stats.pos} color="success" />
              </ChartCard>

              <ChartCard title="أكثر الكلمات السلبية تكراراً">
                <WordsBars data={stats.neg} color="error" />
              </ChartCard>
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
}
