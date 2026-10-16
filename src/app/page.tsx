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
  ArrowLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";
import {
  PRIMARY_DIGITAL_INDICATORS,
  PRIMARY_AI_INDICATORS,
  DOMAIN_GROUPS,
  AI_STRAND_GROUPS,
  PRIMARY_EDTECH_TOOLS,
} from "@/lib/digital-competency-framework";
import saveAs from "file-saver";


interface PreviewStep {
  gv: string;
  hs: string;
}

interface PreviewActivity {
  title: string;
  steps: PreviewStep[];
}

interface ModelInfo {
  id: string;
  name: string;
  displayName: string;
  description: string;
  supportedGenerationMethods: string[];
  inputTokenLimit: number;
  outputTokenLimit: number;
  isFlash: boolean;
  isPro: boolean;
}

function normalizeActor(line: string, actor: "GV" | "HS"): string {
  let s = (line || "").trim();
  if (!s) return "";

  // Xử lý lỗi khoảng trắng đôi và dấu chấm đôi '..'
  s = s.replace(/[ \t]+/g, " ");
  s = s.replace(/\.{4,}/g, "...").replace(/(?<!\.)\.\.(?!\.)/g, ".");

  // Lưu rồi xóa ký hiệu '-' / '+' đầu câu (kể cả lặp: '- -', '+ -', '- +')
  const markerMatch = s.match(/^[-+\s]+/);
  let marker = "";
  if (markerMatch && /[-+]/.test(markerMatch[0])) {
    marker = markerMatch[0].includes("-") ? "-" : "+";
    s = s.replace(/^[-+\s]+/, "");
  }

  const who = actor === "HS" ? "(?:HS|học sinh|các em)" : "(?:GV|giáo viên)";
  const sep = "[-:.,–\\s]+";
  const bare = new RegExp(`^${who}(?:${sep}|$)`, "iu");
  const counted = new RegExp(`^(?:một số|vài|\\d+\\s*[-–]\\s*\\d+|\\d+)\\s*${who}(?:${sep}|$)`, "iu");

  let prev;
  do {
    prev = s;
    s = s.replace(counted, "").replace(bare, "").trim();
    s = s.replace(/^[-:.,–\s]+/, "").trim();
  } while (s !== prev);

  return `${marker ? marker + " " : ""}${actor} ${s}`.trim();
}

function ensureDash(text: string, actor?: "GV" | "HS"): string {
  let t = (text || "").trim();
  if (!t) return "";
  if (actor) {
    t = normalizeActor(t, actor);
  }
  if (t.startsWith("-")) return t;
  return `- ${t}`;
}

function formatLessonTitle(raw: string): string {
  let s = (raw || "").trim();
  if (!s) return "BÀI: …";

  // Xóa mọi từ "Bài" / "BÀI" bị lặp ở đầu chuỗi (ví dụ: "Bài", "Bài Bài", "BÀI Bài", "BÀI BÀI")
  s = s.replace(/^(?:bài\s*)+/i, "").trim();

  if (s.startsWith(":")) {
    const rest = s.replace(/^:\s*/, "").trim();
    return rest ? `BÀI: ${rest.toUpperCase()}` : "BÀI: …";
  }
  if (/^\d+/.test(s)) {
    return `BÀI ${s.toUpperCase()}`.trim();
  }
  return `BÀI: ${s.toUpperCase()}`.trim();
}

