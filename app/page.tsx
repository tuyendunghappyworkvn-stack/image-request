"use client";

import { useEffect, useState } from "react";

type Template = {
  template_code: string;
  style: string;
  thumbnail: string;
};

export default function HomePage() {
  const [jobCount, setJobCount] = useState<number | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<Template | null>(null);

  useEffect(() => {
    if (!jobCount) return;

    setLoading(true);
    setTemplates([]);
    setSelectedTemplate(null);

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
                  onClick={() => setSelectedTemplate(tpl)}
                  className={`relative border rounded-lg cursor-pointer transition group
                    ${
                      isSelected
                        ? "border-orange-500 ring-2 ring-orange-300"
                        : "hover:shadow"
                    }`}
                >
                  {/* Thumbnail: hiển thị FULL, không cắt */}
                  <img
                    src={tpl.thumbnail}
                    alt={tpl.template_code}
                    className="w-full h-40 object-contain bg-gray-50 rounded"
                  />

                  <div className="p-2 text-center font-medium">
                    {tpl.template_code}
                  </div>

                  {/* HOVER: xem ảnh FULL TO */}
                  <div
                    className="absolute left-1/2 top-0 z-50 hidden 
                               -translate-x-1/2 -translate-y-full 
                               group-hover:block"
                  >
                    <div
                      className="bg-white p-3 rounded shadow-2xl
                                 w-[80vw] max-w-[900px]
                                 max-h-[90vh] overflow-auto"
                    >
                      <img
                        src={tpl.thumbnail}
                        alt="Preview full"
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedTemplate && (
            <div className="mt-6 text-right">
              <button className="bg-orange-500 text-white px-6 py-2 rounded font-semibold hover:bg-orange-600">
                Tiếp tục
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
