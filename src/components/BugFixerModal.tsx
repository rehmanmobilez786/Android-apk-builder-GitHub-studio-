import React from "react";
import {
  Wrench,
  AlertTriangle,
  FilePlus,
  CheckCircle,
  Sparkles,
  X,
  RefreshCw,
  Code2,
} from "lucide-react";
import { ValidationReport } from "../types";

interface BugFixerModalProps {
  isOpen: boolean;
  onClose: () => void;
  validationReport: ValidationReport;
  onRunAiFix: () => void;
  isRepairing: boolean;
  repairSummary: string | null;
  onStartBuild?: () => void;
  onOpenEmulator?: () => void;
}

export const BugFixerModal: React.FC<BugFixerModalProps> = ({
  isOpen,
  onClose,
  validationReport,
  onRunAiFix,
  isRepairing,
  repairSummary,
  onStartBuild,
  onOpenEmulator,
}) => {
  if (!isOpen) return null;

  const errorCount = validationReport.issues.filter((i) => i.severity === "error").length;
  const warningCount = validationReport.issues.filter((i) => i.severity === "warning").length;
  const missingCount = validationReport.missingFiles.length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Android Code Diagnostics & AI Auto-Fixer</h3>
              <p className="text-xs text-slate-400">Detect missing Android files, syntax bugs & auto-repair</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Diagnostic Badges Summary */}
        <div className="p-4 bg-slate-950/50 border-b border-slate-800 flex items-center justify-around text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-slate-300 font-semibold">{errorCount} Syntax Errors</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-300 font-semibold">{missingCount} Missing Files</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <span className="text-slate-300 font-semibold">{warningCount} Warnings</span>
          </div>
        </div>

        {/* Content Body: Issues list & auto-generator */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
          {/* Missing Essential Files */}
          {missingCount > 0 && (
            <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-4">
              <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs mb-2">
                <FilePlus className="w-4 h-4" />
                <span>Essential Missing Android Studio Files Detected</span>
              </div>
              <ul className="space-y-1.5 text-xs text-amber-200/90 pl-6 list-disc">
                {validationReport.missingFiles.map((f) => (
                  <li key={f} className="font-mono">
                    {f}
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-amber-400/80 mt-2">
                Clicking "Apply AI Repairs" will automatically synthesize fully working Kotlin/XML/Gradle source code for these missing files!
              </p>
            </div>
          )}

          {/* Issue List */}
          {validationReport.issues.length > 0 ? (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Detected Code Diagnostics</h4>
              {validationReport.issues.map((issue) => (
                <div
                  key={issue.id}
                  className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl flex items-start gap-3"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="flex-1 text-xs space-y-1">
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-sky-400 font-semibold">{issue.filePath}</span>
                      {issue.line && <span className="text-slate-500">Line {issue.line}</span>}
                    </div>
                    <p className="text-slate-200 font-medium">{issue.message}</p>
                    <p className="text-slate-400 text-[11px]">{issue.suggestion}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-emerald-950/20 border border-emerald-800/40 rounded-2xl p-6">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-emerald-300">No Critical Syntax Bugs Found!</p>
              <p className="text-xs text-slate-400 mt-1">
                All AndroidManifest, Kotlin, and Layout XML files pass verification.
              </p>
            </div>
          )}

          {/* Repair Result Summary */}
          {repairSummary && (
            <div className="bg-emerald-950/40 border border-emerald-800/60 p-4 rounded-xl text-xs text-emerald-200 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-emerald-300">
                <Sparkles className="w-4 h-4 text-emerald-400" /> AI Repair Output
              </p>
              <p>{repairSummary}</p>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-500 font-mono">Gemini 3.6 Flash Engine</span>
          <div className="flex items-center gap-2">
            {missingCount === 0 && errorCount === 0 ? (
              <>
                {onOpenEmulator && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenEmulator();
                    }}
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs px-3.5 py-2 rounded-xl transition-colors"
                  >
                    <Code2 className="w-3.5 h-3.5 text-sky-400" />
                    <span>Open Emulator</span>
                  </button>
                )}
                {onStartBuild && (
                  <button
                    onClick={() => {
                      onClose();
                      onStartBuild();
                    }}
                    className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl shadow-lg transition-transform active:scale-95"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Compile & Build APK</span>
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={onRunAiFix}
                disabled={isRepairing}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs px-5 py-2 rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-50"
              >
                {isRepairing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 fill-slate-950" />
                )}
                <span>{isRepairing ? "Synthesizing Repairs..." : "Apply AI Repairs & Generate Files"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
