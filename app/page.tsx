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

  /* =====================
     IMAGE TITLE
  ====================== */
  const [imageTitle, setImageTitle] = useState("");

  /* =====================
     RESULT IMAGE
  ====================== */
  const [resultImage, setResultImage] = useState<any | null>(null);

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
     LOAD TEMPLATE
  ====================== */
  useEffect(() => {
    if (!jobCount) return;

    setLoading(true);
    setTemplates([]);
    setSelectedTemplate(null);
    setJobs([]);
    setResultImage(null);

    fetch(`/api/templates?job_count=${jobCount}`)
      .then((res) => res.json())
      .then((data) => setTemplates(data.data || []))
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
     LOAD CONTACT HISTORY
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

  /* =====================
     SUBMIT
  ====================== */
  async function handleSubmit() {
    if (!jobCount || !selectedTemplate) {
      alert("Vui lòng chọn số job và mẫu ảnh");
      return;
    }

    if (!imageTitle) {
      alert("Vui lòng nhập tiêu đề ảnh");
      return;
    }

    if (!email || !zalo) {
      alert("Vui lòng nhập email và số Zalo");
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

      const data = await res.json();
      setResultImage(data);
    } catch (err) {
      console.error(err);
      alert("❌ Gửi dữ liệu thất bại");
    }
  }

  return (
    <main className="min-h-screen bg-[#FFF6ED] p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-xl p-8 shadow">
        <h1 className="text-2xl font-bold mb-6">
          Chọn mẫu ảnh & cấu hình job
        </h1>

        {/* STEP 1 */}
        <div className="mb-6">
          <div className="font-semibold mb-3">
            1️⃣ Bạn cần bao nhiêu job?
          </div>
          <div className="flex gap-3 flex-wrap">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <button
                key={n}
                onClick={() => setJobCount(n)}
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

        {/* STEP 2 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {templates.map((tpl) => (
            <div
              key={tpl.template_code}
              onClick={() => {
                setSelectedTemplate(tpl);
                setJobs(
                  Array.from({ length: jobCount || 0 }, () => ({
                    company_name: "",
                    position_name: "",
                  }))
                );
              }}
              className={`border rounded-xl cursor-pointer ${
                selectedTemplate?.template_code === tpl.template_code
                  ? "border-orange-500 bg-orange-50"
                  : ""
              }`}
            >
              <img
                src={tpl.thumbnail}
                className="w-full h-40 object-contain bg-gray-50"
              />
              <div className="p-2 text-center font-medium">
                {tpl.template_code}
              </div>
            </div>
          ))}
        </div>

        {/* STEP 3 */}
        {selectedTemplate && (
          <div className="mt-10">
            <input
              value={imageTitle}
              onChange={(e) => setImageTitle(e.target.value)}
              placeholder="Tiêu đề ảnh"
              className="w-full border rounded px-4 py-3 mb-6"
            />

            {jobs.map((job, index) => {
              const jobOptions =
                jobsByCompany[job.company_name] || [];

              return (
                <div
                  key={index}
                  className="grid grid-cols-2 gap-4 mb-3 bg-orange-50 p-3 rounded"
                >
                  <select
                    value={job.company_name}
                    onChange={(e) => {
                      const newJobs = [...jobs];
                      newJobs[index] = {
                        company_name: e.target.value,
                        position_name: "",
                      };
                      setJobs(newJobs);
                    }}
                  >
                    <option value="">Chọn công ty</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={job.position_name}
                    onChange={(e) => {
                      const selected = jobOptions.find(
                        (j) => j.position === e.target.value
                      );

                      const newJobs = [...jobs];
                      newJobs[index] = {
                        ...newJobs[index],
                        position_name: e.target.value,
                        job_code: selected?.code,
                      };
                      setJobs(newJobs);
                    }}
                  >
                    <option value="">Chọn công việc</option>
                    {jobOptions.map((j) => (
                      <option key={j.code} value={j.position}>
                        {j.position}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}

            <button
              onClick={handleSubmit}
              className="mt-6 px-8 py-3 bg-orange-500 text-white rounded-lg"
            >
              Tạo ảnh
            </button>

            {/* RESULT */}
            {resultImage && (
              <div className="mt-8 bg-orange-50 p-4 rounded">
                <img
                  src={resultImage.preview_url}
                  className="rounded mb-3"
                />
                <div className="flex gap-3">
                  <a
                    href={resultImage.view_url}
                    target="_blank"
                    className="px-4 py-2 bg-gray-200 rounded"
                  >
                    👀 Xem full
                  </a>
                  <a
                    href={resultImage.download_url}
                    className="px-4 py-2 bg-orange-500 text-white rounded"
                  >
                    ⬇️ Tải ảnh
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
