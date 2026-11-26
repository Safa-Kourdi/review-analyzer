 import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  InputAdornment,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import SearchIcon from "@mui/icons-material/Search";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import SentimentNeutralIcon from "@mui/icons-material/SentimentNeutral";
import { analyze } from "../lib/sentiment";

const MAX_ROWS = 1000;

const VERDICTS = {
  positive: { label: "إيجابية", color: "success", Icon: SentimentSatisfiedAltIcon },
  negative: { label: "سلبية", color: "error", Icon: SentimentVeryDissatisfiedIcon },
  neutral: { label: "محايدة", color: "warning", Icon: SentimentNeutralIcon },
};

const SAMPLE = [
  "الغرفة نظيفة والموظفون ممتازون",
  "المكان غير نظيف والخدمة سيئة جدا",
  "النظافة ممتازة لكن السعر مرتفع",
  "تجربة رائعة وسأعود مرة أخرى",
  "الإقامة كانت مخيبة للأمل ولا أنصح بها",
  "الموقع جيد والإفطار متنوع",
  "الغرفة صغيرة جدا والصوت مزعج",
  "موظفو الاستقبال متعاونون جدا",
].join("\n");

const PAGINATION_LABELS = {
  first: "الصفحة الأولى",
  last: "الصفحة الأخيرة",
  next: "الصفحة التالية",
  previous: "الصفحة السابقة",
};

function StatCard({ label, count, total, color, Icon }) {
  const percent = total ? Math.round((count / total) * 100) : 0;
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
          {count}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {percent}% من المراجعات
        </Typography>
      </Box>
    </Paper>
  );
}

