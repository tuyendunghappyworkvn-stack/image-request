"use client";

import { useEffect, useState } from "react";

type Template = {
  id: string;
  template_code: string;
  job_count: number;
  thumbnail: string;
};

export default function HomePage() {
  const [jobCount, setJobCount] = useState<number | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );

  // fetch templates khi chọn job_count
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
      .catch((err) => {
        console.error("Fetch templates error", err);
      });
  }, [jobCount]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          Chọn mẫu ảnh & cấu hình job
        </h1>

        {/* STEP 1: CHỌN SỐ JOB */}
        <div className="mb-8">
          <p className="font-semibold mb-3">1️⃣ Bạn cần bao nhiêu job?</p>
          <div className="flex gap-3">
            {[2, 4, 6].map((n) => (
              <button
                key={n}
                onClick={() => setJobCount(n)}
                className={`px-5 py-2 rounded border ${
                  jobCount === n
                    ? "bg-black text-white"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                {n} job
              </button>
            ))}
          </div>
        </div>

        {/* STEP 2: CHỌN ẢNH MẪU */}
        {jobCount && (
          <div className="mb-10">
            <p className="font-semibold mb-3">
              2️⃣ Chọn mẫu ({templates.length} mẫu)
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl)}
                  className={`cursor-pointer rounded border p-2 bg-white ${
                    selectedTemplate?.id === tpl.id
                      ? "ring-2 ring-black"
                      : ""
                  }`}
                >
                  <div className="w-full aspect-square bg-gray-100 flex items-center justify-center">
                    <img
                      src={tpl.thumbnail}
                      alt={tpl.template_code}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>

                  <div className="mt-2 text-center text-sm">
                    {tpl.template_code}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: FORM JOB */}
        {selectedTemplate && (
          <div className="bg-white rounded border p-6">
            <p className="font-semibold mb-4">
              3️⃣ Nhập thông tin {selectedTemplate.job_count} job
            </p>

            <div className="space-y-4">
              {Array.from({ length: selectedTemplate.job_count }).map(
                (_, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <input
                      placeholder={`Công ty ${idx + 1}`}
                      className="border rounded px-3 py-2"
                    />
                    <input
                      placeholder={`Công việc ${idx + 1}`}
                      className="border rounded px-3 py-2"
                    />
                  </div>
                )
              )}
            </div>

            <button className="mt-6 px-6 py-2 bg-black text-white rounded">
              Gửi yêu cầu
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
