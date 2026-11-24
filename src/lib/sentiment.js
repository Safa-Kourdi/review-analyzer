export function cleanText(text) {
  return text
    .replace(/[\u064B-\u0652\u0640]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/[^\u0621-\u064A\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function predict(model, text) {
  const tokens = cleanText(text)
    .split(" ")
    .filter((t) => t.length >= 2);

  const terms = [...tokens];
  for (let i = 0; i < tokens.length - 1; i++) {
    terms.push(tokens[i] + " " + tokens[i + 1]);
  }

  const counts = {};
  for (const t of terms) {
    if (model.vocab[t]) counts[t] = (counts[t] || 0) + 1;
  }

  const values = {};
  let norm = 0;
  for (const [t, count] of Object.entries(counts)) {
    const v = count * model.vocab[t][0]; // tf * idf
    values[t] = v;
    norm += v * v;
  }
  norm = Math.sqrt(norm);

  let z = model.intercept;
  if (norm > 0) {
    for (const [t, v] of Object.entries(values)) {
      z += (v / norm) * model.vocab[t][1]; // weight of the word
    }
  }

  return 1 / (1 + Math.exp(-z));
}

export function getVerdict(p) {
  if (p >= 0.65) return "positive";
  if (p <= 0.35) return "negative";
  return "neutral";
}
export function analyze(model, text) {
  const tokens = cleanText(text)
    .split(" ")
    .filter((t) => t.length >= 2);

  const terms = [...tokens];
  for (let i = 0; i < tokens.length - 1; i++) {
    terms.push(tokens[i] + " " + tokens[i + 1]);
  }

  const counts = {};
  for (const t of terms) {
    if (model.vocab[t]) counts[t] = (counts[t] || 0) + 1;
  }

  const values = {};
  let norm = 0;
  for (const [t, count] of Object.entries(counts)) {
    const v = count * model.vocab[t][0];
    values[t] = v;
    norm += v * v;
  }
  norm = Math.sqrt(norm);

  let z = model.intercept;
  const contributions = [];
  if (norm > 0) {
    for (const [t, v] of Object.entries(values)) {
      const effect = (v / norm) * model.vocab[t][1];
      z += effect;
      contributions.push({ word: t, effect });
    }
  }
  contributions.sort((a, b) => Math.abs(b.effect) - Math.abs(a.effect));

  const p = 1 / (1 + Math.exp(-z));
//   return {
//     p,
//     verdict: getVerdict(p),
//     words: contributions.slice(0, 6),
//     knownCount: contributions.length,
//   };
return {
  p,
  verdict: getVerdict(p),
  words: contributions.slice(0, 6),
  all: contributions,
  knownCount: contributions.length,
};
}
