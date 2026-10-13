"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Sparkles,
  Download,
  Copy,
  Check,
  Key,
  ExternalLink,
  Layers,
  Search,
  RefreshCw,
  Tag,
  ShieldCheck,
  Bot,
  PenTool,
  Upload,
  FileText,
  X,
  CheckSquare,
  Square,
} from "lucide-react";
import {
  PRIMARY_DIGITAL_INDICATORS,
  PRIMARY_AI_INDICATORS,
  DOMAIN_GROUPS,
  AI_STRAND_GROUPS,
  PRIMARY_EDTECH_TOOLS,
} from "@/lib/digital-competency-framework";
import { exportLessonToWord } from "@/lib/export-docx";

// PRESETS CHO LỚP 3
const GRADE3_PRESETS = [
  {
    subject: "Tin học và Công nghệ",
    lessonTitle: "Bài 1: Thông tin và sự tiếp nhận thông tin quanh em",
    duration: "1 tiết (35 phút)",
    infrastructureLevel: "Phòng máy tính",
    learningObjectives:
      "Nhận biết được thông tin thu nhận qua các giác quan; nhận biết thiết bị số hỗ trợ thu nhận thông tin (hình ảnh, âm thanh). Biết cách ngồi đúng tư thế khi dùng máy tính.",
    teacherSuggestions:
      "Sử dụng trò chơi tương tác phân loại các dạng thông tin; giới thiệu bảng thông minh hoặc robot hỗ trợ học tập.",
    integrateDigital: true,
    integrateAI: true,
    nls: ["1.1.CB1a", "4.1.CB1a", "5.1.CB1a"],
    ai: ["3.A1.1", "3.A2.1"],
  },
  {
    subject: "Tự nhiên và Xã hội",
    lessonTitle: "Bài 15: Cơ quan tiêu hóa",
    duration: "2 tiết (70 phút)",
    infrastructureLevel: "Ti vi / Màn hình tương tác",
    learningObjectives:
      "Chỉ và nói được tên các bộ phận chính của cơ quan tiêu hóa trên sơ đồ/mô hình 3D số. Nêu được chức năng chính của cơ quan tiêu hóa và hình thành thói quen ăn uống lành mạnh.",
    teacherSuggestions:
      "Trình chiếu video mô phỏng 3D dạ dày và đường tiêu hóa; cho học sinh tương tác ghép nối các bộ phận trên màn hình ti vi thông minh.",
    integrateDigital: true,
    integrateAI: true,
    nls: ["1.1.CB1b", "2.1.CB1a"],
    ai: ["3.A1.2", "3.A3.1"],
  },
  {
    subject: "Toán",
    lessonTitle: "Bài 28: Bảng nhân 7, Bảng chia 7",
    duration: "1 tiết (35 phút)",
    infrastructureLevel: "Máy chiếu của giáo viên",
    learningObjectives:
      "Thành lập và ghi nhớ Bảng nhân 7, Bảng chia 7; vận dụng tính nhẩm và giải bài toán thực tế liên quan.",
    teacherSuggestions:
      "Tổ chức trò chơi Wordwall/Quizizz tiếp sức đua xe tính nhẩm; gợi ý học sinh nhận biết máy móc/AI tính toán tự động nhưng con người cần rèn luyện tư duy độc lập.",
    integrateDigital: true,
    integrateAI: true,
    nls: ["2.1.CB1a", "5.2.CB1b"],
    ai: ["3.A1.3", "3.A3.2"],
  },
  {
    subject: "Tiếng Việt",
    lessonTitle: "Bài đọc: Cổng trường mở ra",
    duration: "2 tiết (70 phút)",
    infrastructureLevel: "Ti vi / Màn hình tương tác",
    learningObjectives:
      "Đọc đúng, diễn cảm bài văn; hiểu tâm trạng của người mẹ trước ngày khai trường của con. Biết chia sẻ tình cảm yêu thương gia đình.",
    teacherSuggestions:
      "Chiếu tranh ảnh/video ngày khai trường xưa và nay; hướng dẫn học sinh tạo câu chúc tặng mẹ trên bảng tương tác Padlet.",
    integrateDigital: true,
    integrateAI: false,
    nls: ["1.1.CB1b", "3.1.CB1b"],
    ai: [],
  },
  {
    subject: "Đạo đức",
    lessonTitle: "Bài 4: Tôn trọng sự khác biệt của người khác",
    duration: "1 tiết (35 phút)",
    infrastructureLevel: "Ti vi / Màn hình tương tác",
    learningObjectives:
      "Nhận biết được mỗi người có đặc điểm, sở thích khác nhau; biết thể hiện thái độ tôn trọng sự khác biệt trong lớp học và trên môi trường mạng.",
    teacherSuggestions:
      "Thảo luận về ứng xử văn minh và không dùng công nghệ, AI để trêu chọc hay làm tổn thương bạn bè.",
    integrateDigital: true,
    integrateAI: true,
    nls: ["2.5.CB1a", "4.3.CB1a"],
    ai: ["3.B3.1", "3.B2.1"],
  },
];

