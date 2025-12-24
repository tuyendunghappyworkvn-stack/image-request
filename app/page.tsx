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
     PREVIEW STATE (THEO CHUỘT)
  ====================== */
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
        setPositions(data.positions || []);
      });
  }, []);

  /* =====================
     HOVER HANDLERS (200ms)
  ====================== */
  function handleMouseEnter(
    e: React.MouseEvent,
    thumbnail: string
  ) {
    const { clientX, clientY } = e;

    if (hoverTimer.current) clearTimeout(hoverTimer.current);

    hoverTimer.current = setTimeout(() => {
      setMousePos({
        x: clientX + 20,
        y: clientY + 20,
      });
      setHoverImage(thumbnail);
    }, 200);
  }

  function handleMouseMove(e: React.MouseEvent) {
    setMousePos({
      x: e.clientX + 20,
      y: e.clientY + 20,
    });
  }

  function handleMouseLeave() {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
    setHoverImage(null);
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
                  onMouseEnter={(e) =>
                    handleMouseEnter(e, tpl.thumbnail)
                  }
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
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
      </div>

      {/* PREVIEW – ĐI THEO CHUỘT */}
      {hoverImage && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: mousePos.x,
            top: mousePos.y,
          }}
        >
          <div
            className="bg-white p-2 rounded shadow-2xl
                       w-[280px] md:w-[320px]
                       max-h-[65vh] overflow-auto"
          >
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