export default function BatchPage({ model }) {
  const [text, setText] = useState("");
  const [rows, setRows] = useState(null);
  const [truncated, setTruncated] = useState(false);
  const [skipped, setSkipped] = useState(0);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const lineCount = text.split(/\r?\n/).filter((l) => l.trim()).length;

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setText(String(reader.result).replace(/^\uFEFF/, ""));
    reader.readAsText(file, "utf-8");
    e.target.value = "";
  };

  const handleAnalyze = () => {
    if (!model || lineCount === 0) return;
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    const data = [];
    let skippedCount = 0;
    lines.slice(0, MAX_ROWS).forEach((line) => {
      const r = analyze(model, line);
      if (r.knownCount === 0) {
        skippedCount += 1;
        return;
      }
      data.push({ id: data.length + 1, text: line, p: r.p, verdict: r.verdict });
    });

    setTruncated(lines.length > MAX_ROWS);
    setSkipped(skippedCount);
    setRows(data);
    setFilter("all");
    setQuery("");
    setPage(0);
  };
 const handleClear = () => {
    setText("");
    setRows(null);
  };

  const counts = useMemo(() => {
    const c = { positive: 0, negative: 0, neutral: 0 };
    (rows || []).forEach((r) => {
      c[r.verdict] += 1;
    });
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim();
    return (rows || []).filter(
      (r) =>
        (filter === "all" || r.verdict === filter) &&
        (!q || r.text.includes(q))
    );
  }, [rows, filter, query]);

  const visible = filtered.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

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
            التحليل الجماعي للمراجعات
          </Typography>
          <Typography sx={{ fontSize: { xs: 16, md: 18 }, opacity: 0.9 }}>
            الصق عدداً من المراجعات (كل مراجعة في سطر مستقل) أو ارفع ملفاً
            نصياً، وسيصنّفها النظام دفعة واحدة مع ملخص إحصائي.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth={false} sx={{ mt: -9, pb: 8, px: { xs: 2, md: 5 } }}>
        <Paper
          variant="outlined"
          sx={{ p: { xs: 2.5, md: 4 }, borderColor: "divider" }}
        >
          <TextField
            fullWidth
            multiline
            minRows={6}
            maxRows={14}
            placeholder="الصق المراجعات هنا، كل مراجعة في سطر مستقل"
            value={text}
            onChange={(e) => setText(e.target.value)}
            slotProps={{
              htmlInput: { style: { fontSize: 17, lineHeight: 1.9 } },
            }}
          />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 1 }}
          >
            عدد المراجعات المُدخلة: {lineCount}
          </Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mt: 2 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<AutoGraphIcon />}
              disabled={!model || lineCount === 0}
              onClick={handleAnalyze}
            >
              تحليل المراجعات
            </Button>
            <Button
              variant="outlined"
              size="large"
              component="label"
              startIcon={<UploadFileIcon />}
            >
              رفع ملف نصي
              <input hidden type="file" accept=".txt,.csv" onChange={handleFile} />
            </Button>
            <Button size="large" onClick={() => setText(SAMPLE)}>
              تحميل مثال
            </Button>
            <Button size="large" color="inherit" onClick={handleClear}>
              مسح
            </Button>
          </Box>
        </Paper>

        {rows && (
          <>
            {truncated && (
              <Alert severity="info" sx={{ mt: 3 }}>
                تم تحليل أول {MAX_ROWS} مراجعة فقط.
              </Alert>
            )}
            {skipped > 0 && (
              <Alert severity="info" sx={{ mt: 3 }}>
                تم تخطي {skipped} مراجعة لأنها لا تحتوي على كلمات يعرفها النموذج.
              </Alert>
            )}

            {rows.length === 0 ? (
              <Alert severity="warning" sx={{ mt: 3 }}>
                لم يتم تحليل أي مراجعة. يرجى التأكد من أن النصوص باللغة العربية.
              </Alert>
            ) : (
              <>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
 gap: 2,
                    mt: 3,
                  }}
                >
                  {Object.entries(VERDICTS).map(([key, v]) => (
                    <StatCard
                      key={key}
                      label={`مراجعات ${v.label}`}
                      count={counts[key]}
                      total={rows.length}
                      color={v.color}
                      Icon={v.Icon}
                    />
                  ))}
                </Box>

                <Paper
                  variant="outlined"
                  sx={{ mt: 3, borderColor: "divider", overflow: "hidden" }}
                >
                  <Box
                    sx={{
                      p: 2.5,
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 2,
                    }}
                  >
                    <ToggleButtonGroup
                      exclusive
                      size="small"
                      color="primary"
                      value={filter}
                      onChange={(_, value) => {
                        if (value) {
                          setFilter(value);
                          setPage(0);
                        }
                      }}
                    >
                      <ToggleButton value="all">الكل ({rows.length})</ToggleButton>
                      <ToggleButton value="positive">
                        إيجابية ({counts.positive})
                      </ToggleButton>
                      <ToggleButton value="negative">
                        سلبية ({counts.negative})
                      </ToggleButton>
                      <ToggleButton value="neutral">
                        محايدة ({counts.neutral})
                      </ToggleButton>
                    </ToggleButtonGroup>

                    <TextField
                      size="small"
                      placeholder="بحث داخل المراجعات"
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setPage(0);
                      }}
                      sx={{ minWidth: { xs: "100%", sm: 280 } }}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon fontSize="small" />
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  </Box>

                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: "action.hover" }}>
                          <TableCell sx={{ width: 60, fontWeight: 700 }}>#</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>المراجعة</TableCell>
                          <TableCell sx={{ width: 150, fontWeight: 700 }}>
                            النتيجة
                          </TableCell>
                          <TableCell sx={{ width: 160, fontWeight: 700 }}>
                            نسبة الإيجابية
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {visible.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                              <Typography color="text.secondary">
                                لا توجد نتائج مطابقة.
                              </Typography>
 </TableCell>
                          </TableRow>
                        ) : (
                          visible.map((r) => {
                            const v = VERDICTS[r.verdict];
                            return (
                              <TableRow key={r.id} hover>
                                <TableCell>{r.id}</TableCell>
                                <TableCell sx={{ fontSize: 16 }}>{r.text}</TableCell>
                                <TableCell>
                                  <Chip
                                    size="small"
                                    variant="outlined"
                                    color={v.color}
                                    icon={<v.Icon />}
                                    label={v.label}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" fontWeight={700}>
                                    {Math.round(r.p * 100)}%
                                  </Typography>
                                  <LinearProgress
                                    variant="determinate"
                                    value={r.p * 100}
                                    color={v.color}
                                    sx={{ height: 6, borderRadius: 3, mt: 0.5 }}
                                  />
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <TablePagination
                    component="div"
                    count={filtered.length}
                    page={page}
                    onPageChange={(_, p) => setPage(p)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setPage(0);
                    }}
                    rowsPerPageOptions={[10, 25, 50]}
                    labelRowsPerPage="عدد الصفوف:"
                    labelDisplayedRows={({ from, to, count }) =>
                      `${from}–${to} من ${count}`
                    }
                    getItemAriaLabel={(type) => PAGINATION_LABELS[type]}
                  />
                </Paper>
              </>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}