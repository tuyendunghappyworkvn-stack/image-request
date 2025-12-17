"use client";

import { useState } from "react";

export default function AdminTemplatePage() {
  const [file, setFile] = useState<File | null>(null);
  const [templateCode, setTemplateCode] = useState("");
  const [style, setStyle] = useState("");
  const [jobCount, setJobCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      alert("Chưa chọn ảnh");
      return;
    }

    setLoading(true);
    setResult("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("template_code", templateCode);
    formData.append("style", style);
    formData.append("job_count", String(jobCount));

    const res = await fetch("/api/lark/create-template", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResult(JSON.stringify(data, null, 2));
    setLoading(false);
  }

  return (
    <div style={{ padding: 40, maxWidth: 600 }}>
      <h1>Admin Upload Template</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Ảnh template</label><br />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>

        <div>
          <label>Template code</label><br />
          <input
            value={templateCode}
            onChange={(e) => setTemplateCode(e.target.value)}
            placeholder="noel_06"
            required
          />
        </div>

        <div>
          <label>Style</label><br />
          <input
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            placeholder="noel / sunshine"
            required
          />
        </div>

        <div>
          <label>Số job</label><br />
          <input
            type="number"
            value={jobCount}
            onChange={(e) => setJobCount(Number(e.target.value))}
            required
          />
        </div>

        <br />

        <button type="submit" disabled={loading}>
          {loading ? "Đang upload..." : "Upload template"}
        </button>
      </form>

      {result && (
        <pre style={{ marginTop: 20, background: "#f5f5f5", padding: 10 }}>
          {result}
        </pre>
      )}
    </div>
  );
}
