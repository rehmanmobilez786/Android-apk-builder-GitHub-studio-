import React, { useState } from "react";
import {
  UploadCloud,
  Wrench,
  Smartphone,
  Play,
  Download,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Folder,
  Layers,
  Send,
  Github,
} from "lucide-react";

export interface WorkflowPipelineProps {
  currentStep: number; // 1 to 5
  onSetStep: (step: number) => void;
  onOpenUpload: () => void;
  onOpenBugFixer: () => void;
  onSelectTab: (tab: "code" | "visual" | "emulator") => void;
  onStartBuild: () => void;
  onOpenBuildConsole: () => void;
  onPushGitHub?: () => void;
  onOpenGitHub?: () => void;
  githubRepo?: { owner: string; repo: string };
  issueCount: number;
  isBuilding: boolean;
  isRepairing: boolean;
  hasBuildOutput: boolean;
  ideTheme?: "dark" | "light";
}

export const WorkflowPipeline: React.FC<WorkflowPipelineProps> = ({
  currentStep,
  onSetStep,
  onOpenUpload,
  onOpenBugFixer,
  onSelectTab,
  onStartBuild,
  onOpenBuildConsole,
  onPushGitHub,
  onOpenGitHub,
  githubRepo = { owner: "rehmanmobilez786", repo: "Android-apk-builder-GitHub-studio-" },
  issueCount,
  isBuilding,
  isRepairing,
  hasBuildOutput,
  ideTheme = "dark",
}) => {
  const [isAutoRunning, setIsAutoRunning] = useState(false);

  const steps = [
    {
      id: 1,
      title: "1. سورس کوڈ اپلوڈ",
      subtitle: "Upload Source Code",
      icon: UploadCloud,
      actionLabel: "اپلوڈ سورس فائل",
      action: onOpenUpload,
    },
    {
      id: 2,
      title: "2. کوڈ چیک & Fix",
      subtitle: issueCount > 0 ? `${issueCount} بگز` : "محفوظ ہے",
      icon: Wrench,
      actionLabel: issueCount > 0 ? "آٹو ریپیئر بگز" : "کوڈ ٹھیک ہے",
      action: onOpenBugFixer,
    },
    {
      id: 3,
      title: "3. لائیو ایمولیٹر",
      subtitle: "Live Test & UI",
      icon: Smartphone,
      actionLabel: "ایمولیٹر چلائیں",
      action: () => onSelectTab("emulator"),
    },
    {
      id: 4,
      title: "4. Push GitHub & بلڈ",
      subtitle: "GitHub Cloud Build",
      icon: Send,
      actionLabel: "GitHub پر پش کریں",
      action: () => {
        if (onPushGitHub) onPushGitHub();
        else if (onOpenGitHub) onOpenGitHub();
        else onStartBuild();
      },
    },
    {
      id: 5,
      title: "5. GitHub سے APK ڈاؤنلوڈ",
      subtitle: "Releases & APK",
      icon: Download,
      actionLabel: "ڈاؤن لوڈ APK",
      action: onOpenBuildConsole,
    },
  ];

  // Auto pipeline loop
  const handleAutoRunPipeline = () => {
    setIsAutoRunning(true);
    onSetStep(1);

    // Step 1 -> Step 2
    setTimeout(() => {
      onSetStep(2);
      if (issueCount > 0) {
        onOpenBugFixer();
      }
    }, 1200);

    // Step 2 -> Step 3
    setTimeout(() => {
      onSetStep(3);
      onSelectTab("emulator");
    }, 2800);

    // Step 3 -> Step 4
    setTimeout(() => {
      onSetStep(4);
      if (onPushGitHub) {
        onPushGitHub();
      } else {
        onStartBuild();
      }
    }, 4500);

    // Step 4 -> Step 5
    setTimeout(() => {
      onSetStep(5);
      onOpenBuildConsole();
      setIsAutoRunning(false);
    }, 8500);
  };

  return (
    <div
      className={`border-b px-3 py-2 transition-colors ${
        ideTheme === "light"
          ? "bg-slate-50 border-slate-200 text-slate-800"
          : "bg-slate-900/90 border-slate-800 text-slate-200"
      }`}
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-2 max-w-full overflow-x-auto">
        {/* Pipeline Title Badge & Actions */}
        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-between md:justify-start border-b md:border-b-0 pb-1.5 md:pb-0 border-slate-800/50">
          <div className="flex items-center gap-1.5 bg-sky-500/10 border border-sky-500/30 px-2.5 py-1 rounded-lg text-sky-400 text-xs font-bold">
            <Layers className="w-4 h-4 text-sky-400 shrink-0" />
            <span>پراجیکٹ ورک فلو (Step-by-Step)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleAutoRunPipeline}
              disabled={isAutoRunning || isBuilding}
              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs px-3 py-1 rounded-lg shadow transition-all active:scale-95 disabled:opacity-50"
              title="ہر ایک مرحلہ خودکار طریقہ سے ایک کے بعد ایک چلائے"
            >
              {isAutoRunning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>پروسیس جاری ہے...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>آٹو تمام مرحلے چلائیں</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sequential Step Indicator Bar */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1 w-full md:w-auto justify-start md:justify-end">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isDone = currentStep > step.id || (step.id === 5 && hasBuildOutput);

            return (
              <React.Fragment key={step.id}>
                {idx > 0 && (
                  <ArrowRight
                    className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                      isDone ? "text-emerald-400" : "text-slate-600"
                    }`}
                  />
                )}

                <div
                  onClick={() => {
                    onSetStep(step.id);
                    step.action();
                  }}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl cursor-pointer transition-all border shrink-0 text-xs ${
                    isActive
                      ? "bg-sky-500/20 border-sky-400 text-sky-300 font-bold shadow-md ring-1 ring-sky-400/50"
                      : isDone
                      ? "bg-emerald-950/40 border-emerald-600/50 text-emerald-300 font-semibold"
                      : ideTheme === "light"
                      ? "bg-white border-slate-300 text-slate-600 hover:bg-slate-100"
                      : "bg-slate-800/60 border-slate-700/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                  title={`${step.title} - کلک کر کے یہ مرحلہ کھولیں`}
                >
                  <div className="relative">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-sky-400 animate-pulse" : ""}`} />
                    )}
                  </div>

                  <div className="flex flex-col text-right">
                    <span className="text-[11px] leading-tight">{step.title}</span>
                    <span className="text-[9px] opacity-75 font-mono leading-none">{step.subtitle}</span>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
