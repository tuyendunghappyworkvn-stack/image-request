"use client";

import { useRef, useState } from "react";

export default function AdminTemplatePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [style, setStyle] = useState("");
  const [jobCount, setJobCount] = useState<number>(0);

  // ✅ TEXT JD
  const [textJD, setTextJD] = useState<boolean>(false);

  // ✅ 4 FIELD MỚI
  const [congViecLimit, setCongViecLimit] = useState<number>(0);
  const [quyenLoiLimit, setQuyenLoiLimit] = useState<number>(0);
  const [yeuCauLimit, setYeuCauLimit] = useState<number>(0);
  const [dauDong, setDauDong] = useState<string>("");

  // ✅ 2 FIELD CŨ (GIỮ NGUYÊN – KHÔNG CHO USER NHẬP TAY)
  const [presentationId, setPresentationId] = useState("");
  const [slideIdMau, setSlideIdMau] = useState("");

  // ✅ LINK SLIDE MẪU (NEW)
  const [slideLink, setSlideLink] = useState("");

  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /* =========================
     PARSE GOOGLE SLIDE LINK
     (CHỈ THÊM – KHÔNG ĐỘNG LOGIC CŨ)
  ========================= */
  function parseGoogleSlideLink(link: string) {
    try {
      const presentationMatch = link.match(/\/d\/([^/]+)\//);
      const slideMatch = link.match(/slide=id\.([a-zA-Z0-9_]+)/);

      return {
        presentationId: presentationMatch?.[1] || "",
        slideId: slideMatch?.[1] || "",
      };
    } catch {
      return { presentationId: "", slideId: "" };
    }
  }

  function resetForm() {
    setFile(null);
    setPreview(null);
    setStyle("");
    setJobCount(0);
    setTextJD(false);

    setCongViecLimit(0);
    setQuyenLoiLimit(0);
    setYeuCauLimit(0);
    setDauDong("");

    setPresentationId("");
    setSlideIdMau("");
    setSlideLink("");

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
      alert("Link slide mẫu không hợp lệ hoặc thiếu slide ID");
      return;
    }

    const templateCode = `${style}_${jobCount}`;
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("template_code", templateCode);
    formData.append("style", style);
    formData.append("job_count", String(jobCount));
    formData.append("text_jd", textJD ? "true" : "false");

    // ✅ 4 FIELD MỚI
    formData.append("cong_viec_limit", String(congViecLimit));
    formData.append("quyen_loi_limit", String(quyenLoiLimit));
    formData.append("yeu_cau_limit", String(yeuCauLimit));
    formData.append("Dấu đầu dòng", dauDong);

    // ✅ CỘT CŨ – GIỮ NGUYÊN
    formData.append("presentation_id", presentationId);
    formData.append("slide_id_mau", slideIdMau);

    // ✅ LINK SLIDE MẪU (NEW – để lưu Lark Base)
    formData.append("slide_link", slideLink);

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

          {/* TEXT JD */}
          <div>
            <label className="font-medium mb-1 block">Text JD</label>
            <label
              htmlFor="textJD"
              className="flex items-center gap-3 border rounded-lg px-3 py-2 cursor-pointer select-none"
            >
              <input
                type="checkbox"
                id="textJD"
                checked={textJD}
                onChange={(e) => setTextJD(e.target.checked)}
                className="w-5 h-5 accent-green-500"
              />
              <span className="text-sm font-medium">Có text JD</span>
            </label>
          </div>

          {/* 4 Ô MỚI */}
          <div>
            <label className="font-medium">Giới hạn dòng – Công việc</label>
            <input
              type="number"
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={congViecLimit}
              onChange={(e) => setCongViecLimit(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="font-medium">Giới hạn dòng – Quyền lợi</label>
            <input
              type="number"
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={quyenLoiLimit}
              onChange={(e) => setQuyenLoiLimit(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="font-medium">Giới hạn dòng – Yêu cầu</label>
            <input
              type="number"
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={yeuCauLimit}
              onChange={(e) => setYeuCauLimit(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="font-medium">Dấu đầu dòng</label>
            <select
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={dauDong}
              onChange={(e) => setDauDong(e.target.value)}
            >
              <option value="">Trống</option>
              <option value=".">Dấu chấm (.)</option>
              <option value="-">Dấu gạch (-)</option>
              <option value="*">Dấu sao (*)</option>
              <option value="+">Dấu cộng (+)</option>
            </select>
          </div>

          {/* LINK SLIDE MẪU (NEW) */}
          <div>
            <label className="font-medium">Link slide mẫu</label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2"
              placeholder="Dán link Google Slide mẫu vào đây"
              value={slideLink}
              onChange={(e) => {
                const link = e.target.value;
                setSlideLink(link);

                const parsed = parseGoogleSlideLink(link);
                setPresentationId(parsed.presentationId);
                setSlideIdMau(parsed.slideId);
              }}
              required
            />

            {(presentationId || slideIdMau) && (
              <p className="text-xs text-gray-500 mt-1">
                PresentationID: <b>{presentationId || "—"}</b> | SlideID:{" "}
                <b>{slideIdMau || "—"}</b>
              </p>
            )}
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
