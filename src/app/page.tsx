"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  BookOpen,
  Download,
  Copy,
  Check,
  Key,
  Laptop,
  CheckCircle2,
  ExternalLink,
  Layers,
  HelpCircle,
  RefreshCw,
} from "lucide-react";
import {
  DIGITAL_COMPETENCY_FRAMEWORK,
  POPULAR_EDTECH_TOOLS,
} from "@/lib/digital-competency-framework";
import { exportLessonToWord } from "@/lib/export-docx";

const PRESET_LESSONS = [
  {
    subject: "Toán",
    grade: "Lớp 8",
    lessonTitle: "Hình chóp tam giác đều và hình chóp tứ giác đều",
    duration: "2 tiết (90 phút)",
    infrastructureLevel: "Học sinh sử dụng thiết bị theo nhóm (Smartphone/Tablet)",
    learningObjectives:
      "Mô tả được các yếu tố: đỉnh, cạnh bên, mặt bên, mặt đáy của hình chóp tam giác đều. Tạo lập và quan sát mô hình 3D trên phần mềm GeoGebra để tính diện tích xung quanh.",
  },
  {
    subject: "Khoa học tự nhiên",
    grade: "Lớp 7",
    lessonTitle: "Tốc độ chuyển động",
    duration: "1 tiết (45 phút)",
    infrastructureLevel: "Máy chiếu của giáo viên + Học sinh thảo luận nhóm",
    learningObjectives:
      "Nêu được ý nghĩa của tốc độ, công thức tính tốc độ. Sử dụng phần mềm mô phỏng PhET để thay đổi quãng đường, thời gian và quan sát đồ thị tốc độ.",
  },
  {
    subject: "Ngữ văn",
    grade: "Lớp 10",
    lessonTitle: "Đại cáo bình Ngô (Nguyễn Trãi)",
    duration: "2 tiết (90 phút)",
    infrastructureLevel: "Phòng máy tính hoặc học sinh có thiết bị kết nối mạng",
    learningObjectives:
      "Phân tích luận đề chính nghĩa và tinh thần nhân nghĩa. Thiết kế sơ đồ tư duy bằng Canva hoặc Padlet thể hiện kết cấu và cảm hứng ngợi ca chiến thắng.",
  },
  {
    subject: "Lịch sử và Địa lí",
    grade: "Lớp 6",
    lessonTitle: "Trái Đất trong hệ Mặt Trời",
    duration: "1 tiết (45 phút)",
    infrastructureLevel: "Máy chiếu của giáo viên",
    learningObjectives:
      "Xác định vị trí Trái Đất trong hệ Mặt Trời; mô tả chuyển động tự quay của Trái Đất bằng hình ảnh/mô hình 3D trên Google Earth và video trực quan.",
  },
];