function parsePlanForPreview(rawPlan: string) {
  const lines = rawPlan.split("\n");
  const beforeSectionIII: string[] = [];
  const afterSectionIII: string[] = [];
  const activities: PreviewActivity[] = [];
  let inIII = false;
  let inIV = false;
  let currentAct: PreviewActivity | null = null;
  let currentActHsQueue: string[] = [];

  const finalizeActivity = () => {
    if (!currentAct) return;
    if (currentActHsQueue.length > 0) {
      let q = 0;
      for (const st of currentAct.steps) {
        if (!st.hs && q < currentActHsQueue.length) {
          st.hs = currentActHsQueue[q++];
        }
      }
      // Nếu có thêm bước HS mà hết bước GV
      while (q < currentActHsQueue.length) {
        currentAct.steps.push({ gv: "", hs: currentActHsQueue[q++] });
      }
    }
    activities.push(currentAct);
    currentAct = null;
    currentActHsQueue = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (/^III\.\s*CÁC HOẠT ĐỘNG/i.test(line)) {
      inIII = true;
      inIV = false;
      continue;
    }

    if (/^IV\.\s*ĐIỀU CHỈNH/i.test(line)) {
      finalizeActivity();
      inIII = false;
      inIV = true;
      afterSectionIII.push(line);
      continue;
    }

    if (inIV) {
      afterSectionIII.push(line);
      continue;
    }

    if (inIII) {
      // Bỏ qua dòng tiêu đề bảng nếu có
      if (/^Hoạt động của (?:giáo viên|học sinh)/i.test(line)) {
        continue;
      }

      // Phát hiện tiêu đề hoạt động: 1. Khởi động..., 2. Khám phá...
      if (/^(?:[1-4]\.|\d+\.)\s*(?:Khởi động|Khám phá|Luyện tập|Vận dụng)/i.test(line)) {
        finalizeActivity();
        const normalizedTitle = line
          .replace(/Luyện\s*tập\s*thực\s*hành/gi, "Luyện tập, thực hành")
          .replace(/Vận\s*dụng\s*trải\s*nghiệm/gi, "Vận dụng, trải nghiệm");
        currentAct = { title: normalizedTitle, steps: [] };
        continue;
      }

      const isAiHeader = /^\*?\s*Tích hợp AI/i.test(line);
      if (isAiHeader) {
        if (currentAct) {
          currentAct.steps.push({ gv: line, hs: "" });
        }
        continue;
      }

      const isGV =
        /^(?:[-+•]\s*)?GV\b/i.test(line) ||
        /^[-+•]?\s*Hoạt động của giáo viên/i.test(line);
      const isHS =
        /^(?:[-+•]\s*)?HS\b/i.test(line) ||
        /^[-+•]?\s*Hoạt động của học sinh/i.test(line);

      if (isGV) {
        if (currentAct) {
          const lastStep = currentAct.steps[currentAct.steps.length - 1];
          if (lastStep && /^\*?\s*Tích hợp AI/i.test(lastStep.gv)) {
            lastStep.gv += "\n" + line;
          } else {
            currentAct.steps.push({ gv: line, hs: "" });
          }
        }
      } else if (isHS) {
        currentActHsQueue.push(line);
      } else if (currentAct && currentAct.steps.length > 0) {
        const lastStep = currentAct.steps[currentAct.steps.length - 1];
        if (lastStep && /^\*?\s*Tích hợp AI/i.test(lastStep.gv)) {
          lastStep.gv += "\n" + line;
        } else if (currentActHsQueue.length > 0) {
          currentActHsQueue[currentActHsQueue.length - 1] += "\n" + line;
        } else {
          lastStep.gv += "\n" + line;
        }
      }
      continue;
    }

    if (/^(?:bài|bai)\b/i.test(line)) {
      beforeSectionIII.push(formatLessonTitle(line));
      continue;
    }

    beforeSectionIII.push(line);
  }

  finalizeActivity();

  return { beforeSectionIII, activities, afterSectionIII };
}

