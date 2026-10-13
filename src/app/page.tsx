"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Sparkles,
  BookOpen,
  Download,
  Copy,
  Check,
  Key,
  GraduationCap,
  CheckCircle2,
  ExternalLink,
  Layers,
  Search,
  RefreshCw,
  Tag,
  ShieldCheck,
} from "lucide-react";
import {
  PRIMARY_DIGITAL_INDICATORS,
  DOMAIN_GROUPS,
  PRIMARY_EDTECH_TOOLS,
} from "@/lib/digital-competency-framework";
import { exportLessonToWord } from "@/lib/export-docx";

const PRIMARY_PRESET_LESSONS = [
  {
    subject: "Toán",
    grade: "Lớp 1",
    lessonTitle: "Các số 1, 2, 3",
    duration: "1 tiết (35 phút)",
    infrastructureLevel: "Ti vi / Màn hình tương tác của lớp",
    learningObjectives:
      "Nhận biết được số lượng các nhóm đồ vật từ 1 đến 3. Đọc, viết được các chữ số 1, 2, 3. Tương tác với trò chơi đếm đồ vật trực quan trên màn hình.",
  },
  {
    subject: "Tiếng Việt",
    grade: "Lớp 1",
    lessonTitle: "Bài 1: A, a (Làm quen với âm chữ a)",
    duration: "2 tiết (70 phút)",
    infrastructureLevel: "Máy chiếu/Ti vi kết nối mạng Internet",
    learningObjectives:
      "Nhận biết và phát âm đúng âm a, chữ a. Nhận biết được tiếng có âm a qua tranh ảnh số sinh động và video bài hát chữ cái.",
  },
  {
    subject: "Tự nhiên và Xã hội",
    grade: "Lớp 2",
    lessonTitle: "Nghề nghiệp của người lớn trong gia đình",
    duration: "1 tiết (35 phút)",
    infrastructureLevel: "Ti vi thông minh / Máy chiếu của giáo viên",
    learningObjectives:
      "Kể được tên và ý nghĩa một số nghề nghiệp của người lớn qua tranh ảnh, video ngắn. Thể hiện sự tôn trọng người lao động qua thảo luận nhóm.",
  },
  {
    subject: "Toán",
    grade: "Lớp 2",
    lessonTitle: "Phép cộng (có nhớ) trong phạm vi 100",
    duration: "1 tiết (35 phút)",
    infrastructureLevel: "Máy chiếu + Bảng con học sinh",
    learningObjectives:
      "Thực hiện được phép cộng có nhớ trong phạm vi 100 dạng 26 + 5. Tham gia trò chơi tương tác tiếp sức trực tuyến trên Wordwall/PowerPoint để củng cố kỹ năng tính.",
  },
  {
    subject: "Tin học và Công nghệ",
    grade: "Lớp 3",
    lessonTitle: "Thông tin và sự tiếp nhận thông tin quanh em",
    duration: "1 tiết (35 phút)",
    infrastructureLevel: "Phòng máy tính của trường tiểu học",
    learningObjectives:
      "Nhận biết được thông tin thu nhận qua các giác quan; nhận biết thiết bị số hỗ trợ thu nhận thông tin (hình ảnh, âm thanh). Biết cách ngồi đúng tư thế khi dùng máy tính.",
  },
  {
    subject: "Tự nhiên và Xã hội",
    grade: "Lớp 3",
    lessonTitle: "Cơ quan tiêu hóa",
    duration: "2 tiết (70 phút)",
    infrastructureLevel: "Màn hình tương tác / Ti vi thông minh",
    learningObjectives:
      "Chỉ và nói được tên các bộ phận của cơ quan tiêu hóa trên sơ đồ/mô hình 3D số. Nêu được chức năng chính của cơ quan tiêu hóa và hình thành thói quen ăn uống lành mạnh.",
  },
];

