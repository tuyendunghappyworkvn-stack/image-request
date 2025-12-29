"use client";

import { useRef, useState } from "react";

export default function AdminTemplatePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [style, setStyle] = useState("");
  const [jobCount, setJobCount] = useState<number>(0);

  // ✅ 2 STATE MỚI
  const [presentationId, setPresentationId] = useState("");
  const [slideIdMau, setSlideIdMau] = useState("");

  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function resetForm() {
    setFile(null);
    setPreview(null);
    setStyle("");
    setJobCount(0);
    setPresentationId("");
    setSlideIdMau("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!file) {
      alert("Vui lòng chọn ảnh template");
      return;
    }

    if (!presentationId || !slideIdMau) {
      alert("Vui lòng nhập Presentation ID và Slide ID mẫu");
      return;
    }

    const templateCode = `${style}_${jobCount}`;

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("template_code", templateCode);
    formData.append("style", style);
    formData.append("job_count", String(jobCount));

    // ✅ GỬI THÊM 2 BIẾN MỚI
    formData.append("presentation_id", presentationId);
    formData.append("slide_id_mau", slideIdMau);

    try {
      const res = await fetch("/api/lark/create-template", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log("UPLOAD RESULT:", data);

      alert("✅ Upload template thành công");
      resetForm();
    } catch (err) {
      alert("❌ Upload thất bại");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FFF6ED] flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-1">Admin Upload Template</h1>
        <p className="text-sm text-gray-500 mb-6">
          Nhập style + số job → tự sinh template_code
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* IMAGE */}
          <div>
            <label className="font-medium">Ảnh template</label>
            <div className="mt-2 border-2 border-dashed rounded-xl p-4 text-center hover:border-orange-400">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                id="upload"
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

          {/* STYLE */}
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

          {/* JOB COUNT */}
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

          {/* ✅ PRESENTATION ID */}
          <div>
            <label className="font-medium">Presentation ID</label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2"
              placeholder="VD: 1mWNJFYmH5N9IXc51..."
              value={presentationId}
              onChange={(e) => setPresentationId(e.target.value)}
              required
            />
          </div>

          {/* ✅ SLIDE ID MẪU */}
          <div>
            <label className="font-medium">Slide ID mẫu</label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2"
              placeholder="VD: g3a6c548bc07_0_1"
              value={slideIdMau}
              onChange={(e) => setSlideIdMau(e.target.value)}
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