export default function HomePage() {
  // Input states
  const [subject, setSubject] = useState("Tin học và Công nghệ");
  const [grade] = useState("Lớp 3");
  const [lessonTitle, setLessonTitle] = useState("");
  const [duration, setDuration] = useState("1 tiết (35 phút)");
  const [infrastructureLevel, setInfrastructureLevel] = useState(
    "Ti vi / Màn hình tương tác"
  );
  const [learningObjectives, setLearningObjectives] = useState("");
  const [teacherSuggestions, setTeacherSuggestions] = useState("");

  // Integration checkboxes
  const [integrateDigital, setIntegrateDigital] = useState(true);
  const [integrateAI, setIntegrateAI] = useState(true);

  // Selected indicator codes
  const [selectedNLS, setSelectedNLS] = useState<string[]>([]);
  const [selectedAI, setSelectedAI] = useState<string[]>([]);

  // Modals for indicator selection
  const [showNLSModal, setShowNLSModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);

  // File upload state
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadedPlanContent, setUploadedPlanContent] = useState("");
  const [isReadingFile, setIsReadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // API Key & Modals
  const [apiKey, setApiKey] = useState("");
  const [showKeyModal, setShowKeyModal] = useState(false);

  // Output & Loading states
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [generatedPlan, setGeneratedPlan] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Tabs (4 tabs)
  const [activeTab, setActiveTab] = useState<"result" | "nls" | "ai" | "tools">(
    "result"
  );

  // Search & Filters in Tabs
  const [searchNLS, setSearchNLS] = useState("");
  const [selectedNLSDomain, setSelectedNLSDomain] = useState<number | "all">(
    "all"
  );
  const [searchAI, setSearchAI] = useState("");
  const [selectedAIStrand, setSelectedAIStrand] = useState<string | "all">(
    "all"
  );
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

  // Preset click handler
  const handleApplyPreset = (preset: (typeof GRADE3_PRESETS)[0]) => {
    setSubject(preset.subject);
    setLessonTitle(preset.lessonTitle);
    setDuration(preset.duration);
    setInfrastructureLevel(preset.infrastructureLevel);
    setLearningObjectives(preset.learningObjectives);
    setTeacherSuggestions(preset.teacherSuggestions);
    setIntegrateDigital(preset.integrateDigital);
    setIntegrateAI(preset.integrateAI);
    setSelectedNLS(preset.nls);
    setSelectedAI(preset.ai);
  };

  // Toggle selection for NLS
  const toggleNLS = (code: string) => {
    setSelectedNLS((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  // Toggle selection for AI
  const toggleAI = (code: string) => {
    setSelectedAI((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  // File upload handler (.docx, .txt, .md)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setIsReadingFile(true);
    setErrorMsg("");

    try {
      if (file.name.endsWith(".docx")) {
        const arrayBuffer = await file.arrayBuffer();
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ arrayBuffer });
        const text = result.value.trim();
        setUploadedPlanContent(text);
        if (!lessonTitle) {
          setLessonTitle(file.name.replace(/\.docx$/i, ""));
        }
      } else {
        const text = await file.text();
        setUploadedPlanContent(text.trim());
        if (!lessonTitle) {
          setLessonTitle(file.name.replace(/\.(txt|md)$/i, ""));
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Không thể đọc file. Vui lòng thử lại với file .docx hoặc .txt");
    } finally {
      setIsReadingFile(false);
    }
  };

  const handleRemoveUploadedFile = () => {
    setUploadedFileName("");
    setUploadedPlanContent("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Submit generate
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!lessonTitle.trim()) {
      setErrorMsg("Vui lòng nhập Tên bài dạy (hoặc tải file Kế hoạch bài dạy).");
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
          grade: "Lớp 3",
          lessonTitle,
          duration,
          learningObjectives,
          infrastructureLevel,
          integrateDigital,
          integrateAI,
          selectedNLS,
          selectedAI,
          teacherSuggestions,
          uploadedPlanContent,
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
        grade: "Lớp 3",
        content: generatedPlan,
      });
    } catch (err) {
      console.error(err);
      alert("Không thể xuất file Word. Vui lòng thử lại.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  // Filtered lists for Tab 2 and Tab 3
  const filteredNLS = useMemo(() => {
    return PRIMARY_DIGITAL_INDICATORS.filter((i) => {
      const matchDomain =
        selectedNLSDomain === "all" || i.domainId === selectedNLSDomain;
      const matchQuery =
        i.code.toLowerCase().includes(searchNLS.toLowerCase()) ||
        i.description.toLowerCase().includes(searchNLS.toLowerCase()) ||
        i.domainName.toLowerCase().includes(searchNLS.toLowerCase());
      return matchDomain && matchQuery;
    });
  }, [searchNLS, selectedNLSDomain]);

  const filteredAI = useMemo(() => {
    return PRIMARY_AI_INDICATORS.filter((i) => {
      const matchStrand =
        selectedAIStrand === "all" || i.strandId === selectedAIStrand;
      const matchQuery =
        i.code.toLowerCase().includes(searchAI.toLowerCase()) ||
        i.description.toLowerCase().includes(searchAI.toLowerCase()) ||
        i.strandName.toLowerCase().includes(searchAI.toLowerCase());
      return matchStrand && matchQuery;
    });
  }, [searchAI, selectedAIStrand]);

  const loadingMessages = [
    "Đang phân tích bài học theo Chương trình GDPT 2018 Lớp 3...",
    "Tích hợp các mã chỉ báo NLS (PL CV 3456) & AI (PL CV 2422)...",
    "Thiết kế 4 hoạt động bài học phân tách: Hoạt động GV & Hoạt động HS...",
    "Hoàn thiện Kế hoạch bài dạy chuẩn Công văn 2345/BGDĐT-GDTH...",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* 1. HEADER */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Bên trái: Biểu tượng Cây bút + Tên ứng dụng */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-orange-500/20">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-700 bg-clip-text text-transparent">
                  Giáo Viên Số Tiểu Học Ninh Phước
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold bg-orange-100 text-orange-800 rounded-full border border-orange-200">
                  .app
                </span>
                <span className="hidden sm:inline px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full border border-blue-200">
                  CV 2345
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Tích hợp Năng lực số &amp; Trí tuệ nhân tạo AI Lớp 3
              </p>
            </div>
          </div>

          {/* Bên phải: Nút Cài API Key (vàng) & Nút Link lấy API Key (đỏ) */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Nút Cài API Key (màu vàng) */}
            <button
              onClick={() => setShowKeyModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-amber-400 hover:bg-amber-500 text-amber-950 shadow-sm transition active:scale-[0.98]"
              title="Cài đặt Google Gemini API Key"
            >
              <Key className="w-4 h-4 text-amber-900" />
              <span>{apiKey ? "Đã có API Key" : "Cài API Key"}</span>
            </button>

            {/* Nút Link lấy API Key (màu đỏ) */}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-sm transition active:scale-[0.98]"
              title="Mở trang lấy mã API Key của tài khoản Google"
            >
              <span>Link lấy API Key</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* MODAL CÀI ĐẶT API KEY */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <Key className="w-5 h-5 text-amber-600" />
                <span>Cài đặt Gemini API Key</span>
              </h3>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Dán mã Google Gemini API Key của bạn vào đây. Khóa sẽ được lưu an toàn trên trình duyệt của máy bạn:
            </p>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
            />
            <div className="text-xs text-slate-600 space-y-1.5 mb-5 bg-amber-50 p-3.5 rounded-xl border border-amber-200">
              <p className="font-semibold text-amber-900">Cách lấy khóa miễn phí:</p>
              <p>1. Bấm nút màu đỏ <strong>&quot;Link lấy API Key&quot;</strong> hoặc truy cập <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-blue-600 underline">aistudio.google.com/app/apikey</a></p>
              <p>2. Đăng nhập Google &gt; Bấm &quot;Create API key&quot;</p>
              <p>3. Sao chép và dán vào ô trên, sau đó bấm &quot;Lưu khóa API&quot;.</p>
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
                className="px-4 py-2 text-sm bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold rounded-lg"
              >
                Lưu khóa API
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CHỌN MÃ CHỈ BÁO NĂNG LỰC SỐ (52 mã) */}
      {showNLSModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-orange-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Chọn mã chỉ báo Năng lực số Lớp 3 (PL CV 3456)
                </h3>
              </div>
              <span className="text-xs px-2.5 py-1 bg-orange-100 text-orange-800 font-bold rounded-full">
                Đã chọn: {selectedNLS.length} mã
              </span>
            </div>

            <p className="text-xs text-slate-500 my-2">
              Nhấn 1 lần để chọn, nhấn lần 2 để bỏ chọn. Sau khi chọn xong bấm nút <strong>&quot;Xác nhận&quot;</strong>.
            </p>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 my-2">
              {PRIMARY_DIGITAL_INDICATORS.map((item) => {
                const isSelected = selectedNLS.includes(item.code);
                return (
                  <div
                    key={item.code}
                    onClick={() => toggleNLS(item.code)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-start space-x-3 select-none ${
                      isSelected
                        ? "border-orange-500 bg-orange-50/70 text-orange-950 shadow-sm"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-orange-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-0.5">
                        <span className="font-mono font-bold px-1.5 py-0.5 bg-orange-100 text-orange-800 rounded text-[11px]">
                          {item.code}
                        </span>
                        <span className="text-slate-500 text-[11px]">
                          {item.domainName}
                        </span>
                      </div>
                      <p className="leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedNLS([])}
                className="text-xs text-red-600 hover:underline"
              >
                Xóa tất cả lựa chọn
              </button>
              <button
                type="button"
                onClick={() => setShowNLSModal(false)}
                className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-lg shadow-sm"
              >
                Xác nhận ({selectedNLS.length} mã)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CHỌN MÃ CHỈ BÁO AI (32 mã) */}
      {showAIModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Chọn mã chỉ báo Trí tuệ nhân tạo AI Lớp 3 (PL CV 2422)
                </h3>
              </div>
              <span className="text-xs px-2.5 py-1 bg-indigo-100 text-indigo-800 font-bold rounded-full">
                Đã chọn: {selectedAI.length} mã
              </span>
            </div>

            <p className="text-xs text-slate-500 my-2">
              Nhấn 1 lần để chọn, nhấn lần 2 để bỏ chọn. Sau khi chọn xong bấm nút <strong>&quot;Xác nhận&quot;</strong>.
            </p>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 my-2">
              {PRIMARY_AI_INDICATORS.map((item) => {
                const isSelected = selectedAI.includes(item.code);
                return (
                  <div
                    key={item.code}
                    onClick={() => toggleAI(item.code)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-start space-x-3 select-none ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-50/70 text-indigo-950 shadow-sm"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-0.5">
                        <span className="font-mono font-bold px-1.5 py-0.5 bg-indigo-100 text-indigo-800 rounded text-[11px]">
                          {item.code}
                        </span>
                        <span className="text-slate-500 text-[11px]">
                          {item.strandName}
                        </span>
                      </div>
                      <p className="leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedAI([])}
                className="text-xs text-red-600 hover:underline"
              >
                Xóa tất cả lựa chọn
              </button>
              <button
                type="button"
                onClick={() => setShowAIModal(false)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm"
              >
                Xác nhận ({selectedAI.length} mã)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* PRESETS & HERO BANNER */}
        <div className="mb-8 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-orange-50 text-orange-800 rounded-full text-xs font-semibold mb-3 border border-orange-200">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>Kế hoạch bài dạy chuẩn Công văn 2345/BGDĐT-GDTH</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Tích hợp <span className="text-orange-600">Năng lực số</span> và{" "}
            <span className="text-indigo-600">Trí tuệ nhân tạo AI Lớp 3</span> vào Giáo án
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Tự động tích hợp 52 mã chỉ báo NLS (PL CV 3456) &amp; 32 mã chỉ báo AI (PL CV 2422),
            phân tách 2 cột: <strong>Hoạt động của giáo viên</strong> &amp; <strong>Hoạt động của học sinh</strong>.
          </p>
        </div>

        {/* PRESET CHIPS */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-orange-600" />
            <span>Chọn nhanh bài học mẫu Lớp 3:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {GRADE3_PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="text-xs bg-white border border-slate-200 hover:border-orange-400 hover:bg-orange-50/50 text-slate-700 px-3 py-1.5 rounded-lg transition text-left shadow-sm"
              >
                <span className="font-semibold text-orange-600">{p.subject}:</span>{" "}
                {p.lessonTitle}
              </button>
            ))}
          </div>
        </div>

        {/* GRID LAYOUT: INPUT FORM & OUTPUT/TABS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* 3. INPUT FORM (CỘT BÊN TRÁI - 5 COLUMNS) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <PenTool className="w-5 h-5 text-orange-600" />
              <span>Thông tin bài dạy Lớp 3</span>
            </h2>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleGenerate} className="space-y-4">
              {/* 1. Môn học */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  1. Môn học Tiểu học (Lớp 3)
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                >
                  <option>Tin học và Công nghệ</option>
                  <option>Tiếng Việt</option>
                  <option>Toán</option>
                  <option>Tự nhiên và Xã hội</option>
                  <option>Đạo đức</option>
                  <option>Hoạt động trải nghiệm</option>
                  <option>Âm nhạc</option>
                  <option>Mĩ thuật</option>
                  <option>Giáo dục thể chất</option>
                </select>
              </div>

              {/* 2. Tải KHBD cần tích hợp */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  2. Tải KHBD cần tích hợp (File Word .docx hoặc .txt)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".docx,.txt,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="khbd-upload"
                />
                {!uploadedFileName ? (
                  <label
                    htmlFor="khbd-upload"
                    className="flex items-center justify-center space-x-2 w-full p-2.5 border-2 border-dashed border-slate-300 hover:border-orange-500 rounded-xl text-xs text-slate-600 hover:text-orange-600 cursor-pointer bg-slate-50/50 hover:bg-orange-50/30 transition"
                  >
                    <Upload className="w-4 h-4" />
                    <span>
                      {isReadingFile
                        ? "Đang đọc file..."
                        : "Bấm để chọn file KHBD từ máy tính"}
                    </span>
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                    <div className="flex items-center space-x-2 truncate">
                      <FileText className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="font-semibold truncate">{uploadedFileName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveUploadedFile}
                      className="text-slate-400 hover:text-red-500 p-1"
                      title="Gỡ file này"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Tên bài dạy */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên bài dạy <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Bài 15: Cơ quan tiêu hóa"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* 3. Đồ dùng & Thiết bị hiện có của lớp */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  3. Đồ dùng &amp; Thiết bị hiện có của lớp
                </label>
                <select
                  value={infrastructureLevel}
                  onChange={(e) => setInfrastructureLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option>Ti vi / Màn hình tương tác</option>
                  <option>Máy chiếu của giáo viên</option>
                  <option>Phòng máy tính</option>
                  <option>Chỉ có bảng lớp và tranh ảnh</option>
                </select>
              </div>

              {/* 4. Nội dung tích hợp (Tích chọn 1 hoặc cả 2) */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  4. Nội dung tích hợp:
                </label>
                <div className="flex items-center space-x-6">
                  <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={integrateDigital}
                      onChange={(e) => setIntegrateDigital(e.target.checked)}
                      className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                    />
                    <span>Năng lực số</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={integrateAI}
                      onChange={(e) => setIntegrateAI(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <span>Trí tuệ nhân tạo AI</span>
                  </label>
                </div>
              </div>

              {/* 5. Mã chỉ báo tích hợp Năng lực số (nếu có) */}
              {integrateDigital && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      5. Mã chỉ báo tích hợp Năng lực số (nếu có)
                    </label>
                    <span className="text-[11px] text-orange-700 font-semibold">
                      {selectedNLS.length > 0
                        ? `Đã chọn: ${selectedNLS.length} mã`
                        : "Chưa chọn (để trống)"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowNLSModal(true)}
                      className="flex-1 py-2 px-3 text-xs bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg text-orange-900 font-medium text-left flex items-center justify-between transition"
                    >
                      <span className="truncate">
                        {selectedNLS.length > 0
                          ? selectedNLS.join(", ")
                          : "Bấm để chọn mã chỉ báo NLS..."}
                      </span>
                      <ShieldCheck className="w-4 h-4 text-orange-600 flex-shrink-0 ml-1" />
                    </button>
                    {selectedNLS.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedNLS([])}
                        className="px-2 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg"
                        title="Bỏ chọn"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* 6. Mã chỉ báo tích hợp AI (nếu có) */}
              {integrateAI && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      6. Mã chỉ báo tích hợp AI (nếu có)
                    </label>
                    <span className="text-[11px] text-indigo-700 font-semibold">
                      {selectedAI.length > 0
                        ? `Đã chọn: ${selectedAI.length} mã`
                        : "Chưa chọn (để trống)"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowAIModal(true)}
                      className="flex-1 py-2 px-3 text-xs bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-indigo-900 font-medium text-left flex items-center justify-between transition"
                    >
                      <span className="truncate">
                        {selectedAI.length > 0
                          ? selectedAI.join(", ")
                          : "Bấm để chọn mã chỉ báo AI..."}
                      </span>
                      <Bot className="w-4 h-4 text-indigo-600 flex-shrink-0 ml-1" />
                    </button>
                    {selectedAI.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedAI([])}
                        className="px-2 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg"
                        title="Bỏ chọn"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* 7. Gợi ý hoạt động tích hợp (nếu có) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  7. Gợi ý hoạt động tích hợp (nếu có)
                </label>
                <textarea
                  rows={2}
                  placeholder="Mô tả ý tưởng tích hợp của bạn (ví dụ: Tổ chức trò chơi Quizizz phần khởi động, cho học sinh thử nghiệm Teachable Machine phân loại quả...)"
                  value={teacherSuggestions}
                  onChange={(e) => setTeacherSuggestions(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Yêu cầu cần đạt cốt lõi (nếu không tải file) */}
              {!uploadedPlanContent && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Yêu cầu cần đạt cốt lõi (từ SGK)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ghi yêu cầu cần đạt môn học (hoặc có thể để trống nếu đã có file tải lên)..."
                    value={learningObjectives}
                    onChange={(e) => setLearningObjectives(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              )}

              {/* 8. Nút màu cam nổi bật */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-white shadow-md flex items-center justify-center space-x-2 transition ${
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

          {/* 4. CỘT BÊN PHẢI: KHUNG HIỂN THỊ & TRA CỨU (7 COLUMNS) */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[550px] flex flex-col">
            {/* THANH 4 TABS */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 mb-4 gap-2">
              <div className="flex flex-wrap gap-1">
                {/* Tab 1: Giáo án chi tiết */}
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

                {/* Tab 2: Bảng mã NLS Lớp 3 (52 mã) */}
                <button
                  type="button"
                  onClick={() => setActiveTab("nls")}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition flex items-center space-x-1 ${
                    activeTab === "nls"
                      ? "bg-orange-50 text-orange-700 border border-orange-200"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>Bảng mã NLS Lớp 3</span>
                  <span className="px-1.5 py-0.2 bg-orange-100 text-orange-800 text-[10px] rounded-full font-bold">
                    52
                  </span>
                </button>

                {/* Tab 3: Bảng mã AI Lớp 3 (32 mã) */}
                <button
                  type="button"
                  onClick={() => setActiveTab("ai")}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition flex items-center space-x-1 ${
                    activeTab === "ai"
                      ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>Bảng mã AI Lớp 3</span>
                  <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-800 text-[10px] rounded-full font-bold">
                    32
                  </span>
                </button>

                {/* Tab 4: Học liệu & EdTech */}
                <button
                  type="button"
                  onClick={() => setActiveTab("tools")}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition ${
                    activeTab === "tools"
                      ? "bg-orange-50 text-orange-700 border border-orange-200"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Học liệu &amp; EdTech
                </button>
              </div>

              {/* ACTION BUTTONS: Sao chép & Tải Word */}
              {generatedPlan && activeTab === "result" && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                    title="Sao chép toàn bộ văn bản"
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
                    title="Xuất file Word chuẩn Công văn 2345 (Bảng 2 cột)"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isExporting ? "Đang xuất..." : "Tải Word (CV 2345)"}</span>
                  </button>
                </div>
              )}
            </div>

            {/* NỘI DUNG TAB 1: GIÁO ÁN CHI TIẾT */}
            {activeTab === "result" && (
              <div className="flex-1 flex flex-col">
                {loading ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 relative mb-4">
                      <div className="w-16 h-16 rounded-full border-4 border-orange-100 border-t-orange-600 animate-spin" />
                      <Sparkles className="w-6 h-6 text-orange-600 absolute inset-0 m-auto" />
                    </div>
                    <h3 className="font-bold text-slate-800 text-base mb-1">
                      Đang xử lý Kế hoạch bài dạy Lớp 3
                    </h3>
                    <p className="text-xs text-orange-600 font-medium animate-pulse max-w-sm">
                      {loadingMessages[loadingStep]}
                    </p>
                  </div>
                ) : generatedPlan ? (
                  <div className="flex-1 overflow-y-auto max-h-[680px] pr-2 text-slate-800 text-sm leading-relaxed space-y-3 font-sans">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start space-x-2 text-emerald-800 text-xs">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong>Kế hoạch bài dạy Lớp 3 chuẩn CV 2345 đã hoàn thành!</strong> Đã tích hợp các mã chỉ báo NLS &amp; AI và phân chia 2 cột Hoạt động của GV và HS. Bấm <strong>&quot;Tải Word (CV 2345)&quot;</strong> để nhận file in ấn.
                      </div>
                    </div>
                    <pre className="whitespace-pre-wrap font-sans text-slate-800 leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-200 text-xs sm:text-sm">
                      {generatedPlan}
                    </pre>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center py-20 text-center text-slate-400">
                    <PenTool className="w-16 h-16 mb-3 stroke-1 text-slate-300" />
                    <p className="text-sm font-medium text-slate-600">
                      Chưa có nội dung Kế hoạch bài dạy
                    </p>
                    <p className="text-xs text-slate-400 max-w-sm mt-1">
                      Hãy điền thông tin bài học ở cột bên trái hoặc chọn một bài mẫu Lớp 3 có sẵn để bắt đầu.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* NỘI DUNG TAB 2: BẢNG MÃ NLS LỚP 3 (52 MÃ) */}
            {activeTab === "nls" && (
              <div className="flex-1 flex flex-col space-y-3">
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-xs text-orange-950 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-orange-700 flex-shrink-0" />
                    <span>
                      <strong>Bảng 52 mã chỉ báo Năng lực số</strong> (Phụ lục Công văn 3456/BGDĐT). Bấm <strong>&quot;Chép mã&quot;</strong> để sao chép nhanh!
                    </span>
                  </div>
                </div>

                {/* SEARCH & FILTER */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Tìm mã hoặc nội dung chỉ báo NLS..."
                      value={searchNLS}
                      onChange={(e) => setSearchNLS(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <select
                    value={selectedNLSDomain}
                    onChange={(e) =>
                      setSelectedNLSDomain(
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

                {/* LIST */}
                <div className="flex-1 overflow-y-auto max-h-[520px] pr-2 space-y-2">
                  {filteredNLS.map((item) => (
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
                        onClick={() => handleCopyCode(item.code)}
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
                </div>
              </div>
            )}

            {/* NỘI DUNG TAB 3: BẢNG MÃ AI LỚP 3 (32 MÃ) */}
            {activeTab === "ai" && (
              <div className="flex-1 flex flex-col space-y-3">
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-950 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-4 h-4 text-indigo-700 flex-shrink-0" />
                    <span>
                      <strong>Bảng 32 mã chỉ báo Trí tuệ nhân tạo (AI) Lớp 3</strong> (Phụ lục Công văn 2422/BGDĐT, từ <code>3.A1.1</code> đến <code>3.D2.3</code>).
                    </span>
                  </div>
                </div>

                {/* SEARCH & FILTER */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Tìm mã hoặc nội dung chỉ báo AI..."
                      value={searchAI}
                      onChange={(e) => setSearchAI(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <select
                    value={selectedAIStrand}
                    onChange={(e) => setSelectedAIStrand(e.target.value)}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">Tất cả 4 Mạch nội dung chính</option>
                    <option value="A">Mạch A: Ứng dụng AI trong học tập &amp; trường học</option>
                    <option value="B">Mạch B: Đạo đức, sự thật &amp; trách nhiệm</option>
                    <option value="C">Mạch C: Dữ liệu, logic &amp; Học máy</option>
                    <option value="D">Mạch D: Huấn luyện AI &amp; Chất lượng dữ liệu</option>
                  </select>
                </div>

                {/* LIST */}
                <div className="flex-1 overflow-y-auto max-h-[520px] pr-2 space-y-2">
                  {filteredAI.map((item) => (
                    <div
                      key={item.code}
                      className="p-3 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm transition flex items-start justify-between gap-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-mono font-bold text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded border border-indigo-200">
                            {item.code}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {item.strandName}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopyCode(item.code)}
                        className="px-2 py-1 text-[11px] font-medium text-slate-600 bg-slate-100 hover:bg-indigo-100 hover:text-indigo-800 rounded transition flex items-center space-x-1 flex-shrink-0"
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
                </div>
              </div>
            )}

            {/* NỘI DUNG TAB 4: HỌC LIỆU & EDTECH */}
            {activeTab === "tools" && (
              <div className="flex-1 overflow-y-auto max-h-[650px] pr-2 space-y-3">
                <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-700">
                  Học liệu số &amp; Công cụ EdTech / AI phù hợp lứa tuổi học sinh Tiểu học:
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
            <strong>Giáo Viên Số Tiểu Học Ninh Phước</strong> — Chuẩn hóa Kế hoạch bài dạy theo <strong>Công văn 2345/BGDĐT-GDTH</strong>, Bảng chỉ báo NLS (PL CV 3456) &amp; Bảng chỉ báo AI Lớp 3 (PL CV 2422).
          </div>
          <div>
            Deploy sẵn sàng trên <strong>Vercel</strong> với tên miền <code>*.vercel.app</code>
          </div>
        </div>
      </footer>
    </div>
  );
}
