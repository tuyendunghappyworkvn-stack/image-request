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
  code: string; // 👈 MÃ ẨN
};

type JobInput = {
  company_name: string;
  position_name: string;
  job_code?: string; // 👈 MÃ ẨN TRONG STATE
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
     CONTACT INFO
  ====================== */
  const [email, setEmail] = useState("");
  const [zalo, setZalo] = useState("");

  // 👉 CHỌN TEMPLATE
  const [selectedTemplate, setSelectedTemplate] =
    useState<Template | null>(null);

  /* =====================
     JOB INPUT
  ====================== */
  const [jobs, setJobs] = useState<JobInput[]>([]);

  /* =====================
     OPTIONS FROM LARK
  ====================== */
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [jobsByCompany, setJobsByCompany] =
    useState<Record<string, JobOption[]>>({});

  /* =====================
     PREVIEW STATE
  ====================== */
  const [hoverImage, setHoverImage] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);

  /* =====================
     LOAD TEMPLATE BY JOB
  ====================== */
  useEffect(() => {
    if (!jobCount) return;

    setLoading(true);
    setTemplates([]);
    setSelectedTemplate(null);
    setJobs([]);

    fetch(`/api/templates?job_count=${jobCount}`)
      .then((res) => res.json())
      .then((data) => {
        setTemplates(data.data || []);
      })
      .catch(() => {
        setTemplates([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [jobCount]);

  /* =====================
     LOAD OPTIONS FROM LARK
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
     HOVER HANDLERS
  ====================== */
  function handleMouseEnter(
    e: React.MouseEvent,
    thumbnail: string
  ) {
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
     SUBMIT TO N8N
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
        job_code: j.job_code, // 👈 GỬI MÃ NGẦM
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

      alert("✅ Đã gửi yêu cầu tạo ảnh, hệ thống đang xử lý!");
    } catch (err) {
      console.error(err);
      alert("❌ Gửi dữ liệu thất bại, vui lòng thử lại");
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
                className={`px-4 py-2 rounded border font-medium transition ${
                  jobCount === n
                    ? "bg-orange-500 text-white border-orange-500"
                    : "border-orange-400 text-orange-500 hover:bg-orange-50"
                }`}
              >
                {n} job
              </button>
            ))}
          </div>
        </div>

        {/* STEP 2 */}
        <div>
          <div className="font-semibold mb-3">
            2️⃣ Chọn mẫu ({templates.length} mẫu)
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {templates.map((tpl) => {
              const isActive =
                selectedTemplate?.template_code === tpl.template_code;

              return (
                <div
                  key={tpl.template_code}
                  onClick={() => {
                    setSelectedTemplate(tpl);
                    if (jobCount) {
                      setJobs(
                        Array.from({ length: jobCount }, () => ({
                          company_name: "",
                          position_name: "",
                        }))
                      );
                    }
                  }}
                  onMouseEnter={(e) =>
                    handleMouseEnter(e, tpl.thumbnail)
                  }
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  className={`border rounded-xl cursor-pointer transition ${
                    isActive
                      ? "border-orange-500 bg-orange-50 shadow-lg"
                      : "border-gray-200"
                  }`}
                >
                  <img
                    src={tpl.thumbnail}
                    className="w-full h-40 object-contain bg-gray-50 rounded"
                  />
                  <div className="p-2 text-center font-medium">
                    {tpl.template_code}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* STEP 3 */}
        {selectedTemplate && (
          <div className="mt-10">
            <h3 className="text-lg font-semibold mb-4">
              3️⃣ Tiêu đề ảnh
            </h3>

            <div className="bg-orange-50 p-4 rounded-lg">
              <input
                value={imageTitle}
                onChange={(e) => setImageTitle(e.target.value)}
                placeholder="VD: IDEA POD"
                className="w-full border rounded px-4 py-3 bg-white"
              />
            </div>

            <h3 className="text-lg font-semibold mb-4 mt-8">
              4️⃣ Chọn thông tin công việc
            </h3>

            <div className="space-y-3">
              {jobs.map((job, index) => {
                const jobOptions =
                  jobsByCompany[job.company_name] || [];

                return (
                  <div
                    key={index}
                    className="grid grid-cols-2 gap-4 bg-orange-50 p-4 rounded-lg"
                  >
                    <select
                      value={job.company_name}
                      className="border rounded px-3 py-2"
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
                      disabled={!job.company_name}
                      className="border rounded px-3 py-2"
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
            </div>

            <div className="mt-10">
              <h3 className="text-lg font-semibold mb-4">
                5️⃣ Thông tin liên hệ
              </h3>

              <div className="grid grid-cols-2 gap-4 bg-orange-50 p-4 rounded-lg">
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="border rounded px-3 py-2"
                />
                <input
                  value={zalo}
                  onChange={(e) => setZalo(e.target.value)}
                  placeholder="Zalo"
                  className="border rounded px-3 py-2"
                />
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={handleSubmit}
                  className="px-8 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600"
                >
                  Tạo ảnh
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

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
