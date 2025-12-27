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

  /* =====================
     IMAGE TITLE
  ====================== */
  const [imageTitle, setImageTitle] = useState("");

  /* =====================
     CONTACT INFO
  ====================== */
  const [email, setEmail] = useState("");
  const [zalo, setZalo] = useState("");

  const [selectedTemplate, setSelectedTemplate] =
    useState<Template | null>(null);

  const [jobs, setJobs] = useState<JobInput[]>([]);

  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [jobsByCompany, setJobsByCompany] =
    useState<Record<string, JobOption[]>>({});

  const [hoverImage, setHoverImage] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);

  /* =====================
     SAFE PREVIEW URL
  ====================== */
  const previewImageUrl =
    resultImage?.view_url
      ? resultImage.view_url.replace("/view", "") + "?export=download"
      : "";

  /* =====================
     LOAD TEMPLATE
  ====================== */
  useEffect(() => {
    if (!jobCount) return;

    setLoading(true);
    setTemplates([]);
    setSelectedTemplate(null);
    setJobs([]);

    fetch(`/api/templates?job_count=${jobCount}`)
      .then((res) => res.json())
      .then((data) => setTemplates(data.data || []))
      .catch(() => setTemplates([]))
      .finally(() => setLoading(false));
  }, [jobCount]);

  /* =====================
     LOAD OPTIONS
  ====================== */
  useEffect(() => {
    fetch("/api/lark/options")
      .then((res) => res.json())
      .then((data) => {
        setCompanies(data.companies || []);
        setJobsByCompany(data.jobsByCompany || {});
      });
  }, []);

  /* =====================
     CONTACT HISTORY
  ====================== */
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

  /* =====================
     SUBMIT
  ====================== */
  async function handleSubmit() {
    if (!jobCount || !selectedTemplate || !imageTitle || !email || !zalo) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    const payload = {
      image_title: imageTitle,
      job_count: jobCount,
      template_code: selectedTemplate.template_code,
      jobs: jobs.map((j) => ({
        company: j.company_name,
        position: j.position_name,
        job_code: j.job_code,
      })),
      contact: { email, zalo },
    };

    try {
      const res = await fetch("/api/submit-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Webhook error");

      const data = await res.json();
      setResultImage(data);
    } catch (err) {
      alert("❌ Gửi dữ liệu thất bại");
    }
  }

  return (
    <main className="min-h-screen bg-[#FFF6ED] p-8">
      {/* ===== FORM GIỮ NGUYÊN ===== */}
      {/* (mình không đụng phần trên của bạn) */}

      {/* =====================
        RESULT PREVIEW
      ====================== */}
      {resultImage && previewImageUrl && (
        <div className="max-w-5xl mx-auto mt-12 bg-white rounded-xl p-6 shadow">
          <h3 className="text-lg font-semibold mb-4 text-center text-orange-600">
            Ảnh đã tạo
          </h3>

          <div className="flex justify-center">
            <img
              src={previewImageUrl}
              alt="Generated"
              className="max-w-full rounded-lg shadow-lg"
            />
          </div>

          <div className="flex justify-center mt-6">
            <a
              href={resultImage.download_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition"
            >
              ⬇️ Tải ảnh
            </a>
          </div>
        </div>
      )}
    </main>
  );
}