export default function HomePage() {
  // Input states
  const [subject, setSubject] = useState("Tin học");
  const [grade] = useState("Lớp 3");
  const [tiet, setTiet] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [duration, setDuration] = useState("1 tiết (35 phút)");
  const [infrastructureLevel, setInfrastructureLevel] = useState(
    "Tivi/máy chiếu"
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
  const [activeNLSDomain, setActiveNLSDomain] = useState<number | null>(null);
  const [activeAIStrand, setActiveAIStrand] = useState<string | null>(null);

  // File upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadedPlanContent, setUploadedPlanContent] = useState("");
  const [isReadingFile, setIsReadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // API Key & Modals
  const [apiKey, setApiKey] = useState("");
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showKeyPassword, setShowKeyPassword] = useState(false);
  const [keySavedNotification, setKeySavedNotification] = useState(false);
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("gemini-3.5-flash");
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [modelsError, setModelsError] = useState("");

  const fetchGoogleModels = async (keyToUse?: string) => {
    const key = (keyToUse ?? apiKey).trim();
    if (!key) {
      setModelsError("Vui lòng dán mã API Key trước khi truy vấn.");
      return;
    }
    setIsLoadingModels(true);
    setModelsError("");
    try {
      const res = await fetch("/api/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: key }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể kết nối đến Google API.");
      }
      setAvailableModels(data.models || []);
    } catch (err: any) {
      setModelsError(err?.message || "Lỗi truy vấn danh sách model.");
      setAvailableModels([]);
    } finally {
      setIsLoadingModels(false);
    }
  };

  // Output & Loading states
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [generatedPlan, setGeneratedPlan] = useState("");
  const [generatedDocxBlob, setGeneratedDocxBlob] = useState<Blob | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "text">("table");
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

  const parsedPreview = useMemo(() => {
    if (!generatedPlan) return null;
    return parsePlanForPreview(generatedPlan);
  }, [generatedPlan]);

  useEffect(() => {
    const savedKey = localStorage.getItem("gemini_api_key");
    if (savedKey) {
      setApiKey(savedKey);
      fetchGoogleModels(savedKey);
    }
    const savedModel = localStorage.getItem("preferred_model");
    setSelectedModel(savedModel || "gemini-3.5-flash");
  }, []);

  const handleSaveApiKey = (key: string) => {
    const trimmed = (key || "").trim();
    setApiKey(trimmed);
    if (trimmed) {
      localStorage.setItem("gemini_api_key", trimmed);
      fetchGoogleModels(trimmed);
    } else {
      localStorage.removeItem("gemini_api_key");
      setAvailableModels([]);
    }
    localStorage.setItem("preferred_model", selectedModel || "gemini-3.5-flash");
    setKeySavedNotification(true);
    setTimeout(() => {
      setKeySavedNotification(false);
      setShowKeyModal(false);
    }, 1000);
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

  // File upload handler (.docx, .pdf, .txt, .md)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
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
      } else if (file.name.endsWith(".pdf")) {
        setUploadedPlanContent("[Tệp PDF đính kèm: " + file.name + "]");
        if (!lessonTitle) {
          setLessonTitle(file.name.replace(/\.pdf$/i, ""));
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
      setErrorMsg("Không thể đọc file. Vui lòng thử lại với file .docx, .pdf hoặc .txt");
    } finally {
      setIsReadingFile(false);
    }
  };

  const handleRemoveUploadedFile = () => {
    setUploadedFile(null);
    setUploadedFileName("");
    setUploadedPlanContent("");
    setGeneratedDocxBlob(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Submit generate qua endpoint /api/khbd
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!uploadedFile && !uploadedPlanContent.trim()) {
      setErrorMsg("Vui lòng tải lên file Kế hoạch bài dạy (.docx, .pdf hoặc .txt) cần tích hợp.");
      return;
    }

    setLoading(true);
    setGeneratedPlan("");
    setGeneratedDocxBlob(null);
    setActiveTab("result");

    const timer1 = setTimeout(() => setLoadingStep(1), 3000);
    const timer2 = setTimeout(() => setLoadingStep(2), 7000);
    const timer3 = setTimeout(() => setLoadingStep(3), 12000);

    try {
      const codes = integrateDigital
        ? selectedNLS.map((code) => {
            const found = PRIMARY_DIGITAL_INDICATORS.find((i) => i.code === code);
            return {
              ma: code,
              noi_dung: found ? found.description : "",
            };
          })
        : [];

      const aiCodes = integrateAI
        ? selectedAI.map((code) => {
            const found = PRIMARY_AI_INDICATORS.find((i) => i.code === code);
            return {
              ma: code,
              noi_dung: found ? found.description : "",
            };
          })
        : [];

      const formData = new FormData();
      if (uploadedFile) {
        formData.append("file", uploadedFile);
      } else {
        const textBlob = new Blob([uploadedPlanContent], { type: "text/plain" });
        formData.append("file", textBlob, uploadedFileName || "giao_an.txt");
      }
      formData.append("mon", subject);
      formData.append("tiet", tiet);
      formData.append("infrastructureLevel", infrastructureLevel);
      if (teacherSuggestions) formData.append("teacherSuggestions", teacherSuggestions);
      formData.append("codes", JSON.stringify(codes));
      formData.append("aiCodes", JSON.stringify(aiCodes));
      formData.append("integrateAI", String(integrateAI));
      if (apiKey) formData.append("apiKey", apiKey);
      formData.append("model", selectedModel || "gemini-3.5-flash");

      const res = await fetch("/api/khbd", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error || "Không tạo được kế hoạch bài dạy, vui lòng thử lại.");
      }

      const blob = await res.blob();
      setGeneratedDocxBlob(blob);

      // Đọc trích xuất text để hiển thị xem trước (không tự động tải file về, để giáo viên chủ động bấm nút tải)
      try {
        const mammoth = await import("mammoth");
        const arrayBuffer = await blob.arrayBuffer();
        const { value } = await mammoth.extractRawText({ arrayBuffer });
        setGeneratedPlan(value);
      } catch {
        setGeneratedPlan(
          "Kế hoạch bài dạy đã tạo thành công. Thầy/cô vui lòng bấm nút 'Tải file Word (.docx)' ở góc trên để tải file về máy tính."
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Đã xảy ra lỗi";
      setErrorMsg(msg);
      if (msg.includes("API Key") || msg.includes("API key")) {
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

  const handleExportDocx = () => {
    if (!generatedDocxBlob) return;
    setIsExporting(true);
    try {
      const safeName = `KHBD_${subject.replace(/\s+/g, "_")}${tiet ? `_Tiet_${tiet}` : ""}.docx`;
      saveAs(generatedDocxBlob, safeName);
    } catch (err) {
      console.error(err);
      alert("Không thể tải file Word. Vui lòng thử lại.");
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
            {/* Hiển thị số lượng model Google sẵn sàng */}
            {availableModels.length > 0 && (
              <button
                type="button"
                onClick={() => setShowKeyModal(true)}
                className="hidden md:inline-flex items-center space-x-1.5 px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg shadow-xs hover:bg-emerald-100 transition"
                title="Bấm để xem danh sách mô hình Google AI sẵn sàng tạo nội dung"
              >
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>{availableModels.length} Model Google sẵn sàng</span>
              </button>
            )}

            {/* Nút Cài API Key (màu vàng) */}
            <button
              onClick={() => setShowKeyModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-amber-400 hover:bg-amber-500 text-amber-950 shadow-sm transition active:scale-[0.98]"
              title="Cài đặt Google Gemini API Key và kiểm tra model khả dụng"
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

      {/* MODAL CÀI ĐẶT API KEY & KIỂM TRA MODEL GOOGLE */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <Key className="w-5 h-5 text-amber-600" />
                <span>Cài đặt &amp; Kiểm tra Gemini API Key</span>
              </h3>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-3">
              Dán mã Google Gemini API Key để hệ thống tự động truy vấn trực tiếp danh sách mô hình đang tồn tại và sẵn sàng tạo nội dung:
            </p>

            {apiKey && (
              <div className="mb-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-950 flex items-center justify-between">
                <span>
                  Khóa đang lưu: <code className="font-mono font-bold">{apiKey.length > 10 ? `${apiKey.slice(0, 6)}...${apiKey.slice(-4)}` : apiKey}</code>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setApiKey("");
                    setAvailableModels([]);
                    setModelsError("");
                  }}
                  className="text-red-600 hover:text-red-800 text-xs font-semibold flex items-center space-x-1"
                  title="Xóa khóa cũ để dán khóa mới"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa</span>
                </button>
              </div>
            )}

            <div className="relative mb-3">
              <input
                type={showKeyPassword ? "text" : "password"}
                placeholder="Dán mã khóa mới: AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full pl-3 pr-10 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKeyPassword(!showKeyPassword)}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                title={showKeyPassword ? "Ẩn khóa" : "Hiện khóa"}
              >
                {showKeyPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* NÚT TRUY VẤN TRỰC TIẾP GOOGLE API */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <button
                type="button"
                onClick={() => fetchGoogleModels(apiKey)}
                disabled={!apiKey || isLoadingModels}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingModels ? "animate-spin" : ""}`} />
                <span>{isLoadingModels ? "Đang truy vấn Google API..." : "Truy vấn trực tiếp danh sách Model từ Google API"}</span>
              </button>

              {availableModels.length > 0 && (
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 flex items-center space-x-1">
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>{availableModels.length} Model khả dụng</span>
                </span>
              )}
            </div>

            {/* BÁO LỖI NẾU CÓ */}
            {modelsError && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs space-y-1">
                <p className="font-bold flex items-center space-x-1">
                  <span>✕ Phản hồi từ Google API:</span>
                </p>
                <p>{modelsError}</p>
              </div>
            )}

            {/* DANH SÁCH CÁC MODEL THỰC SỰ TỒN TẠI VÀ SẴN SÀNG TẠO NỘI DUNG */}
            {availableModels.length > 0 && (
              <div className="mb-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                    <Bot className="w-4 h-4 text-blue-600" />
                    <span>Mô hình sử dụng để tạo kế hoạch bài dạy:</span>
                  </label>
                  <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-100/70 px-1.5 py-0.5 rounded">
                    Trực tiếp từ Google AI
                  </span>
                </div>

                <select
                  value={selectedModel}
                  onChange={(e) => {
                    const val = e.target.value || "gemini-3.5-flash";
                    setSelectedModel(val);
                    localStorage.setItem("preferred_model", val);
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="gemini-3.5-flash">
                    ⚡ gemini-3.5-flash (Luôn luôn ưu tiên: Gemini 3.5 Flash)
                  </option>
                  {availableModels
                    .filter((m) => m.id !== "gemini-3.5-flash")
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.id} {m.isFlash ? "⚡ (Flash)" : m.isPro ? "🧠 (Pro)" : ""} — Sẵn sàng tạo nội dung
                      </option>
                    ))}
                </select>

                <div className="text-[11px] text-slate-500 font-medium pt-1">
                  Các mô hình đang kích hoạt trên API Key này (hỗ trợ <code>generateContent</code>):
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1 pr-1 bg-white p-2 rounded-lg border border-slate-200">
                  {availableModels.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between py-1 px-1.5 hover:bg-slate-50 rounded text-[11px]"
                    >
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono font-semibold text-slate-800">{m.id}</span>
                        {m.isFlash && (
                          <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[10px] rounded font-medium">
                            Flash
                          </span>
                        )}
                      </div>
                      <span className="text-emerald-700 font-semibold text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center space-x-1">
                        <Check className="w-2.5 h-2.5 text-emerald-600" />
                        <span>Sẵn sàng tạo</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {keySavedNotification && (
              <div className="mb-3 p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg text-xs flex items-center space-x-2 font-medium animate-pulse">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Đã lưu khóa API &amp; mô hình thành công vào trình duyệt!</span>
              </div>
            )}

            <div className="text-xs text-slate-600 space-y-1.5 mb-5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <p className="font-semibold text-slate-900">Cách lấy khóa miễn phí (Free Tier):</p>
              <p>1. Bấm nút màu đỏ <strong>&quot;Link lấy API Key&quot;</strong> hoặc truy cập <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-blue-600 underline">aistudio.google.com/app/apikey</a></p>
              <p>2. Đăng nhập Google &gt; Bấm &quot;Create API key&quot;</p>
              <p>3. Sao chép và dán vào ô trên, sau đó bấm <strong>&quot;Lưu khóa API&quot;</strong>.</p>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Đóng
              </button>
              <button
                onClick={() => handleSaveApiKey(apiKey)}
                className="px-4 py-2 text-sm bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold rounded-lg flex items-center space-x-1.5 shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>Lưu khóa API</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CHỌN MÃ CHỈ BÁO NĂNG LỰC SỐ (SẮP XẾP THEO MIỀN NĂNG LỰC) */}
      {showNLSModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-orange-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Chọn mã chỉ báo Năng lực số Lớp 3 (PL CV 3456)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowNLSModal(false);
                  setActiveNLSDomain(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
                title="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* KHUNG THÔNG BÁO CÁC CHỈ BÁO ĐÃ CHỌN (LUÔN XUẤT HIỆN Ở TRÊN) */}
            <div className="my-3 p-3 bg-orange-50 border border-orange-200 rounded-xl">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-orange-950 flex items-center space-x-1.5">
                  <span>📢 Khung thông báo: Đã chọn</span>
                  <span className="px-2 py-0.5 bg-orange-200 text-orange-900 rounded-full font-extrabold text-[11px]">
                    {selectedNLS.length} mã
                  </span>
                </span>
                {selectedNLS.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedNLS([])}
                    className="text-[11px] text-red-600 hover:underline font-medium"
                  >
                    Xóa tất cả
                  </button>
                )}
              </div>
              {selectedNLS.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-1">
                  {selectedNLS.map((code) => (
                    <span
                      key={code}
                      className="inline-flex items-center space-x-1 bg-white border border-orange-300 text-orange-900 px-2 py-0.5 rounded-lg text-xs font-mono font-bold shadow-xs"
                    >
                      <span>{code}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleNLS(code);
                        }}
                        className="hover:text-red-600 ml-0.5 text-slate-400"
                        title="Bỏ chọn mã này"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-orange-800/80 italic">
                  Chưa chọn mã nào. Hãy bấm vào một Miền năng lực bên dưới để lựa chọn.
                </p>
              )}
            </div>

            {/* VÙNG CHỌN CHỈ BÁO (THEO MIỀN NĂNG LỰC) */}
            <div className="flex-1 overflow-y-auto pr-1 my-1">
              {activeNLSDomain === null ? (
                /* CẤP 1: DANH SÁCH 6 MIỀN NĂNG LỰC */
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 font-medium mb-1">
                    Bấm vào một <strong>Miền năng lực</strong> bên dưới để xem và chọn mã chỉ báo:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {DOMAIN_GROUPS.map((domain) => {
                      const countSelected = domain.indicators.filter((i) =>
                        selectedNLS.includes(i.code)
                      ).length;
                      return (
                        <button
                          key={domain.id}
                          type="button"
                          onClick={() => setActiveNLSDomain(domain.id)}
                          className="p-3.5 rounded-xl border border-slate-200 hover:border-orange-500 bg-white hover:bg-orange-50/30 text-left transition shadow-xs group flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-bold text-xs text-slate-900 group-hover:text-orange-700">
                                {domain.name}
                              </span>
                              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-orange-600 transition group-hover:translate-x-0.5" />
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed mb-2 line-clamp-2">
                              {domain.description}
                            </p>
                          </div>
                          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                            <span className="text-slate-500 font-medium">
                              {domain.indicators.length} chỉ báo
                            </span>
                            {countSelected > 0 && (
                              <span className="px-2 py-0.5 bg-orange-100 text-orange-800 font-bold rounded-full">
                                ✓ Đã chọn {countSelected}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* CẤP 2: DANH SÁCH CHỈ BÁO TRONG MIỀN ĐANG CHỌN */
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <button
                      type="button"
                      onClick={() => setActiveNLSDomain(null)}
                      className="inline-flex items-center space-x-1.5 text-xs font-bold text-orange-700 hover:text-orange-900 bg-orange-100/70 hover:bg-orange-100 px-2.5 py-1.5 rounded-lg transition"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Quay lại danh sách Miền khác</span>
                    </button>
                    <span className="text-xs font-semibold text-slate-600 truncate max-w-[240px]">
                      {DOMAIN_GROUPS.find((d) => d.id === activeNLSDomain)?.name}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Nhấn 1 lần để chọn, nhấn lần 2 để bỏ chọn. Mã chọn sẽ hiện lên Khung thông báo ở trên.
                  </p>

                  <div className="space-y-2 pt-1">
                    {DOMAIN_GROUPS.find((d) => d.id === activeNLSDomain)?.indicators.map((item) => {
                      const isSelected = selectedNLS.includes(item.code);
                      return (
                        <div
                          key={item.code}
                          onClick={() => toggleNLS(item.code)}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-start space-x-3 select-none ${
                            isSelected
                              ? "border-orange-500 bg-orange-50/70 text-orange-950 shadow-xs"
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
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-mono font-bold px-1.5 py-0.5 bg-orange-100 text-orange-800 rounded text-[11px]">
                                {item.code}
                              </span>
                              {isSelected && (
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                                  Đã thêm vào khung
                                </span>
                              )}
                            </div>
                            <p className="leading-relaxed">{item.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Chân Modal */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 mt-2">
              {activeNLSDomain !== null ? (
                <button
                  type="button"
                  onClick={() => setActiveNLSDomain(null)}
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Quay lại các Miền</span>
                </button>
              ) : (
                <div className="text-xs text-slate-500">
                  Tổng cộng: <strong>52 mã chỉ báo</strong>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setShowNLSModal(false);
                  setActiveNLSDomain(null);
                }}
                className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
              >
                Xác nhận ({selectedNLS.length} mã đã chọn)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CHỌN MÃ CHỈ BÁO AI (SẮP XẾP THEO MẠCH NỘI DUNG) */}
      {showAIModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Chọn mã chỉ báo Trí tuệ nhân tạo AI Lớp 3 (PL CV 2422)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAIModal(false);
                  setActiveAIStrand(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
                title="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* KHUNG THÔNG BÁO CÁC CHỈ BÁO AI ĐÃ CHỌN (LUÔN XUẤT HIỆN Ở TRÊN) */}
            <div className="my-3 p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-indigo-950 flex items-center space-x-1.5">
                  <span>📢 Khung thông báo: Đã chọn</span>
                  <span className="px-2 py-0.5 bg-indigo-200 text-indigo-900 rounded-full font-extrabold text-[11px]">
                    {selectedAI.length} mã AI
                  </span>
                </span>
                {selectedAI.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedAI([])}
                    className="text-[11px] text-red-600 hover:underline font-medium"
                  >
                    Xóa tất cả
                  </button>
                )}
              </div>
              {selectedAI.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-1">
                  {selectedAI.map((code) => (
                    <span
                      key={code}
                      className="inline-flex items-center space-x-1 bg-white border border-indigo-300 text-indigo-900 px-2 py-0.5 rounded-lg text-xs font-mono font-bold shadow-xs"
                    >
                      <span>{code}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleAI(code);
                        }}
                        className="hover:text-red-600 ml-0.5 text-slate-400"
                        title="Bỏ chọn mã này"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-indigo-800/80 italic">
                  Chưa chọn mã nào. Hãy bấm vào một Mạch nội dung bên dưới để lựa chọn.
                </p>
              )}
            </div>

            {/* VÙNG CHỌN CHỈ BÁO (THEO MẠCH NỘI DUNG) */}
            <div className="flex-1 overflow-y-auto pr-1 my-1">
              {activeAIStrand === null ? (
                /* CẤP 1: DANH SÁCH 4 MẠCH NỘI DUNG CHÍNH */
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 font-medium mb-1">
                    Bấm vào một <strong>Mạch nội dung</strong> bên dưới để xem và chọn mã chỉ báo:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {AI_STRAND_GROUPS.map((strand) => {
                      const countSelected = strand.indicators.filter((i) =>
                        selectedAI.includes(i.code)
                      ).length;
                      return (
                        <button
                          key={strand.id}
                          type="button"
                          onClick={() => setActiveAIStrand(strand.id)}
                          className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-500 bg-white hover:bg-indigo-50/30 text-left transition shadow-xs group flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-bold text-xs text-slate-900 group-hover:text-indigo-700">
                                {strand.name}
                              </span>
                              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition group-hover:translate-x-0.5" />
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed mb-2 line-clamp-2">
                              {strand.description}
                            </p>
                          </div>
                          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                            <span className="text-slate-500 font-medium">
                              {strand.indicators.length} chỉ báo
                            </span>
                            {countSelected > 0 && (
                              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 font-bold rounded-full">
                                ✓ Đã chọn {countSelected}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* CẤP 2: DANH SÁCH CHỈ BÁO TRONG MẠCH ĐANG CHỌN */
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <button
                      type="button"
                      onClick={() => setActiveAIStrand(null)}
                      className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-100/70 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Quay lại danh sách Mạch khác</span>
                    </button>
                    <span className="text-xs font-semibold text-slate-600 truncate max-w-[240px]">
                      {AI_STRAND_GROUPS.find((s) => s.id === activeAIStrand)?.name}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Nhấn 1 lần để chọn, nhấn lần 2 để bỏ chọn. Mã chọn sẽ hiện lên Khung thông báo ở trên.
                  </p>

                  <div className="space-y-2 pt-1">
                    {AI_STRAND_GROUPS.find((s) => s.id === activeAIStrand)?.indicators.map((item) => {
                      const isSelected = selectedAI.includes(item.code);
                      return (
                        <div
                          key={item.code}
                          onClick={() => toggleAI(item.code)}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-start space-x-3 select-none ${
                            isSelected
                              ? "border-indigo-500 bg-indigo-50/70 text-indigo-950 shadow-xs"
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
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-mono font-bold px-1.5 py-0.5 bg-indigo-100 text-indigo-800 rounded text-[11px]">
                                {item.code}
                              </span>
                              {isSelected && (
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                                  Đã thêm vào khung
                                </span>
                              )}
                            </div>
                            <p className="leading-relaxed">{item.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Chân Modal */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 mt-2">
              {activeAIStrand !== null ? (
                <button
                  type="button"
                  onClick={() => setActiveAIStrand(null)}
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Quay lại các Mạch</span>
                </button>
              ) : (
                <div className="text-xs text-slate-500">
                  Tổng cộng: <strong>32 mã chỉ báo AI</strong>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setShowAIModal(false);
                  setActiveAIStrand(null);
                }}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
              >
                Xác nhận ({selectedAI.length} mã đã chọn)
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
              {/* 1. Môn học & Tiết */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    1. Môn học Tiểu học
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                  >
                    <option>Tin học</option>
                    <option>Công nghệ</option>
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
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tiết dạy (nếu có)
                  </label>
                  <input
                    type="text"
                    placeholder="VD: 1, 2..."
                    value={tiet}
                    onChange={(e) => setTiet(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                  />
                </div>
              </div>

              {/* 2. Tải KHBD cần tích hợp */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  2. Tải KHBD cần tích hợp (File Word .docx, .pdf hoặc .txt)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".docx,.pdf,.txt,.md"
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


              {/* 3. Đồ dùng và thiết bị lớp học */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  3. Đồ dùng và thiết bị lớp học
                </label>
                <select
                  value={infrastructureLevel}
                  onChange={(e) => setInfrastructureLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option>Tivi/máy chiếu</option>
                  <option>Màn hình tương tác</option>
                  <option>Phòng Tin học</option>
                  <option>Chỉ có bảng và tranh ảnh</option>
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
                      onClick={() => {
                        setActiveNLSDomain(null);
                        setShowNLSModal(true);
                      }}
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
                      onClick={() => {
                        setActiveAIStrand(null);
                        setShowAIModal(true);
                      }}
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

              {/* ACTION BUTTONS: Chế độ xem, Sao chép & Tải Word */}
              {generatedPlan && activeTab === "result" && (
                <div className="flex items-center flex-wrap gap-2">
                  {/* Toggle xem Bảng 2 cột / Văn bản */}
                  <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-medium">
                    <button
                      type="button"
                      onClick={() => setViewMode("table")}
                      className={`px-2.5 py-1 rounded-md transition ${
                        viewMode === "table"
                          ? "bg-white text-orange-700 font-bold shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Bảng 2 cột (CV 2345)
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("text")}
                      className={`px-2.5 py-1 rounded-md transition ${
                        viewMode === "text"
                          ? "bg-white text-orange-700 font-bold shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Văn bản
                    </button>
                  </div>

                  <button
                    onClick={handleCopy}
                    className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                    title="Sao chép toàn bộ văn bản"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Đã chép</span>
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
                    className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition disabled:opacity-50"
                    title="Tải file Word (.docx) chuẩn Kế hoạch bài dạy"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isExporting ? "Đang tải xuống..." : "Tải file Word (.docx)"}</span>
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
                        <strong>Kế hoạch bài dạy đã tạo thành công!</strong> Thầy/cô vui lòng kiểm tra nội dung ở khung bên dưới. Khi đã hài lòng, thầy/cô bấm nút <strong>&quot;Tải file Word (.docx)&quot;</strong> màu xanh ở phía trên để tải file về máy tính.
                      </div>
                    </div>

                    {viewMode === "text" ? (
                      <pre className="whitespace-pre-wrap font-sans text-slate-800 leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-200 text-xs sm:text-sm">
                        {generatedPlan}
                      </pre>
                    ) : (
                      /* CHẾ ĐỘ XEM BẢNG 2 CỘT CHUẨN CV 2345 */
                      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 font-serif text-slate-900">
                        {parsedPreview && (
                          <>
                            {/* PHẦN ĐẦU: TIÊU ĐỀ, MỤC I & MỤC II */}
                            <div className="space-y-1.5">
                              {parsedPreview.beforeSectionIII.map((line, idx) => {
                                const isHeader =
                                  line.startsWith("KẾ HOẠCH BÀI DẠY") ||
                                  line.startsWith("MÔN:") ||
                                  line.startsWith("BÀI") ||
                                  line.startsWith("Ngày soạn:");
                                const isSectionIorII =
                                  line.startsWith("I. YÊU CẦU CẦN ĐẠT") ||
                                  line.startsWith("II. ĐỒ DÙNG DẠY HỌC");
                                const isSubHeader =
                                  line.startsWith("1. Kiến thức") ||
                                  line.startsWith("2. Năng lực") ||
                                  line.startsWith("3. Phẩm chất") ||
                                  line.startsWith("- Giáo viên:") ||
                                  line.startsWith("- Học sinh:");
                                const isNLS = line.startsWith("*Tích hợp Năng lực số:");
                                const isAI = line.startsWith("*Tích hợp AI:") || line.startsWith("*Tích hợp Trí tuệ");

                                if (isHeader) {
                                  return (
                                    <div
                                      key={idx}
                                      className={`text-center ${
                                        line.startsWith("KẾ HOẠCH BÀI DẠY")
                                          ? "font-extrabold text-base text-slate-900"
                                          : line.startsWith("BÀI")
                                          ? "font-bold text-sm text-red-700"
                                          : line.startsWith("Ngày soạn")
                                          ? "italic text-xs text-slate-500 mb-3"
                                          : "font-bold text-sm text-slate-800"
                                      }`}
                                    >
                                      {line}
                                    </div>
                                  );
                                }

                                if (isSectionIorII) {
                                  return (
                                    <h3
                                      key={idx}
                                      className="font-bold text-sm text-slate-900 pt-2 border-t border-slate-100"
                                    >
                                      {line}
                                    </h3>
                                  );
                                }

                                if (isNLS) {
                                  return (
                                    <div
                                      key={idx}
                                      className="font-semibold text-xs text-emerald-800 bg-emerald-50/70 p-2 rounded-lg border border-emerald-200"
                                    >
                                      {line}
                                    </div>
                                  );
                                }

                                if (isAI) {
                                  return (
                                    <div
                                      key={idx}
                                      className="font-semibold text-xs text-indigo-800 bg-indigo-50/70 p-2 rounded-lg border border-indigo-200"
                                    >
                                      {line}
                                    </div>
                                  );
                                }

                                if (isSubHeader) {
                                  return (
                                    <p key={idx} className="font-semibold text-xs text-slate-800">
                                      {line}
                                    </p>
                                  );
                                }

                                return (
                                  <p key={idx} className="text-xs text-slate-700 pl-3">
                                    {line}
                                  </p>
                                );
                              })}
                            </div>

                            {/* PHẦN III: BẢNG 2 CỘT CÁC HOẠT ĐỘNG DẠY HỌC */}
                            <div className="pt-3">
                              <h3 className="font-bold text-sm text-slate-900 mb-2">
                                III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU:
                              </h3>
                              <div className="overflow-x-auto border border-slate-300 rounded-lg shadow-xs">
                                <table className="w-full border-collapse text-xs">
                                  <thead>
                                    <tr className="bg-slate-100 border-b border-slate-300 text-slate-900">
                                      <th className="w-1/2 p-2.5 text-center font-bold border-r border-slate-300">
                                        Hoạt động của giáo viên
                                      </th>
                                      <th className="w-1/2 p-2.5 text-center font-bold">
                                        Hoạt động của học sinh
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {parsedPreview.activities.map((act, aIdx) => {
                                      return (
                                        <React.Fragment key={aIdx}>
                                          {/* Hàng tiêu đề hoạt động: 2 ô riêng biệt (tuyệt đối không gộp cột), viền 2 bên và ở giữa */}
                                          <tr className="border-l border-r border-slate-300 border-t-0 border-b-0 bg-white">
                                            <td className="w-1/2 p-2.5 font-bold text-slate-900 leading-relaxed text-xs border-r border-slate-300 border-t-0 border-b-0">
                                              {act.title}
                                            </td>
                                            <td className="w-1/2 p-2.5 border-t-0 border-b-0 select-none">
                                              &nbsp;
                                            </td>
                                          </tr>
                                          {/* Hàng nội dung hoạt động: 2 cột GV và HS song hành */}
                                          <tr className="align-top font-serif border-l border-r border-slate-300 border-t-0 border-b-0">
                                            {/* Cột GV */}
                                            <td className="w-1/2 p-3 border-r border-slate-300 bg-white align-top border-t-0 border-b-0">
                                              {act.steps.map((st, sIdx) => {
                                                const gvLen = (st.gv || "").length + 2;
                                                const hsLen = (st.hs || "").length + 2;
                                                const gvLines = Math.max(1, Math.ceil(gvLen / 41));
                                                const hsLines = Math.max(1, Math.ceil(hsLen / 41));
                                                const gvExtra = hsLines > gvLines ? hsLines - gvLines : 0;
                                                return (
                                                  <React.Fragment key={sIdx}>
                                                    <p className="text-slate-800 leading-relaxed text-xs whitespace-pre-line m-0 p-0 text-justify">
                                                      {ensureDash(st.gv, "GV")}
                                                    </p>
                                                    {Array.from({ length: gvExtra }).map((_, i) => (
                                                      <p key={i} className="leading-relaxed text-xs m-0 p-0 select-none">&nbsp;</p>
                                                    ))}
                                                  </React.Fragment>
                                                );
                                              })}
                                            </td>
                                            {/* Cột HS */}
                                            <td className="w-1/2 p-3 bg-white align-top border-t-0 border-b-0">
                                              {act.steps.map((st, sIdx) => {
                                                const gvLen = (st.gv || "").length + 2;
                                                const hsLen = (st.hs || "").length + 2;
                                                const gvLines = Math.max(1, Math.ceil(gvLen / 41));
                                                const hsLines = Math.max(1, Math.ceil(hsLen / 41));
                                                const hsExtra = gvLines > hsLines ? gvLines - hsLines : 0;
                                                return (
                                                  <React.Fragment key={sIdx}>
                                                    <p className="text-slate-800 leading-relaxed text-xs whitespace-pre-line m-0 p-0 text-justify">
                                                      {ensureDash(st.hs, "HS")}
                                                    </p>
                                                    {Array.from({ length: hsExtra }).map((_, i) => (
                                                      <p key={i} className="leading-relaxed text-xs m-0 p-0 select-none">&nbsp;</p>
                                                    ))}
                                                  </React.Fragment>
                                                );
                                              })}
                                            </td>
                                          </tr>
                                        </React.Fragment>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* PHẦN IV: ĐIỀU CHỈNH SAU BÀI DẠY VÀ GHI CHÚ TÍCH HỢP */}
                            <div className="pt-2 space-y-1">
                              {parsedPreview.afterSectionIII.map((line, idx) => (
                                <p
                                  key={idx}
                                  className={
                                    line.startsWith("IV.")
                                      ? "font-bold text-sm text-slate-900 pt-2"
                                      : /^\*?\s*Ghi chú/i.test(line)
                                      ? "font-bold italic text-sm text-indigo-900 pt-3"
                                      : line.startsWith("- ")
                                      ? "text-slate-700 italic text-xs pl-2"
                                      : "text-slate-400 font-mono text-xs overflow-hidden"
                                  }
                                >
                                  {line}
                                </p>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center py-20 text-center text-slate-400">
                    <PenTool className="w-16 h-16 mb-3 stroke-1 text-slate-300" />
                    <p className="text-sm font-medium text-slate-600">
                      Chưa có nội dung Kế hoạch bài dạy
                    </p>
                    <p className="text-xs text-slate-400 max-w-sm mt-1">
                      Vui lòng chọn Môn học, tải lên file Kế hoạch bài dạy (.docx hoặc .txt) ở cột bên trái và bấm nút &quot;Soạn Kế Hoạch Bài Dạy Chuẩn CV 2345&quot;.
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
