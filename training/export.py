import json

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

from prepare_utils import clean

df = pd.read_csv("clean.csv", encoding="utf-8-sig").dropna()

vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=5, max_features=30000)
X = vectorizer.fit_transform(df["clean"])

model = LogisticRegression(max_iter=1000, C=2.0)
model.fit(X, df["label"])

terms = vectorizer.get_feature_names_out()
vocab = {
    t: [round(float(i), 4), round(float(c), 4)]
    for t, i, c in zip(terms, vectorizer.idf_, model.coef_[0])
}

out = {"intercept": round(float(model.intercept_[0]), 4), "vocab": vocab}

with open("model.json", "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, separators=(",", ":"))

print("Saved model.json with", len(vocab), "terms")

tests = [
    "الغرفة نظيفة والموظفين ممتازين",
    "المكان وسخ والخدمة سيئة جدا",
    "النظافة ممتازة بس السعر غالي",
]
print("\nPython results (we will compare with the browser later):")
for t in tests:
    p = model.predict_proba(vectorizer.transform([clean(t)]))[0][1]
    print(round(p, 4), t)