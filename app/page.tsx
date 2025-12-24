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

type JobInput = {
  company_name: string;
  position_name: string;
};

export default function HomePage() {
  const [jobCount, setJobCount] = useState<number | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);

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
    useState<Record<string, string[]>>({});

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
     HOVER HANDLERS
  ====================== */
  function handleMouseEnter(
    e: React.MouseEvent,
    thumbnail: string
  ) {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);

    const { clientX, clientY } = e;

    hoverTimer.current = setTimeout(() => {
      setMousePos({
        x: clientX + 24,
        y: clientY + 24,
      });
      setHoverImage(thumbnail);
    }, 200);
  }

  function handleMouseMove(e: React.MouseEvent) {
    setMousePos({
      x: e.clientX + 24,
      y: e.clientY + 24,
    });
  }

  function handleMouseLeave() {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
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

    if (!email || !zalo) {
      alert("Vui lòng nhập email và số Zalo");
      return;
    }

    const payload = {
      job_count: jobCount,
      template_code: selectedTemplate.template_code,
      jobs: jobs.map((j) => ({
        company: j.company_name,
        position: j.position_name,
      })),
      contact: {
        email,
        zalo,
      },
    };

    try {
      const res = await fetch(
        "https://n8n.happywork.com.vn/webhook-test/tao-list-job",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

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
                className={`px-4 py-2 rounded border font-medium transition
                  ${
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

          {loading && <div>Đang tải mẫu...</div>}

          {!loading && templates.length === 0 && jobCount && (
            <div className="text-gray-500">
              Chưa có mẫu cho số job này
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {templates.map((tpl) => {
              const isActive =
                selectedTemplate?.template_code ===
                tpl.template_code;

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
                  style={{
                    border: isActive
                      ? "2px solid #f97316"
                      : "2px solid #e5e7eb",
                    boxShadow: isActive
                      ? "0 8px 20px rgba(249,115,22,0.25)"
                      : "none",
                    background: isActive ? "#fff7ed" : "#fff",
                    borderRadius: 12,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    position: "relative",
                  }}
                >
                  <img
                    src={tpl.thumbnail}
                    alt={tpl.template_code}
                    className="w-full h-40 object-contain bg-gray-50 rounded"
                  />

                  <div className="p-2 text-center font-medium">
                    {tpl.template_code}
                  </div>

                  {isActive && (
                    <div
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        background: "#f97316",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        fontWeight: 600,
                      }}
                    >
                      ✓
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* STEP 3 + 4 + SUBMIT */}
        {selectedTemplate && (
          <div className="mt-10">
            <h3 className="text-lg font-semibold mb-4">
              3️⃣ Chọn thông tin công việc
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
                      className="border rounded px-3 py-2"
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
                      className="border rounded px-3 py-2"
                      value={job.position_name}
                      disabled={!job.company_name}
                      onChange={(e) => {
                        const newJobs = [...jobs];
                        newJobs[index].position_name =
                          e.target.value;
                        setJobs(newJobs);
                      }}
                    >
                      <option value="">Chọn công việc</option>
                      {jobOptions.map((j) => (
                        <option key={j} value={j}>
                          {j}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>

            <div className="mt-10">
              <h3 className="text-lg font-semibold mb-4">
                4️⃣ Thông tin liên hệ
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-orange-50 p-4 rounded-lg">
                <input
                  type="email"
                  placeholder="Nhập email liên hệ"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border rounded px-3 py-2"
                />

                <input
                  type="text"
                  placeholder="Nhập số Zalo"
                  value={zalo}
                  onChange={(e) => setZalo(e.target.value)}
                  className="border rounded px-3 py-2"
                />
              </div>

              {/* SUBMIT */}
              <div className="mt-8 text-center">
                <button
                  onClick={handleSubmit}
                  className="px-8 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition"
                >
                  Tạo ảnh
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PREVIEW */}
      {hoverImage && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: mousePos.x,
            top: mousePos.y - 150,
          }}
        >
          <div className="bg-white p-3 rounded shadow-2xl w-[420px] max-h-[70vh] overflow-auto">
            <img
              src={hoverImage}
              alt="Preview"
              className="w-full h-auto rounded"
            />
          </div>
        </div>
      )}
    </main>
  );
}
