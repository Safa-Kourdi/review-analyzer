import re
import pandas as pd

df = pd.read_csv("reviews.csv", encoding="utf-8-sig")
df = df[["rating", "review"]].dropna()

# 1 = positive (4 and 5 stars), 0 = negative (1 and 2 stars)
df["label"] = (df["rating"] >= 4).astype(int)


def clean(text):
    text = re.sub(r"[\u064B-\u0652\u0640]", "", text)   # diacritics + tatweel
    text = re.sub(r"[أإآ]", "ا", text)                  # unify alef
    text = text.replace("ى", "ي")                       # unify ya
    text = re.sub(r"[^\u0621-\u064A\s]", " ", text)     # keep Arabic letters only
    text = re.sub(r"\s+", " ", text).strip()
    return text


df["clean"] = df["review"].apply(clean)

before = len(df)
df = df[df["clean"].str.len() > 0]
df = df.drop_duplicates(subset="clean")
print(f"Removed {before - len(df)} empty/duplicate rows, kept {len(df)}")

print("\nBefore -> After:")
for i in range(3):
    print("\n", df["review"].iloc[i][:120])
    print("->", df["clean"].iloc[i][:120])

print("\nLabel counts:")
print(df["label"].value_counts())

df[["clean", "label"]].to_csv("clean.csv", index=False, encoding="utf-8-sig")
print("\nSaved clean.csv")