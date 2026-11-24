import re


def clean(text):
    text = re.sub(r"[\u064B-\u0652\u0640]", "", text)
    text = re.sub(r"[أإآ]", "ا", text)
    text = text.replace("ى", "ي")
    text = re.sub(r"[^\u0621-\u064A\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text
