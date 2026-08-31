import React, { useState, useRef } from "react";
import JSZip from "jszip";
import { UploadCloud, Sparkles, X, Wand2, Smartphone, CheckCircle, Code } from "lucide-react";
import { AndroidFile } from "../types";
import { convertAIStudioToAndroidProject, detectAIStudioProject } from "../utils/aiStudioConverter";

interface DragDropZoneProps {
  isOpen: boolean;
  onClose: () => void;
  onFilesImported: (files: AndroidFile[], projectName?: string) => void;
}

export const DragDropZone: React.FC<DragDropZoneProps> = ({
  isOpen,
  onClose,
  onFilesImported,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const processFiles = async (fileList: FileList | File[]) => {
    setIsProcessing(true);
    setStatusMessage("Google AI Studio سورس کوڈ کی جانچ کی جا رہی ہے...");
    const rawFiles: AndroidFile[] = [];
    let detectedProjectName = "";

    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];

        if (file.name.endsWith(".zip")) {
          setStatusMessage(`Extracting Google AI Studio Zip: ${file.name}...`);
          detectedProjectName = file.name.replace(".zip", "");
          const zip = new JSZip();
          const zipContent = await zip.loadAsync(file);

          const rawEntries: { path: string; text: string }[] = [];

          for (const relativePath of Object.keys(zipContent.files)) {
            const entry = zipContent.files[relativePath];
            if (!entry.dir) {
              if (
                !relativePath.includes(".git/") &&
                !relativePath.includes(".gradle/") &&
                !relativePath.includes("/build/") &&
                !relativePath.includes("__MACOSX")
              ) {
                const text = await entry.async("string");
                rawEntries.push({ path: relativePath, text });
              }
            }
          }

          // Detect common root folder prefix
          let commonPrefix = "";
          if (rawEntries.length > 0) {
            const firstParts = rawEntries[0].path.split("/");
            if (firstParts.length > 1) {
              const possiblePrefix = firstParts[0] + "/";
              if (rawEntries.every((e) => e.path.startsWith(possiblePrefix))) {
                commonPrefix = possiblePrefix;
              }
            }
          }

          for (const entry of rawEntries) {
            let cleanPath = commonPrefix ? entry.path.replace(commonPrefix, "") : entry.path;
            if (cleanPath.startsWith("src/main/")) {
              cleanPath = "app/" + cleanPath;
            }
            rawFiles.push({
              path: cleanPath,
              content: entry.text,
            });
          }
        } else {
          // Single source code file
          const text = await file.text();
          let path = file.name;
          if (file.name.endsWith(".kt") || file.name.endsWith(".java")) {
            path = `app/src/main/java/com/example/app/${file.name}`;
          } else if (file.name.endsWith(".xml")) {
            if (file.name === "AndroidManifest.xml") path = "app/src/main/AndroidManifest.xml";
            else path = `app/src/main/res/layout/${file.name}`;
          } else if (file.name.endsWith(".gradle")) {
            path = file.name === "build.gradle" ? "app/build.gradle" : file.name;
          }

          rawFiles.push({ path, content: text });
        }
      }

      // Check if this is a Google AI Studio web / React applet
      const aiStudioInfo = detectAIStudioProject(rawFiles);
      let finalFiles = rawFiles;

      if (aiStudioInfo.isAIStudio && !rawFiles.some(f => f.path.includes("AndroidManifest.xml"))) {
        setStatusMessage("✨ Google AI Studio پروجیکٹ کو اینڈرائیڈ نیٹو اسٹوڈیو APK میں تبدیل کیا جا رہا ہے...");
        const converted = convertAIStudioToAndroidProject(rawFiles, detectedProjectName);
        finalFiles = converted.files;
        if (converted.name) detectedProjectName = converted.name;
      }

      setStatusMessage(`✅ ${finalFiles.length} فائلیں کامیابی سے لوڈ ہو گئیں!`);

      setTimeout(() => {
        onFilesImported(finalFiles, detectedProjectName || undefined);
        setIsProcessing(false);
        onClose();
      }, 700);
    } catch (err: any) {
      console.error(err);
      setStatusMessage(`❌ ایرر: ${err.message || "Invalid zip or file format"}`);
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-sky-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <span>سورس کوڈ اپلوڈ کریں (Upload Source Code)</span>
                <span className="bg-sky-500/20 text-sky-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  ZIP / Kotlin / Android Files
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Google AI Studio کا ZIP یا اینڈرائڈ سورس کوڈ ڈریگ اور ڈراپ کر کے فوری امپورٹ کریں
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drop Zone Box */}
        <div className="p-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              isDragging
                ? "border-sky-400 bg-sky-500/10 scale-[1.01]"
                : "border-slate-700 bg-slate-950/50 hover:border-sky-500/50 hover:bg-slate-950"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              accept=".zip,.kt,.java,.xml,.gradle,.properties,.png,.tsx,.ts,.json,.html,.css"
              className="hidden"
            />

            <div className="w-14 h-14 rounded-2xl bg-sky-500/10 flex items-center justify-center mb-3">
              <UploadCloud className={`w-8 h-8 transition-colors ${isDragging ? "text-sky-400" : "text-sky-500"}`} />
            </div>
            
            <p className="text-sm font-semibold text-slate-100">
              سورس کوڈ (.zip یا سنگل سورس فائلز) یہاں ڈراپ کریں
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Supports AI Studio .zip, React/Vite web files, Kotlin (.kt), Java, XML Layouts, Gradle
            </p>

            <div className="mt-4 flex items-center gap-2">
              <span className="bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs px-4 py-2 rounded-xl shadow-md transition-colors flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5" /> سورس کوڈ فائل منتخب کریں (Select Files)
              </span>
            </div>
          </div>

          {/* AI Studio Feature Cards */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-start gap-2.5">
              <Wand2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-200">Web to APK Auto Conversion</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  AI Studio React/TypeScript ویب کوڈ کو خودکار طور پر مکمل Android Studio پروجیکٹ اور آف لائن بنڈل میں پیک کرتا ہے۔
                </p>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-start gap-2.5">
              <Smartphone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-200">Hardware & Gemini Bridge</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  کیمرہ، مائیکروفون اور جیو لوکیشن کی پرمیشنز اور Gemini API کے ساتھ محفوظ انٹیگریشن۔
                </p>
              </div>
            </div>
          </div>

          {/* Processing Status Indicator */}
          {isProcessing && (
            <div className="mt-4 flex items-center justify-center gap-3 p-3 bg-sky-950/40 border border-sky-800/50 text-sky-200 rounded-lg text-xs animate-pulse">
              <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
              <span>{statusMessage}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
