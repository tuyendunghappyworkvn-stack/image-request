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

  // Load template theo số job
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
      .catch((err) => console.error(err));
  }, [jobCount]);

  return (
    <div className="min-h-screen bg-orange-50 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-2xl font-bold mb-8 text-gray-900">
          Chọn mẫu ảnh & cấu hình job
        </h1>

        {/* STEP 1 */}
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

        {/* STEP 2 */}
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

        {/* STEP 3 */}
        {selectedTemplate && (
          <div>
            <p className="font-semibold mb-4 text-gray-800">
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
                      className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                    <input
                      placeholder={`Công việc ${idx + 1}`}
                      className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                )
              )}
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