export default function PrimaryLessonPage() {
  const [subject, setSubject] = useState("Toán");
  const [grade, setGrade] = useState("Lớp 1");
  const [lessonTitle, setLessonTitle] = useState("");
  const [duration, setDuration] = useState("1 tiết (35 phút)");
  const [infrastructureLevel, setInfrastructureLevel] = useState(
    "Ti vi / Màn hình tương tác của lớp"
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

  // Search in Framework tab
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<number | "all">("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const savedKey = localStorage.getItem("gemini_api_key");
    if (savedKey) setApiKey(savedKey);
  }, []);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem("gemini_api_key", key);
    setShowKeyModal(false);
  };

  const handleApplyPreset = (preset: (typeof PRIMARY_PRESET_LESSONS)[0]) => {
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

  const handleCopyIndicator = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  // Filtered indicators in Framework tab
  const filteredIndicators = useMemo(() => {
    return PRIMARY_DIGITAL_INDICATORS.filter((item) => {
      const matchDomain = selectedDomain === "all" || item.domainId === selectedDomain;
      const matchQuery =
        item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.domainName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchDomain && matchQuery;
    });
  }, [searchQuery, selectedDomain]);

  const loadingMessages = [
    "Đang phân tích yêu cầu cần đạt theo chuẩn Tiểu học (GDPT 2018)...",
    "Đối chiếu và gắn mã chỉ báo NLS Lớp 1-3 (Phụ lục CV 3456)...",
    "Thiết kế 4 hoạt động phân định: Hoạt động của GV & Hoạt động của HS...",
    "Hoàn tất Kế hoạch bài dạy chuẩn Công văn 2345/BGDĐT-GDTH...",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-orange-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-700 bg-clip-text text-transparent">
                  Giáo Viên Số Tiểu Học
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold bg-orange-100 text-orange-800 rounded-full border border-orange-200">
                  .app
                </span>
                <span className="hidden sm:inline px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full border border-blue-200">
                  CV 2345/GDTH
                </span>
                <span className="hidden md:inline px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                  Mã NLS Lớp 1-3
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Hỗ trợ giáo viên Tiểu học tích hợp Năng lực số vào Kế hoạch bài dạy
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
              <span>Vercel Deploy</span>
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
                <Key className="w-5 h-5 text-orange-600" />
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
              Nhập mã API Key miễn phí từ Google AI Studio để kích hoạt tính năng soạn giáo án tiểu học:
            </p>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
            />
            <div className="text-xs text-slate-500 space-y-1 mb-5 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <p className="font-semibold text-slate-700">Cách lấy khóa miễn phí:</p>
              <p>1. Truy cập <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-orange-600 underline">aistudio.google.com</a></p>
              <p>2. Đăng nhập Google &gt; Bấm &quot;Get API key&quot;</p>
              <p>3. Dán mã khóa vào ô trên và bấm &quot;Lưu khóa API&quot;</p>
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
                className="px-4 py-2 text-sm bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700"
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
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-orange-50 text-orange-800 rounded-full text-xs font-semibold mb-3 border border-orange-200">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>Chuẩn hóa Kế hoạch bài dạy Cấp Tiểu học (Công văn 2345/BGDĐT-GDTH)</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Tích hợp <span className="text-orange-600">Năng lực số Lớp 1, 2, 3</span> vào Giáo án
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Tự động gắn mã chỉ báo NLS (ví dụ: <code>[1.1.CB1a]</code>, <code>[2.1.CB1a]</code>, <code>[4.3.CB1a]</code>, <code>[6.3.CB1a]</code>) 
            và phân tách rõ ràng <strong>Hoạt động của giáo viên</strong> & <strong>Hoạt động của học sinh</strong> theo mẫu Phụ lục 3 CV 2345.
          </p>
        </div>

        {/* PRESET CHIPS */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-orange-600" />
            <span>Chọn nhanh bài học mẫu Tiểu học:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRIMARY_PRESET_LESSONS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="text-xs bg-white border border-slate-200 hover:border-orange-400 hover:bg-orange-50/50 text-slate-700 px-3 py-1.5 rounded-lg transition text-left shadow-sm"
              >
                <span className="font-semibold text-orange-600">{p.subject} {p.grade}:</span>{" "}
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
              <BookOpen className="w-5 h-5 text-orange-600" />
              <span>Thông tin bài dạy (CV 2345)</span>
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
                    Môn học Tiểu học
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option>Tiếng Việt</option>
                    <option>Toán</option>
                    <option>Tự nhiên và Xã hội</option>
                    <option>Đạo đức</option>
                    <option>Tin học và Công nghệ</option>
                    <option>Hoạt động trải nghiệm</option>
                    <option>Âm nhạc</option>
                    <option>Mĩ thuật</option>
                    <option>Giáo dục thể chất</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Khối lớp
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option>Lớp 1</option>
                    <option>Lớp 2</option>
                    <option>Lớp 3</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên bài dạy <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Bài 5: Các số 1, 2, 3"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option>1 tiết (35 phút)</option>
                    <option>2 tiết (70 phút)</option>
                    <option>3 tiết (105 phút)</option>
                    <option>Chủ đề trải nghiệm</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Đồ dùng & Thiết bị
                  </label>
                  <select
                    value={infrastructureLevel}
                    onChange={(e) => setInfrastructureLevel(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option>Ti vi / Màn hình tương tác của lớp</option>
                    <option>Máy chiếu của giáo viên</option>
                    <option>Phòng máy tính tiểu học</option>
                    <option>Học sinh có thiết bị theo nhóm</option>
                    <option>Chỉ có tranh ảnh và bảng lớp</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Yêu cầu cần đạt cốt lõi <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Ghi yêu cầu cần đạt môn học (hoặc chuẩn kiến thức kĩ năng). Hệ thống sẽ tự động ghép mã chỉ báo NLS tương thích (1.1.CB1a, 2.1.CB1a, 4.3.CB1a...)..."
                  value={learningObjectives}
                  onChange={(e) => setLearningObjectives(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-xl font-semibold text-white shadow-md flex items-center justify-center space-x-2 transition ${
                  loading
                    ? "bg-orange-400 cursor-not-allowed"
                    : "bg-orange-600 hover:bg-orange-700 shadow-orange-500/25 active:scale-[0.99]"
                }`}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Đang khởi tạo theo CV 2345...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Soạn Kế Hoạch Bài Dạy Chuẩn CV 2345</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* OUTPUT & PREVIEW (7 COLUMNS) */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[500px] flex flex-col">
            {/* TABS HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 mb-4 gap-2">
              <div className="flex space-x-1 sm:space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("result")}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition ${
                    activeTab === "result"
                      ? "bg-orange-50 text-orange-700 border border-orange-200"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Giáo án chi tiết
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("framework")}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition flex items-center space-x-1 ${
                    activeTab === "framework"
                      ? "bg-orange-50 text-orange-700 border border-orange-200"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>Bảng mã NLS Lớp 1-3</span>
                  <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] rounded-full font-bold">
                    {PRIMARY_DIGITAL_INDICATORS.length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("tools")}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition ${
                    activeTab === "tools"
                      ? "bg-orange-50 text-orange-700 border border-orange-200"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Học liệu & EdTech
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
                    title="Xuất file Word chuẩn Công văn 2345"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isExporting ? "Đang xuất..." : "Tải Word (CV 2345)"}</span>
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
                      <div className="w-16 h-16 rounded-full border-4 border-orange-100 border-t-orange-600 animate-spin" />
                      <Sparkles className="w-6 h-6 text-orange-600 absolute inset-0 m-auto" />
                    </div>
                    <h3 className="font-bold text-slate-800 text-base mb-1">
                      Đang xử lý theo chuẩn Công văn 2345
                    </h3>
                    <p className="text-xs text-orange-600 font-medium animate-pulse max-w-sm">
                      {loadingMessages[loadingStep]}
                    </p>
                  </div>
                ) : generatedPlan ? (
                  <div className="flex-1 overflow-y-auto max-h-[650px] pr-2 text-slate-800 text-sm leading-relaxed space-y-3 font-sans">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start space-x-2 text-emerald-800 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong>Kế hoạch bài dạy Tiểu học chuẩn CV 2345 đã hoàn thành!</strong> Đã tích hợp mã chỉ báo NLS (Lớp 1-3) và phân chia rõ ràng Hoạt động của GV & HS. Bấm <strong>&quot;Tải Word (CV 2345)&quot;</strong> để nhận file in ấn.
                      </div>
                    </div>
                    <pre className="whitespace-pre-wrap font-sans text-slate-800 leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-200 text-xs sm:text-sm">
                      {generatedPlan}
                    </pre>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center py-16 text-center text-slate-400">
                    <GraduationCap className="w-16 h-16 mb-3 stroke-1 text-slate-300" />
                    <p className="text-sm font-medium text-slate-600">
                      Chưa có nội dung Kế hoạch bài dạy
                    </p>
                    <p className="text-xs text-slate-400 max-w-sm mt-1">
                      Hãy điền thông tin bài học ở cột bên trái hoặc chọn một bài mẫu Tiểu học để bắt đầu.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: BẢNG MÃ CHỈ BÁO NLS LỚP 1-3 */}
            {activeTab === "framework" && (
              <div className="flex-1 flex flex-col space-y-3">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-amber-700 flex-shrink-0" />
                    <span>
                      <strong>Bảng chỉ báo NLS Lớp 1-3</strong> (Phụ lục Công văn 3456/BGDĐT). Bấm vào mã để sao chép nhanh!
                    </span>
                  </div>
                </div>

                {/* SEARCH & DOMAIN FILTER */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Tìm mã hoặc nội dung chỉ báo..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <select
                    value={selectedDomain}
                    onChange={(e) =>
                      setSelectedDomain(
                        e.target.value === "all" ? "all" : Number(e.target.value)
                      )
                    }
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">Tất cả 6 Miền năng lực</option>
                    <option value={1}>Miền 1: Thông tin và dữ liệu</option>
                    <option value={2}>Miền 2: Giao tiếp và hợp tác</option>
                    <option value={3}>Miền 3: Sáng tạo nội dung số</option>
                    <option value={4}>Miền 4: An toàn số</option>
                    <option value={5}>Miền 5: Giải quyết vấn đề</option>
                    <option value={6}>Miền 6: Trí tuệ nhân tạo (AI)</option>
                  </select>
                </div>

                {/* INDICATORS LIST */}
                <div className="flex-1 overflow-y-auto max-h-[520px] pr-2 space-y-2">
                  {filteredIndicators.map((item) => (
                    <div
                      key={item.code}
                      className="p-3 rounded-xl border border-slate-200 bg-white hover:border-orange-300 hover:shadow-sm transition flex items-start justify-between gap-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-mono font-bold text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded border border-orange-200">
                            {item.code}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {item.domainName}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopyIndicator(item.code)}
                        className="px-2 py-1 text-[11px] font-medium text-slate-600 bg-slate-100 hover:bg-orange-100 hover:text-orange-800 rounded transition flex items-center space-x-1 flex-shrink-0"
                        title="Sao chép mã này"
                      >
                        {copiedCode === item.code ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700">Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Tag className="w-3 h-3" />
                            <span>Chép mã</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}

                  {filteredIndicators.length === 0 && (
                    <div className="text-center py-8 text-xs text-slate-400">
                      Không tìm thấy chỉ báo nào khớp với từ khóa tìm kiếm.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: HỌC LIỆU & EDTECH */}
            {activeTab === "tools" && (
              <div className="flex-1 overflow-y-auto max-h-[650px] pr-2 space-y-3">
                <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-700">
                  Học liệu số & Phần mềm tương tác phù hợp với tâm lý học sinh Tiểu học (Lớp 1, 2, 3):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PRIMARY_EDTECH_TOOLS.map((tool, idx) => (
                    <a
                      key={idx}
                      href={tool.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-orange-400 hover:shadow-sm transition flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-900 text-sm group-hover:text-orange-600">
                            {tool.name}
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-600" />
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
            <strong>Giáo Viên Số Tiểu Học .App</strong> — Chuẩn hóa Kế hoạch bài dạy theo <strong>Công văn 2345/BGDĐT-GDTH</strong> & Bảng chỉ báo NLS Lớp 1-3.
          </div>
          <div>
            Deploy sẵn sàng trên <strong>Vercel</strong> với tên miền <code>*.vercel.app</code>
          </div>
        </div>
      </footer>
    </div>
  );
}