export default function HomePage() {
  const [subject, setSubject] = useState("Toán");
  const [grade, setGrade] = useState("Lớp 8");
  const [lessonTitle, setLessonTitle] = useState("");
  const [duration, setDuration] = useState("1 tiết (45 phút)");
  const [infrastructureLevel, setInfrastructureLevel] = useState(
    "Máy chiếu của giáo viên"
  );
  const [learningObjectives, setLearningObjectives] = useState("");

  const [apiKey, setApiKey] = useState("");
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [generatedPlan, setGeneratedPlan] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<"result" | "framework" | "tools">(
    "result"
  );

  useEffect(() => {
    const savedKey = localStorage.getItem("gemini_api_key");
    if (savedKey) setApiKey(savedKey);
  }, []);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem("gemini_api_key", key);
    setShowKeyModal(false);
  };

  const handleApplyPreset = (preset: (typeof PRESET_LESSONS)[0]) => {
    setSubject(preset.subject);
    setGrade(preset.grade);
    setLessonTitle(preset.lessonTitle);
    setDuration(preset.duration);
    setInfrastructureLevel(preset.infrastructureLevel);
    setLearningObjectives(preset.learningObjectives);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!lessonTitle.trim() || !learningObjectives.trim()) {
      setErrorMsg("Vui lòng điền Tên bài dạy và Yêu cầu cần đạt.");
      return;
    }

    setLoading(true);
    setGeneratedPlan("");
    setActiveTab("result");

    // Dynamic loading messages
    const timer1 = setTimeout(() => setLoadingStep(1), 3000);
    const timer2 = setTimeout(() => setLoadingStep(2), 7000);
    const timer3 = setTimeout(() => setLoadingStep(3), 12000);

    try {
      const res = await fetch("/api/generate-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          grade,
          lessonTitle,
          duration,
          learningObjectives,
          infrastructureLevel,
          apiKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể tạo giáo án");
      }

      setGeneratedPlan(data.lessonPlan);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Đã xảy ra lỗi";
      setErrorMsg(msg);
      if (msg.includes("API Key")) {
        setShowKeyModal(true);
      }
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setLoading(false);
      setLoadingStep(0);
    }
  };

  const handleCopy = () => {
    if (!generatedPlan) return;
    navigator.clipboard.writeText(generatedPlan);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportDocx = async () => {
    if (!generatedPlan) return;
    setIsExporting(true);
    try {
      await exportLessonToWord({
        lessonTitle,
        subject,
        grade,
        content: generatedPlan,
      });
    } catch (err) {
      console.error(err);
      alert("Không thể xuất file Word. Vui lòng thử lại.");
    } finally {
      setIsExporting(false);
    }
  };

  const loadingMessages = [
    "Đang phân tích yêu cầu cần đạt của bài học...",
    "Đối chiếu với Khung năng lực số (DigComp 2.2 & Bộ GD&ĐT)...",
    "Gợi ý thiết bị, phần mềm EdTech và thiết kế 4 hoạt động chuẩn CV 5512...",
    "Hoàn thiện văn phong sư phạm và định dạng giáo án...",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-blue-500/20">
              G
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-800 bg-clip-text text-transparent">
                  Giáo Viên Số
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full border border-blue-200">
                  .app
                </span>
                <span className="hidden sm:inline px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full">
                  CV 5512
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Tích hợp Năng lực số vào Kế hoạch bài dạy
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => setShowKeyModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 transition"
              title="Cài đặt Gemini API Key"
            >
              <Key className="w-4 h-4 text-amber-500" />
              <span>{apiKey ? "Đã có API Key" : "Cài API Key"}</span>
            </button>

            <a
              href="https://vercel.com"
              target="_blank"
              rel="noreferrer"
              className="hidden md:flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-black text-white hover:bg-slate-800 transition"
            >
              <span>Vercel Deploy Ready</span>
            </a>
          </div>
        </div>
      </header>

      {/* API KEY MODAL */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <Key className="w-5 h-5 text-blue-600" />
                <span>Cấu hình Gemini API Key</span>
              </h3>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                Đóng ✕
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Nhập API Key miễn phí từ Google AI Studio để kích hoạt tính năng sinh
              giáo án thông minh.
            </p>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <div className="text-xs text-slate-500 space-y-1 mb-5 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <p className="font-semibold text-slate-700">Cách lấy khóa miễn phí:</p>
              <p>1. Truy cập <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-blue-600 underline">aistudio.google.com</a></p>
              <p>2. Đăng nhập Google &gt; Nhấn &quot;Get API key&quot;</p>
              <p>3. Dán mã khóa vào ô trên và bấm &quot;Lưu khóa&quot;</p>
              <p className="text-emerald-600 pt-1">
                * Khi triển khai lên Vercel, bạn có thể thiết lập biến môi trường <code>GEMINI_API_KEY</code> để không cần nhập lại.
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                onClick={() => handleSaveApiKey(apiKey)}
                className="px-4 py-2 text-sm bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
              >
                Lưu khóa API
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* HERO BANNER */}
        <div className="mb-8 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold mb-3 border border-blue-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Chuyển đổi số Sư phạm theo Chương trình GDPT 2018</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Tích hợp <span className="text-blue-600">Năng lực số</span> vào Kế hoạch bài dạy
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Tự động gợi ý mục tiêu năng lực số (NLS), công cụ EdTech (GeoGebra, PhET, Padlet, Canva...)
            và 4 hoạt động bài học chuẩn mực theo <strong>Công văn 5512/BGDĐT-GDTrH</strong>.
          </p>
        </div>

        {/* PRESET CHIPS */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>Chọn mẫu bài học thử nghiệm nhanh:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_LESSONS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="text-xs bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-slate-700 px-3 py-1.5 rounded-lg transition text-left shadow-sm"
              >
                <span className="font-semibold text-blue-600">{p.subject} {p.grade}:</span>{" "}
                {p.lessonTitle}
              </button>
            ))}
          </div>
        </div>

        {/* GRID LAYOUT: FORM & OUTPUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* INPUT FORM (5 COLUMNS) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>Thông tin Kế hoạch bài dạy</span>
            </h2>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Môn học
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Toán</option>
                    <option>Ngữ văn</option>
                    <option>Khoa học tự nhiên</option>
                    <option>Vật lí</option>
                    <option>Hóa học</option>
                    <option>Sinh học</option>
                    <option>Lịch sử và Địa lí</option>
                    <option>Tin học</option>
                    <option>Tiếng Anh</option>
                    <option>Giáo dục công dân</option>
                    <option>Công nghệ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Khối lớp
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Lớp 6</option>
                    <option>Lớp 7</option>
                    <option>Lớp 8</option>
                    <option>Lớp 9</option>
                    <option>Lớp 10</option>
                    <option>Lớp 11</option>
                    <option>Lớp 12</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên bài dạy / Bài học <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Định luật bảo toàn khối lượng"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Thời lượng
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>1 tiết (45 phút)</option>
                    <option>2 tiết (90 phút)</option>
                    <option>3 tiết (135 phút)</option>
                    <option>Chủ đề dạy học / Dự án</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Điều kiện thiết bị
                  </label>
                  <select
                    value={infrastructureLevel}
                    onChange={(e) => setInfrastructureLevel(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Máy chiếu của giáo viên</option>
                    <option>Học sinh dùng thiết bị theo nhóm</option>
                    <option>Phòng máy tính / Mỗi HS 1 thiết bị</option>
                    <option>Lớp học không có Internet</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Yêu cầu cần đạt / Mục tiêu cốt lõi <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Ghi các yêu cầu cần đạt theo chương trình môn học. AI sẽ tự động phân tích và thêm các chỉ số năng lực số tương thích..."
                  value={learningObjectives}
                  onChange={(e) => setLearningObjectives(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-xl font-semibold text-white shadow-md flex items-center justify-center space-x-2 transition ${
                  loading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/25 active:scale-[0.99]"
                }`}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Đang khởi tạo bài giảng...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Sinh Giáo Án Tích Hợp Năng Lực Số</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* OUTPUT & PREVIEW (7 COLUMNS) */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[500px] flex flex-col">
            {/* TABS HEADER */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div className="flex space-x-1 sm:space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("result")}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition ${
                    activeTab === "result"
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Giáo án chi tiết
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("framework")}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition ${
                    activeTab === "framework"
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Khung Năng lực số
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("tools")}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition ${
                    activeTab === "tools"
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Ngân hàng EdTech
                </button>
              </div>

              {/* ACTION BUTTONS (IF RESULT PRESENT) */}
              {generatedPlan && activeTab === "result" && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                    title="Sao chép nội dung"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Sao chép</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleExportDocx}
                    disabled={isExporting}
                    className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition disabled:opacity-50"
                    title="Xuất ra file Word (.docx) chuẩn CV 5512"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isExporting ? "Đang xuất..." : "Tải Word (.docx)"}</span>
                  </button>
                </div>
              )}
            </div>

            {/* TAB CONTENT: RESULT */}
            {activeTab === "result" && (
              <div className="flex-1 flex flex-col">
                {loading ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 relative mb-4">
                      <div className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
                      <Sparkles className="w-6 h-6 text-blue-600 absolute inset-0 m-auto" />
                    </div>
                    <h3 className="font-bold text-slate-800 text-base mb-1">
                      Đang xử lý tích hợp năng lực số
                    </h3>
                    <p className="text-xs text-blue-600 font-medium animate-pulse max-w-sm">
                      {loadingMessages[loadingStep]}
                    </p>
                  </div>
                ) : generatedPlan ? (
                  <div className="flex-1 overflow-y-auto max-h-[650px] pr-2 text-slate-800 text-sm leading-relaxed space-y-3 font-sans">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start space-x-2 text-emerald-800 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong>Kế hoạch bài dạy đã sẵn sàng!</strong> Bạn có thể kiểm tra nội dung bên dưới hoặc bấm nút <strong>&quot;Tải Word (.docx)&quot;</strong> để nhận file văn bản chuẩn thể thức 5512.
                      </div>
                    </div>
                    <pre className="whitespace-pre-wrap font-sans text-slate-800 leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-200 text-xs sm:text-sm">
                      {generatedPlan}
                    </pre>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center py-16 text-center text-slate-400">
                    <Laptop className="w-16 h-16 mb-3 stroke-1 text-slate-300" />
                    <p className="text-sm font-medium text-slate-600">
                      Chưa có nội dung giáo án
                    </p>
                    <p className="text-xs text-slate-400 max-w-sm mt-1">
                      Hãy điền thông tin bài học ở cột bên trái hoặc bấm chọn một trong các bài mẫu có sẵn để bắt đầu.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: KHUNG NĂNG LỰC SỐ */}
            {activeTab === "framework" && (
              <div className="flex-1 overflow-y-auto max-h-[650px] pr-2 space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800">
                  Khung đối chiếu 5 miền năng lực số cốt lõi cho học sinh phổ thông theo định hướng Bộ GD&ĐT & Khung DigComp 2.2:
                </div>
                {DIGITAL_COMPETENCY_FRAMEWORK.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white transition"
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="px-2 py-0.5 text-xs font-bold bg-blue-600 text-white rounded">
                        {item.code}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {item.name}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 mb-2">{item.description}</p>
                    <ul className="text-xs text-slate-700 list-disc list-inside space-y-1">
                      {item.indicators.map((ind, i) => (
                        <li key={i}>{ind}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* TAB CONTENT: NGÂN HÀNG CÔNG CỤ EDTECH */}
            {activeTab === "tools" && (
              <div className="flex-1 overflow-y-auto max-h-[650px] pr-2 space-y-3">
                <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-700">
                  Các công cụ số giáo dục thông dụng được tích hợp tự động vào tiến trình bài dạy:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {POPULAR_EDTECH_TOOLS.map((tool, idx) => (
                    <a
                      key={idx}
                      href={tool.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-sm transition flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-900 text-sm group-hover:text-blue-600">
                            {tool.name}
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                        </div>
                        <p className="text-xs text-slate-500">{tool.category}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>Giáo Viên Số .App</strong> — Dự án mã nguồn mở hỗ trợ giáo viên Việt Nam đổi mới phương pháp giảng dạy.
          </div>
          <div>
            Sẵn sàng triển khai trên <strong>Vercel</strong> với tên miền <code>*.vercel.app</code>
          </div>
        </div>
      </footer>
    </div>
  );
}
