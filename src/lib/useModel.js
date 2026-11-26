import { useEffect, useState } from "react";

export default function useModel() {
  const [model, setModel] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/model.json")
      .then((r) => r.json())
      .then(setModel)
      .catch(() =>
        setError(
          "تعذّر تحميل النموذج. يرجى التأكد من وجود الملف model.json داخل مجلد public.",
        ),
      );
  }, []);

  return { model, error };
}
