import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  LinearProgress,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import SentimentNeutralIcon from "@mui/icons-material/SentimentNeutral";
import { analyze, cleanText } from "../lib/sentiment";

const VERDICTS = {
  positive: {
    label: "مراجعة إيجابية",
    color: "success",
    Icon: SentimentSatisfiedAltIcon,
  },
  negative: {
    label: "مراجعة سلبية",
    color: "error",
    Icon: SentimentVeryDissatisfiedIcon,
  },
  neutral: {
    label: "مراجعة محايدة",
    color: "warning",
    Icon: SentimentNeutralIcon,
  },
};

const EXAMPLES = [
  "الغرفة نظيفة والموظفون ممتازون",
  "المكان غير نظيف والخدمة سيئة جدا",
  "النظافة ممتازة لكن السعر مرتفع",
];

function Highlighted({ text, all }) {
  const theme = useTheme();
  const effects = {};
  for (const { word, effect } of all) {
    const parts = word.split(" ");
    for (const p of parts) {
      effects[p] = (effects[p] || 0) + effect / parts.length;
    }
  }

  return (
    <Typography sx={{ fontSize: 20, lineHeight: 2.4 }}>
      {text.split(/(\s+)/).map((part, i) => {
        const effect = effects[cleanText(part)];
        if (!part.trim() || effect === undefined || Math.abs(effect) < 0.1) {
          return <span key={i}>{part}</span>;
        }
        const strength = 0.2 + 0.5 * Math.min(Math.abs(effect) / 1.2, 1);
        const base =
          effect > 0 ? theme.palette.success.main : theme.palette.error.main;
        return (
          <Box
            key={i}
            component="mark"
            title={`${effect > 0 ? "+" : ""}${effect.toFixed(2)}`}
            sx={{
              bgcolor: alpha(base, strength),
              color: "inherit",
              px: 0.75,
              py: 0.25,
              borderRadius: 1,
            }}
          >
            {part}
          </Box>
        );
      })}
    </Typography>
  );
}

function Legend({ color, label }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Box sx={{ width: 14, height: 14, borderRadius: 0.5, bgcolor: color }} />
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}

export default function AnalyzePage({ model, error }) {
  const [text, setText] = useState("");
  const [analyzedText, setAnalyzedText] = useState("");
  const [result, setResult] = useState(null);

  const run = (value) => {
    if (!model || !value.trim()) return;
    setAnalyzedText(value);
    setResult(analyze(model, value));
  };

  const handleChange = (value) => {
    setText(value);
    if (!value.trim()) setResult(null);
  };

  const handleClear = () => {
    setText("");
    setResult(null);
  };

  const verdict = result ? VERDICTS[result.verdict] : null;
  const percent = result ? Math.round(result.p * 100) : 0;

  const confidenceText = () => {
    if (result.verdict === "neutral") {
      return "النموذج غير متأكد من الاتجاه العام للمراجعة.";
    }
    const pct = (result.verdict === "positive" ? result.p : 1 - result.p) * 100;
    return `ثقة النموذج في هذه النتيجة: ${pct > 99 ? "أكثر من 99" : Math.round(pct)}%`;
  };

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
            تحليل مراجعات العملاء
          </Typography>
          <Typography sx={{ fontSize: { xs: 16, md: 18 }, opacity: 0.9 }}>
            أدخل مراجعة باللغة العربية ليحدّد النظام ما إذا كانت إيجابية أم
            سلبية، مع توضيح الكلمات التي أثّرت في النتيجة.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth={false} sx={{ mt: -9, pb: 8, px: { xs: 2, md: 5 } }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper
          variant="outlined"
          sx={{ p: { xs: 2.5, md: 4 }, borderColor: "divider" }}
        >
          <TextField
            fullWidth
            multiline
            minRows={5}
            placeholder="اكتب المراجعة أو الصقها هنا"
            value={text}
            onChange={(e) => handleChange(e.target.value)}
            slotProps={{
              htmlInput: { style: { fontSize: 18, lineHeight: 1.9 } },
            }}
          />

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 1,
              mt: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              أمثلة جاهزة:
            </Typography>
            {EXAMPLES.map((ex) => (
              <Chip
                key={ex}
                label={ex}
                variant="outlined"
                clickable
                onClick={() => {
                  setText(ex);
                  run(ex);
                }}
              />
            ))}
          </Box>

          <Box sx={{ display: "flex", gap: 1.5, mt: 3 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<AutoGraphIcon />}
              disabled={!model || !text.trim()}
              onClick={() => run(text)}
            >
              تحليل المراجعة
            </Button>
            <Button variant="outlined" size="large" onClick={handleClear}>
              مسح
            </Button>
          </Box>
        </Paper>

        {result && (
          <Paper
            variant="outlined"
            sx={{ mt: 3, p: { xs: 2.5, md: 4 }, borderColor: "divider" }}
          >
            {result.knownCount === 0 ? (
              <Alert severity="info">
                لم يتعرّف النموذج على كلمات كافية في هذا النص. يرجى إدخال مراجعة
                أطول.
              </Alert>
            ) : (
              <>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
                  <Box
                    sx={{
                      width: 72,
                      height: 72,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      bgcolor: (t) =>
                        alpha(t.palette[verdict.color].main, 0.12),
                      color: `${verdict.color}.main`,
                    }}
                  >
                    <verdict.Icon sx={{ fontSize: 44 }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      نتيجة التحليل
                    </Typography>
                    <Typography
                      sx={{ fontSize: 28, fontWeight: 800 }}
                      color={`${verdict.color}.main`}
                    >
                      {verdict.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {confidenceText()}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ mt: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 0.75,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      نسبة الإيجابية
                    </Typography>
                    <Typography variant="body2" fontWeight={700}>
                      {percent}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={percent}
                    color={verdict.color}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                  الكلمات المؤثرة في النتيجة
                </Typography>
                <Highlighted text={analyzedText} all={result.all} />

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mt: 2 }}>
                  <Legend
                    color="success.main"
                    label="ترفع التقييم نحو الإيجابي"
                  />
                  <Legend color="error.main" label="تخفض التقييم نحو السلبي" />
                </Box>
              </>
            )}
          </Paper>
        )}

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 4 }}
        >
          النموذج مدرَّب على مراجعات فنادق باللغة العربية، لذا قد تقلّ دقته مع
          المجالات واللهجات الأخرى.
        </Typography>
      </Container>
    </Box>
  );
}
