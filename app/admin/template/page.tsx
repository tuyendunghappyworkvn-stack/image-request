"use client";

import { useState } from "react";

export default function AdminTemplatePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [style, setStyle] = useState("");
  const [jobCount, setJobCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      alert("Vui lòng chọn ảnh");
      return;
    }

    const templateCode = `${style}_${jobCount}`;

    setLoading(true);

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
    console.log(data);

    setLoading(false);
    alert("Upload xong, mở DevTools > Network để xem response");
  }

  return (
    <div className="min-h-screen bg-[#FFF6ED] flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-1">Admin Upload Template</h1>
        <p className="text-sm text-gray-500 mb-6">
          Nhập style + số job → tự sinh template_code
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-medium">Ảnh template</label>
            <div className="mt-2 border-2 border-dashed rounded-xl p-4 text-center hover:border-orange-400">
              <input
                type="file"
                accept="image/*"
                id="upload"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setFile(f || null);
                  if (f) setPreview(URL.createObjectURL(f));
                }}
              />
              <label htmlFor="upload" className="cursor-pointer">
                {preview ? (
                  <img
                    src={preview}
                    className="mx-auto rounded-lg max-h-48"
                  />
                ) : (
                  <p className="text-gray-500">
                    Click để chọn ảnh (PNG / JPG)
                  </p>
                )}
              </label>
            </div>
          </div>

          <div>
            <label className="font-medium">Style</label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2"
              placeholder="noel / sunshine"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="font-medium">Số job</label>
            <input
              type="number"
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={jobCount}
              onChange={(e) => setJobCount(Number(e.target.value))}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl"
          >
            {loading ? "Đang upload..." : "Upload template"}
          </button>
        </form>
      </div>
    </div>
  );
}
