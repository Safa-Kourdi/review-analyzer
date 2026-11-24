import os
import time
import zipfile
import urllib.request

import pandas as pd

URL = "https://raw.githubusercontent.com/elnagara/HARD-Arabic-Dataset/master/data/balanced-reviews.zip"
ZIP_PATH = "balanced-reviews.zip"

if not os.path.exists(ZIP_PATH):
    for attempt in range(1, 6):
        try:
            print(f"Downloading (attempt {attempt}/5)...")
            with urllib.request.urlopen(URL, timeout=120) as r, open(ZIP_PATH, "wb") as f:
                while True:
                    chunk = r.read(64 * 1024)
                    if not chunk:
                        break
                    f.write(chunk)
            print("Download done")
            break
        except Exception as e:
            print("Failed:", e)
            if os.path.exists(ZIP_PATH):
                os.remove(ZIP_PATH)
            time.sleep(3)
    else:
        raise SystemExit("Download failed after 5 attempts")

with zipfile.ZipFile(ZIP_PATH) as z:
    names = z.namelist()
    print("Files in zip:", names)
    z.extractall(".")

df = pd.read_csv(names[0], sep="\t", encoding="utf-16", quoting=3)

print(df.shape)
print(df.columns.tolist())
print(df.head())

df.to_csv("reviews.csv", index=False, encoding="utf-8-sig")
print("Saved reviews.csv")