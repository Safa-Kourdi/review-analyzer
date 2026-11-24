import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split

from prepare_utils import clean

df = pd.read_csv("clean.csv", encoding="utf-8-sig").dropna()

X_train, X_test, y_train, y_test = train_test_split(
    df["clean"], df["label"], test_size=0.2, random_state=42, stratify=df["label"]
)
print("Train:", len(X_train), "| Test:", len(X_test))

vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=5, max_features=30000)
X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec = vectorizer.transform(X_test)
print("Features:", X_train_vec.shape[1])

model = LogisticRegression(max_iter=1000, C=2.0)
model.fit(X_train_vec, y_train)

pred = model.predict(X_test_vec)
print("\nAccuracy:", round(accuracy_score(y_test, pred) * 100, 2), "%")
print(classification_report(y_test, pred, target_names=["negative", "positive"]))

words = np.array(vectorizer.get_feature_names_out())
order = np.argsort(model.coef_[0])
print("Most NEGATIVE words:", list(words[order[:15]]))
print("Most POSITIVE words:", list(words[order[-15:]][::-1]))

tests = [
    "الغرفة نظيفة والموظفين ممتازين",
    "المكان وسخ والخدمة سيئة جدا",
    "الفندق مو نظيف ابدا",
    "تجربة عادية لا بأس بها",
    "النظافة ممتازة بس السعر غالي",
]
print("\nTry it:")
for t in tests:
    p = model.predict_proba(vectorizer.transform([clean(t)]))[0][1]
    print(f"{p:.2f}  {t}")