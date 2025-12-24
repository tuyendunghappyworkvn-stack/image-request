"use client";

import { useEffect, useRef, useState } from "react";

type Template = {
  template_code: string;
  style: string;
  thumbnail: string;
};

type Option = {
  id: string;
  name: string;
};

type JobInput = {
  company_id: string;
  company_name: string;
  position_id: string;
  position_name: string;
};

export default function HomePage() {
  const [jobCount, setJobCount] = useState<number | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<Template | null>(null);

  /* =====================
     JOB INPUT
  ====================== */
  const [jobs, setJobs] = useState<JobInput[]>([]);

  /* =====================
     OPTIONS FROM LARK
  ====================== */
  const [companies, setCompanies] = useState<Option[]>([]);
  const [positions, setPositions] = useState<Option[]>([]);

  /* =====================
     PREVIEW STATE (FIX DUPLICATE)
  ====================== */
  const [hoverImage, setHoverImage] = useState<string | null>(null);
  const [hoverKey, setHoverKey] = useState<string | null>(null);
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
        setPositions(data.positions || []);
      });
  }, []);

  /* =====================
     HOVER HANDLERS (ANTI 2 IMAGE BUG)
  ====================== */
  function handleMouseEnter(
    templateCode: string,
    thumbnail: string
  ) {
    // clear hover cũ ngay
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }

    setHoverKey(templateCode);

    hoverTimer.current = setTimeout(() => {
      setHoverImage(thumbnail);
    }, 200);
  }

  function handleMouseLeave(templateCode: string) {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }

    setHoverKey((prev) => {
      if (prev === templateCode) {
        setHoverImage(null);
        return null;
      }
      return prev;
    });
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
              const isSelected =
                selectedTemplate?.template_code === tpl.template_code;

              return (
                <div
                  key={tpl.template_code}
                  onClick={() => {
                    setSelectedTemplate(tpl);
                    if (jobCount) {
                      setJobs(
                        Array.from({ length: jobCount }, () => ({
                          company_id: "",
                          company_name: "",
                          position_id: "",
                          position_name: "",
                        }))
                      );
                    }
                  }}
                  onMouseEnter={() =>
                    handleMouseEnter(
                      tpl.template_code,
                      tpl.thumbnail
                    )
                  }
                  onMouseLeave={() =>
                    handleMouseLeave(tpl.template_code)
                  }
                  className={`border rounded-lg cursor-pointer transition
                    ${
                      isSelected
                        ? "border-orange-500 ring-2 ring-orange-300"
                        : "hover:shadow"
                    }`}
                >
                  <img
                    src={tpl.thumbnail}
                    alt={tpl.template_code}
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

        {/* STEP 3 – JOB FORM */}
        {selectedTemplate && (
          <div className="mt-10">
            <h3 className="text-lg font-semibold mb-4">
              3️⃣ Chọn thông tin công việc
            </h3>

            <div className="space-y-3">
              {jobs.map((job, index) => (
                <div
                  key={index}
                  className="grid grid-cols-2 gap-4 bg-orange-50 p-4 rounded-lg"
                >
                  <select
                    className="border rounded px-3 py-2"
                    value={job.company_id}
                    onChange={(e) => {
                      const c = companies.find(
                        (c) => c.id === e.target.value
                      );
                      const newJobs = [...jobs];
                      newJobs[index].company_id = c?.id || "";
                      newJobs[index].company_name = c?.name || "";
                      setJobs(newJobs);
                    }}
                  >
                    <option value="">Chọn công ty</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  <select
                    className="border rounded px-3 py-2"
                    value={job.position_id}
                    onChange={(e) => {
                      const p = positions.find(
                        (p) => p.id === e.target.value
                      );
                      const newJobs = [...jobs];
                      newJobs[index].position_id = p?.id || "";
                      newJobs[index].position_name = p?.name || "";
                      setJobs(newJobs);
                    }}
                  >
                    <option value="">Chọn công việc</option>
                    {positions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* PREVIEW – BÊN PHẢI, GIỮA MÀN, CHỈ 1 ẢNH */}
      {hoverImage && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            right: "32px",
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          <div className="bg-white p-3 rounded shadow-2xl
                          w-[70vw] max-w-[900px]
                          max-h-[85vh] overflow-auto">
            <img
              src={hoverImage}
              alt="Preview full"
              className="w-full h-auto"
            />
          </div>
        </div>
      )}
    </main>
  );
}
