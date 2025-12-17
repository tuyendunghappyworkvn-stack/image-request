"use client";

import { useEffect, useState } from "react";

/* ===== TYPES ===== */
type Template = {
  id: string;
  template_code: string;
  job_count: number;
  thumbnail: string;
};

type JobOption = {
  id: string;
  company: string;
  job: string;
};

type SelectedJob = {
  company: string;
  job: string;
};

export default function HomePage() {
  /* ===== STATE ===== */
  const [jobCount, setJobCount] = useState<number | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] =
    useState<Template | null>(null);

  const [jobOptions, setJobOptions] = useState<JobOption[]>([]);
  const [selectedJobs, setSelectedJobs] = useState<SelectedJob[]>([]);

  /* ===== LOAD JOB OPTIONS (FROM N8N → LARK BASE) ===== */
  useEffect(() => {
    fetch("https://n8n.happywork.com.vn/webhook/get-jobs")
      .then((res) => res.json())
      .then((data) => setJobOptions(data.jobs || []))
      .catch(console.error);
  }, []);

  /* ===== LOAD TEMPLATES BY JOB COUNT ===== */
  useEffect(() => {
    if (!jobCount) return;

    fetch(
      `https://n8n.happywork.com.vn/webhook/get-templates?job_count=${jobCount}`
    )
      .then((res) => res.json())
      .then((data) => {
        setTemplates(data.templates || []);
        setSelectedTemplate(null);
      })
      .catch(console.error);
  }, [jobCount]);

  /* ===== INIT SELECTED JOBS WHEN TEMPLATE CHANGES ===== */
  useEffect(() => {
    if (!selectedTemplate) return;

    setSelectedJobs(
      Array.from({ length: selectedTemplate.job_count }).map(() => ({
        company: "",
        job: "",
      }))
    );
  }, [selectedTemplate]);

  return (
    <div className="min-h-screen bg-orange-50 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-2xl font-bold mb-8 text-gray-900">
          Chọn mẫu ảnh & cấu hình job
        </h1>

        {/* ===== STEP 1: JOB COUNT ===== */}
        <div className="mb-8">
          <p className="font-semibold mb-3 text-gray-800">
            1️⃣ Bạn cần bao nhiêu job?
          </p>

          <div className="flex flex-wrap gap-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <button
                key={n}
                onClick={() => setJobCount(n)}
                className={`px-4 py-2 rounded border font-semibold transition ${
                  jobCount === n
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-white border-orange-500 text-orange-600 hover:bg-orange-50"
                }`}
              >
                {n} job
              </button>
            ))}
          </div>
        </div>

        {/* ===== STEP 2: TEMPLATE SELECT ===== */}
        {jobCount && (
          <div className="mb-10">
            <p className="font-semibold mb-4 text-gray-800">
              2️⃣ Chọn mẫu ({templates.length} mẫu)
            </p>

            {templates.length === 0 && (
              <p className="text-gray-500">Chưa có mẫu cho số job này</p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl)}
                  className={`cursor-pointer rounded-lg border p-2 bg-white transition ${
                    selectedTemplate?.id === tpl.id
                      ? "ring-2 ring-orange-500"
                      : "hover:shadow"
                  }`}
                >
                  <div className="aspect-square bg-gray-100 flex items-center justify-center rounded">
                    <img
                      src={tpl.thumbnail}
                      alt={tpl.template_code}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>

                  <div className="mt-2 text-center text-sm font-medium text-gray-700">
                    {tpl.template_code}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== STEP 3: JOB CONFIG ===== */}
        {selectedTemplate && (
          <div>
            <p className="font-semibold mb-4 text-gray-800">
              3️⃣ Chọn thông tin {selectedTemplate.job_count} job
            </p>

            <div className="space-y-4">
              {selectedJobs.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {/* COMPANY */}
                  <select
                    value={item.company}
                    onChange={(e) => {
                      const next = [...selectedJobs];
                      next[idx] = { company: e.target.value, job: "" };
                      setSelectedJobs(next);
                    }}
                    className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    <option value="">Chọn công ty</option>
                    {[...new Set(jobOptions.map((j) => j.company))].map(
                      (company) => (
                        <option key={company} value={company}>
                          {company}
                        </option>
                      )
                    )}
                  </select>

                  {/* JOB */}
                  <select
                    value={item.job}
                    onChange={(e) => {
                      const next = [...selectedJobs];
                      next[idx].job = e.target.value;
                      setSelectedJobs(next);
                    }}
                    className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    <option value="">Chọn công việc</option>
                    {jobOptions
                      .filter((j) => j.company === item.company)
                      .map((j) => (
                        <option key={j.id} value={j.job}>
                          {j.job}
                        </option>
                      ))}
                  </select>
                </div>
              ))}
            </div>

            <button className="mt-6 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition">
              Gửi yêu cầu
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
