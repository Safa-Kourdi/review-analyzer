import os
import time
import zipfile
import urllib.request

import pandas as pd

URL = "https://raw.githubusercontent.com/elnagara/HARD-Arabic-Dataset/master/data/balanced-reviews.zip"
ZIP_PATH = "balanced-reviews.zip"
EXPECTED = 8508677  # الحجم الكامل بالـ bytes

if os.path.exists(ZIP_PATH) and os.path.getsize(ZIP_PATH) > EXPECTED:
    os.remove(ZIP_PATH)

attempts = 0
while attempts < 200:
    size = os.path.getsize(ZIP_PATH) if os.path.exists(ZIP_PATH) else 0
    if size >= EXPECTED:
        break
    print(f"{size / 1e6:.2f} / {EXPECTED / 1e6:.2f} MB")
    attempts += 1
    try:
        req = urllib.request.Request(URL, headers={"Range": f"bytes={size}-"})
        with urllib.request.urlopen(req, timeout=60) as r:
            mode = "ab" if r.status == 206 else "wb"
            with open(ZIP_PATH, mode) as f:
                while True:
                    chunk = r.read(64 * 1024)
                    if not chunk:
                        break
                    f.write(chunk)
    except Exception as e:
        print("Interrupted:", e)
        time.sleep(3)

if os.path.getsize(ZIP_PATH) < EXPECTED:
    raise SystemExit("Download incomplete, run the script again")

print("Download done")

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