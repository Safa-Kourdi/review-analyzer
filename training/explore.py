import pandas as pd

df = pd.read_csv("reviews.csv", encoding="utf-8-sig")

print("Rows:", len(df))

print("\nMissing values:")
print(df[["rating", "review"]].isna().sum())

print("\nRating counts:")
print(df["rating"].value_counts().sort_index())

df = df.dropna(subset=["rating", "review"])
df["words"] = df["review"].str.split().str.len()
print("\nAverage words per review:", round(df["words"].mean(), 1))

print("\nSample reviews per rating:")
for r in sorted(df["rating"].unique()):
    print(f"\n--- rating {r} ---")
    for text in df[df["rating"] == r]["review"].head(2):
        print(text[:150])