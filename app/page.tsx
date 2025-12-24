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

  // Gọi API n8n khi chọn jobCount
  useEffect(() => {
    if (!jobCount) return;

    setLoading(true);

    useEffect(() => {
  if (!jobCount) return;

  setLoading(true);

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
                className={`px-4 py-2 rounded border font-medium
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
            {templates.map((tpl) => (
              <div
                key={tpl.template_code}
                className="border rounded-lg overflow-hidden hover:shadow cursor-pointer"
              >
                <img
                  src={tpl.thumbnail}
                  alt={tpl.template_code}
                  className="w-full h-40 object-cover"
                />
                <div className="p-2 text-center font-medium">
                  {tpl.template_code}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
