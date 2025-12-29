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

  const [hoverImage, setHoverImage] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);

  /* LOAD TEMPLATE */
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

  /* LOAD LARK OPTIONS */
  useEffect(() => {
    fetch("/api/lark/options")
      .then((res) => res.json())
      .then((data) => {
        setCompanies(data.companies || []);
        setJobsByCompany(data.jobsByCompany || {});
      });
  }, []);

  /* LOAD CONTACT */
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

  async function handleSubmit() {
    if (!jobCount || !selectedTemplate) {
      alert("Vui lòng chọn số job và mẫu ảnh");
      return;
    }

    if (!imageTitle || !email || !zalo) {
      alert("Vui lòng nhập đầy đủ tiêu đề, email và Zalo");
      return;
    }

    const payload = {
      image_title: imageTitle,
      job_count: jobCount,
      template_code: selectedTemplate.template_code,
      jobs,
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
      setResultImage(Array.isArray(data) ? data[0] : data);
    } catch {
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

        {/* STEP 2 → 5 */}
        {jobCount && (
          <>
            {/* STEP 2 */}
            <div className="mb-8">
              <div className="font-semibold mb-3">
                2️⃣ Chọn mẫu ({templates.length} mẫu)
              </div>
              
              {loading ? (
                <div className="py-10 text-center text-gray-500">
                  ⏳ Đang tải mẫu ảnh, vui lòng chờ...
                </div>
              ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {templates.map((tpl) => (
                  <div
                    key={tpl.template_code}
                    onClick={() => setSelectedTemplate(tpl)}
                    onMouseEnter={(e) =>
                      handleMouseEnter(e, tpl.thumbnail)
                    }
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    className={`border rounded-xl cursor-pointer ${
                      selectedTemplate?.template_code === tpl.template_code
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200"
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
            </div>

            {/* STEP 3 */}
            <h3 className="text-lg font-semibold mb-4">
              3️⃣ Tiêu đề ảnh
            </h3>
            <input
              value={imageTitle}
              onChange={(e) => setImageTitle(e.target.value)}
              className="w-full border rounded px-4 py-3 mb-6"
              placeholder="VD: IDEA POD"
            />

            {/* STEP 4 */}
            <h3 className="text-lg font-semibold mb-4">
              4️⃣ Chọn thông tin công việc
            </h3>

            <div className="space-y-3 mb-8">
              {jobs.map((job, index) => {
                const jobOptions =
                  jobsByCompany[job.company_name] || [];
                return (
                  <div key={index} className="grid grid-cols-2 gap-4">
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
                      className="border px-3 py-2 rounded"
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
                      disabled={!job.company_name}
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
                      className="border px-3 py-2 rounded"
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
            </div>

            {/* STEP 5 */}
            <h3 className="text-lg font-semibold mb-4">
              5️⃣ Thông tin liên hệ
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="border px-3 py-2 rounded"
              />
              <input
                value={zalo}
                onChange={(e) => setZalo(e.target.value)}
                placeholder="SĐT Zalo"
                className="border px-3 py-2 rounded"
              />
            </div>

            <div className="text-center">
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-orange-500 text-white rounded-lg"
              >
                Tạo ảnh
              </button>
            </div>
          </>
        )}
      </div>

      {/* RESULT PREVIEW */}
      {resultImage && (
        <div className="max-w-5xl mx-auto mt-12 bg-white rounded-xl p-6 shadow text-center">
          <h3 className="text-lg font-semibold mb-4 text-orange-600">
            Ảnh đã tạo
          </h3>

          <div className="flex justify-center gap-4">
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
