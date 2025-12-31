"use client";

import { useEffect, useRef, useState } from "react";

type Template = {
  template_code: string;
  style: string;
  thumbnail: string;
};

type CompanyOption = {
  id: string;
  name: string;
};

type JobOption = {
  position: string;
  code: string;
};

type JobInput = {
  company_name: string;
  position_name: string;
  job_code?: string;
};

type ContactHistory = {
  email: string;
  zalo: string;
};

export default function HomePage() {
  const [jobCount, setJobCount] = useState<number | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<any | null>(null);

  const [imageTitle, setImageTitle] = useState("");
  const [email, setEmail] = useState("");
  const [zalo, setZalo] = useState("");

  const [selectedTemplate, setSelectedTemplate] =
    useState<Template | null>(null);

  const [jobs, setJobs] = useState<JobInput[]>([]);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [jobsByCompany, setJobsByCompany] =
    useState<Record<string, JobOption[]>>({});

  const [optionLoading, setOptionLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [hoverImage, setHoverImage] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);

  /* =========================
     LOAD TEMPLATE
  ========================= */
  useEffect(() => {
    if (!jobCount) return;

    setLoading(true);
    setTemplates([]);
    setSelectedTemplate(null);
    setResultImage(null);

    fetch(`/api/templates?job_count=${jobCount}`)
      .then((res) => res.json())
      .then((data) => setTemplates(data.data || []))
      .catch(() => setTemplates([]))
      .finally(() => setLoading(false));
  }, [jobCount]);

  /* =========================
     LOAD OPTIONS
  ========================= */
  function loadOptions() {
    const cached = localStorage.getItem("lark_options");

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setCompanies(parsed.companies || []);
        setJobsByCompany(parsed.jobsByCompany || {});
        setOptionLoading(false);
        return;
      } catch {
        localStorage.removeItem("lark_options");
      }
    }

    setOptionLoading(true);

    fetch("/api/lark/options")
      .then((res) => res.json())
      .then((data) => {
        setCompanies(data.companies || []);
        setJobsByCompany(data.jobsByCompany || {});
        localStorage.setItem(
          "lark_options",
          JSON.stringify({
            companies: data.companies || [],
            jobsByCompany: data.jobsByCompany || {},
            cachedAt: Date.now(),
          })
        );
      })
      .finally(() => setOptionLoading(false));
  }

  useEffect(() => {
    fetch("/api/option-version")
      .then((res) => res.json())
      .then((data) => {
        const localVersion = localStorage.getItem("option_version");
        if (localVersion !== String(data.version)) {
          localStorage.removeItem("lark_options");
          localStorage.setItem("option_version", String(data.version));
        }
      })
      .finally(loadOptions);
  }, []);

  /* =========================
     LOAD CONTACT
  ========================= */
  useEffect(() => {
    const history: ContactHistory[] = JSON.parse(
      localStorage.getItem("contact_history") || "[]"
    );
    if (history.length > 0) {
      setEmail(history[0].email || "");
      setZalo(history[0].zalo || "");
    }
  }, []);

  function handleMouseEnter(e: React.MouseEvent, thumbnail: string) {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => {
      setMousePos({ x: e.clientX + 24, y: e.clientY + 24 });
      setHoverImage(thumbnail);
    }, 200);
  }

  function handleMouseMove(e: React.MouseEvent) {
    setMousePos({ x: e.clientX + 24, y: e.clientY + 24 });
  }

  function handleMouseLeave() {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setHoverImage(null);
  }

  /* =========================
     SUBMIT
  ========================= */
  async function handleSubmit() {
    if (isSubmitting) return;

    if (!jobCount || !selectedTemplate) {
      alert("Vui lòng chọn số job và mẫu ảnh");
      return;
    }

    if (!imageTitle || !email || !zalo) {
      alert("Vui lòng nhập đầy đủ tiêu đề, email và Zalo");
      return;
    }

    setIsSubmitting(true);
    setResultImage(null);

    try {
      const res = await fetch("/api/submit-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_title: imageTitle,
          job_count: jobCount,
          template_code: selectedTemplate.template_code,
          jobs,
          contact: { email, zalo },
        }),
      });

      if (!res.ok) throw new Error("Webhook error");

      const data = await res.json();
      setResultImage(Array.isArray(data) ? data[0] : data);
    } catch {
      alert("❌ Gửi dữ liệu thất bại");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#FFF6ED] p-8">
      {/* ================= HEADER ================= */}
      <header className="max-w-5xl mx-auto mb-6 flex items-center justify-between">
        <img src="/logo.png" alt="Happywork" className="h-10 w-auto" />

        <a
          href="https://image-request-eta.vercel.app/admin/template"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 font-medium"
        >
          Admin
        </a>
      </header>

      {/* ================= FORM ================= */}
      <div className="max-w-5xl mx-auto bg-white rounded-xl p-8 shadow">
        <h1 className="text-[42px] font-semibold mb-10 text-gray-900 text-center">
          TẠO ẢNH TỰ ĐỘNG
        </h1>

        {/* STEP 1 */}
        <div className="mb-6">
          <div className="font-semibold mb-3">1️⃣ Bạn cần bao nhiêu job?</div>
          <div className="flex gap-3 flex-wrap">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <button
                key={n}
                onClick={() => {
                  setJobCount(n);
                  setJobs(
                    Array.from({ length: n }, () => ({
                      company_name: "",
                      position_name: "",
                    }))
                  );
                }}
                className={`px-4 py-2 rounded border ${
                  jobCount === n
                    ? "bg-orange-500 text-white"
                    : "border-orange-400 text-orange-500"
                }`}
              >
                {n} job
              </button>
            ))}
          </div>
        </div>

        {/* BUTTON */}
        <div className="text-center mt-10">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-8 py-3 rounded-lg text-white ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            {isSubmitting ? "⏳ Đang tạo ảnh..." : "Tạo ảnh"}
          </button>
        </div>
      </div>

      {/* ================= RESULT ================= */}
      {resultImage && (
        <div className="max-w-5xl mx-auto mt-12 bg-white rounded-xl p-6 shadow text-center">
          <h3 className="text-lg font-semibold mb-4 text-orange-600">
            Ảnh đã tạo
          </h3>

          <div className="flex justify-center gap-4 flex-wrap">
            {resultImage.view_url && (
              <a
                href={resultImage.view_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-[#2DB24A] text-white rounded-lg hover:bg-[#24923D]"
              >
                Xem ảnh
              </a>
            )}

            {resultImage.download_url && (
              <a
                href={resultImage.download_url}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Tải ảnh
              </a>
            )}

            {/* 🔵 NÚT SỬA ẢNH */}
            {resultImage.edit_link && (
              <a
                href={resultImage.edit_link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-[#2563EB] text-white rounded-lg hover:bg-[#1D4ED8]"
              >
                ✏️ Sửa ảnh
              </a>
            )}
          </div>

          {resultImage.file_name && (
            <p className="text-sm text-gray-500 mt-3">
              File: {resultImage.file_name}
            </p>
          )}
        </div>
      )}

      {hoverImage && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{ left: mousePos.x, top: mousePos.y - 150 }}
        >
          <img
            src={hoverImage}
            className="w-[420px] rounded shadow-xl"
          />
        </div>
      )}
    </main>
  );
}
