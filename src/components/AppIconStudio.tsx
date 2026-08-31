import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Layers,
  Smartphone,
  Download,
  CheckCircle,
  RefreshCw,
  Sliders,
  Palette,
  Wand2,
  Shapes,
  Eye,
  ShieldCheck,
  FolderTree,
  Send,
} from "lucide-react";
import {
  IconDesignConfig,
  DEFAULT_ICON_CONFIG,
  PRESET_ICON_THEMES,
  generateIconSvg,
  generateAndroidMipmapFiles,
} from "../utils/iconGenerator";
import { AndroidFile } from "../types";

interface AppIconStudioProps {
  appName: string;
  onApplyMipmapFiles: (newFiles: AndroidFile[]) => void;
  ideTheme?: "dark" | "light";
  onTriggerAutoSync?: () => void;
  isAutoSyncEnabled?: boolean;
}

const AVAILABLE_SYMBOLS = [
  { id: "Sparkles", label: "Sparkles (AI / Magic)" },
  { id: "Brain", label: "Neural Brain (Intelligence)" },
  { id: "Rocket", label: "Rocket (Speed / Launch)" },
  { id: "Shield", label: "Shield (Security / Protection)" },
  { id: "Zap", label: "Lightning Bolt (Power / Fast)" },
  { id: "ShoppingBag", label: "Shopping Bag (E-Commerce)" },
  { id: "Camera", label: "Camera (Vision / Photo)" },
  { id: "Bot", label: "AI Robot (Assistant)" },
];

export const AppIconStudio: React.FC<AppIconStudioProps> = ({
  appName,
  onApplyMipmapFiles,
  ideTheme = "dark",
  onTriggerAutoSync,
  isAutoSyncEnabled = false,
}) => {
  const [config, setConfig] = useState<IconDesignConfig>({
    ...DEFAULT_ICON_CONFIG,
    appName: appName || "Google AI Studio App",
  });

  const [aiPrompt, setAiPrompt] = useState("");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState<string | null>(null);
  const [previewSizeTab, setPreviewSizeTab] = useState<"store" | "densities" | "homescreen">("homescreen");

  // Keep app name synced
  useEffect(() => {
    if (appName && appName !== config.appName) {
      setConfig((prev) => ({ ...prev, appName }));
    }
  }, [appName]);

  // AI Prompt Generator Simulation (analyzes keywords and adapts colors, shape, symbols)
  const handleGenerateFromAi = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsGeneratingAi(true);
    const p = aiPrompt.toLowerCase();

    setTimeout(() => {
      let newSymbol = "Sparkles";
      let newPrimary = "#0284C7";
      let newSecondary = "#6366F1";
      let newAccent = "#38BDF8";
      let newShape: IconDesignConfig["shape"] = "squircle";
      let newBg: IconDesignConfig["backgroundType"] = "linear_gradient";

      if (p.includes("brain") || p.includes("ai") || p.includes("intel") || p.includes("smart") || p.includes("neural")) {
        newSymbol = "Brain";
        newPrimary = "#8B5CF6";
        newSecondary = "#3B82F6";
        newAccent = "#C084FC";
        newShape = "squircle";
      } else if (p.includes("crypto") || p.includes("security") || p.includes("shield") || p.includes("lock") || p.includes("safe")) {
        newSymbol = "Shield";
        newPrimary = "#0F172A";
        newSecondary = "#1E293B";
        newAccent = "#10B981";
        newShape = "hexagon";
      } else if (p.includes("speed") || p.includes("power") || p.includes("thunder") || p.includes("lightning") || p.includes("fast") || p.includes("bolt")) {
        newSymbol = "Zap";
        newPrimary = "#F59E0B";
        newSecondary = "#D97706";
        newAccent = "#FDE047";
        newShape = "teardrop";
      } else if (p.includes("shop") || p.includes("store") || p.includes("cart") || p.includes("market") || p.includes("buy")) {
        newSymbol = "ShoppingBag";
        newPrimary = "#10B981";
        newSecondary = "#059669";
        newAccent = "#34D399";
        newShape = "squircle";
      } else if (p.includes("camera") || p.includes("photo") || p.includes("video") || p.includes("lens") || p.includes("vision")) {
        newSymbol = "Camera";
        newPrimary = "#7C3AED";
        newSecondary = "#4C1D95";
        newAccent = "#A78BFA";
        newShape = "circle";
      } else if (p.includes("rocket") || p.includes("space") || p.includes("launch") || p.includes("ship")) {
        newSymbol = "Rocket";
        newPrimary = "#F43F5E";
        newSecondary = "#8B5CF6";
        newAccent = "#FB7185";
        newShape = "squircle";
      } else if (p.includes("bot") || p.includes("chat") || p.includes("talk") || p.includes("assistant")) {
        newSymbol = "Bot";
        newPrimary = "#0284C7";
        newSecondary = "#0369A1";
        newAccent = "#38BDF8";
        newShape = "squircle";
      }

      setConfig((prev) => ({
        ...prev,
        symbol: newSymbol,
        symbolType: "icon",
        primaryColor: newPrimary,
        secondaryColor: newSecondary,
        accentColor: newAccent,
        shape: newShape,
        backgroundType: newBg,
        hasGlow: true,
        hasInnerBorder: true,
      }));

      setIsGeneratingAi(false);
      setApplySuccess("✨ AI Icon generated successfully from prompt!");
      setTimeout(() => setApplySuccess(null), 3000);
    }, 600);
  };

  const handleApplyToProject = async () => {
    setIsApplying(true);
    setApplySuccess(null);

    try {
      const mipmapFiles = await generateAndroidMipmapFiles(config);
      onApplyMipmapFiles(mipmapFiles);

      if (onTriggerAutoSync && isAutoSyncEnabled) {
        onTriggerAutoSync();
      }

      setApplySuccess(
        `✅ کامیابی! پروجیکٹ کے 'res/mipmap' ڈائریکٹری میں تمام 11 اسکرین ڈینسٹی آئکنز اور Adaptive XMLs اپڈیٹ ہو چکے ہیں۔`
      );
    } catch (err: any) {
      setApplySuccess(`❌ Error updating mipmap: ${err.message || err}`);
    } finally {
      setIsApplying(false);
    }
  };

  const currentMasterSvg = generateIconSvg(config, 512, false);
  const currentRoundSvg = generateIconSvg(config, 512, true);

  return (
    <div
      className={`flex-1 flex flex-col lg:flex-row h-full overflow-hidden select-none transition-colors ${
        ideTheme === "light" ? "bg-slate-100 text-slate-800" : "bg-slate-950 text-slate-100"
      }`}
    >
      {/* Left Column: AI Prompt & Customization Controls */}
      <div
        className={`w-full lg:w-96 border-r flex flex-col overflow-y-auto custom-scrollbar p-4 gap-4 ${
          ideTheme === "light" ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-xl text-white shadow-md">
              <Wand2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs">AI App Icon Studio</h3>
              <p className="text-[10px] text-sky-400">Mipmap & Adaptive Icon Generator</p>
            </div>
          </div>
          <span className="text-[10px] bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded-full border border-sky-500/20 font-bold">
            res/mipmap
          </span>
        </div>

        {/* AI Prompt Input Bar */}
        <form onSubmit={handleGenerateFromAi} className="space-y-2">
          <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Generate with AI Prompt (پرامپٹ سے آئکن بنائیں)</span>
          </label>
          <div className="flex gap-1.5">
            <input
              type="text"
              placeholder="e.g. Glowing AI neural brain with cyan neon accents..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className={`flex-1 text-xs px-3 py-2 rounded-xl border focus:outline-none focus:border-sky-500 transition-colors ${
                ideTheme === "light"
                  ? "bg-slate-50 border-slate-300 text-slate-900"
                  : "bg-slate-950 border-slate-800 text-slate-100"
              }`}
            />
            <button
              type="submit"
              disabled={!aiPrompt.trim() || isGeneratingAi}
              className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold p-2 rounded-xl text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              {isGeneratingAi ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </form>

        {/* Preset Styles */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-400 block">Preset Icon Archetypes (تیار ٹیمپلیٹس)</label>
          <div className="grid grid-cols-2 gap-2">
            {PRESET_ICON_THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setConfig((prev) => ({ ...prev, ...theme.config }))}
                className={`p-2 rounded-xl border text-left transition-all flex items-center gap-2 group ${
                  ideTheme === "light"
                    ? "bg-slate-50 border-slate-200 hover:border-sky-400 hover:bg-sky-50"
                    : "bg-slate-950 border-slate-800 hover:border-sky-500/50 hover:bg-slate-850"
                }`}
              >
                <div
                  className="w-6 h-6 rounded-lg shrink-0 flex items-center justify-center text-[10px] text-white font-bold shadow-sm"
                  style={{ backgroundColor: theme.config.primaryColor || "#0284C7" }}
                >
                  ✨
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-[11px] truncate group-hover:text-sky-400 transition-colors">
                    {theme.name}
                  </div>
                  <div className="text-[9px] text-slate-500 truncate">{theme.category}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Customization Details */}
        <div className="space-y-3 pt-2 border-t border-slate-800/40">
          <div className="font-bold text-xs text-slate-300 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-sky-400" />
            <span>Customize Geometry & Palette</span>
          </div>

          {/* Symbol / Monogram Type Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400 block">Foreground Symbol / Graphic</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfig((prev) => ({ ...prev, symbolType: "icon" }))}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                  config.symbolType === "icon"
                    ? "bg-sky-500/20 border-sky-500 text-sky-400"
                    : "border-slate-800 text-slate-400"
                }`}
              >
                Vector Icon
              </button>
              <button
                type="button"
                onClick={() => setConfig((prev) => ({ ...prev, symbolType: "text" }))}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                  config.symbolType === "text"
                    ? "bg-sky-500/20 border-sky-500 text-sky-400"
                    : "border-slate-800 text-slate-400"
                }`}
              >
                Monogram Letter
              </button>
            </div>
          </div>

          {config.symbolType === "icon" ? (
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Select Icon Symbol</label>
              <select
                value={config.symbol}
                onChange={(e) => setConfig((prev) => ({ ...prev, symbol: e.target.value }))}
                className={`w-full text-xs px-2.5 py-1.5 rounded-lg border outline-none ${
                  ideTheme === "light"
                    ? "bg-slate-50 border-slate-300 text-slate-900"
                    : "bg-slate-950 border-slate-800 text-slate-100"
                }`}
              >
                {AVAILABLE_SYMBOLS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Monogram Letters (1-3 chars)</label>
              <input
                type="text"
                maxLength={3}
                value={config.monogramText || "AI"}
                onChange={(e) => setConfig((prev) => ({ ...prev, monogramText: e.target.value }))}
                className={`w-full text-xs px-2.5 py-1.5 rounded-lg border outline-none font-bold uppercase ${
                  ideTheme === "light"
                    ? "bg-slate-50 border-slate-300 text-slate-900"
                    : "bg-slate-950 border-slate-800 text-slate-100"
                }`}
              />
            </div>
          )}

          {/* Shape Selector */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Adaptive Shape Profile</label>
            <div className="grid grid-cols-3 gap-1.5 text-[11px]">
              {(["squircle", "circle", "rounded_rect", "hexagon", "teardrop"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setConfig((prev) => ({ ...prev, shape: s }))}
                  className={`py-1 px-2 rounded-lg border capitalize truncate transition-all ${
                    config.shape === s
                      ? "bg-sky-500/20 border-sky-500 text-sky-400 font-bold"
                      : "border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  {s.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Color Palettes */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Primary Color</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={config.primaryColor}
                  onChange={(e) => setConfig((prev) => ({ ...prev, primaryColor: e.target.value }))}
                  className="w-7 h-7 rounded-md cursor-pointer border border-slate-700 bg-transparent"
                />
                <span className="text-[10px] font-mono text-slate-400">{config.primaryColor}</span>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Secondary Gradient</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={config.secondaryColor}
                  onChange={(e) => setConfig((prev) => ({ ...prev, secondaryColor: e.target.value }))}
                  className="w-7 h-7 rounded-md cursor-pointer border border-slate-700 bg-transparent"
                />
                <span className="text-[10px] font-mono text-slate-400">{config.secondaryColor}</span>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Accent Glow</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={config.accentColor}
                  onChange={(e) => setConfig((prev) => ({ ...prev, accentColor: e.target.value }))}
                  className="w-7 h-7 rounded-md cursor-pointer border border-slate-700 bg-transparent"
                />
                <span className="text-[10px] font-mono text-slate-400">{config.accentColor}</span>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Symbol Color</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={config.symbolColor}
                  onChange={(e) => setConfig((prev) => ({ ...prev, symbolColor: e.target.value }))}
                  className="w-7 h-7 rounded-md cursor-pointer border border-slate-700 bg-transparent"
                />
                <span className="text-[10px] font-mono text-slate-400">{config.symbolColor}</span>
              </div>
            </div>
          </div>

          {/* Size Slider */}
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Symbol Scale</span>
              <span className="font-mono">{config.symbolSize}%</span>
            </div>
            <input
              type="range"
              min={35}
              max={75}
              value={config.symbolSize}
              onChange={(e) => setConfig((prev) => ({ ...prev, symbolSize: Number(e.target.value) }))}
              className="w-full accent-sky-500"
            />
          </div>

          {/* Effects Toggles */}
          <div className="flex items-center justify-between text-[11px] pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={config.hasGlow}
                onChange={(e) => setConfig((prev) => ({ ...prev, hasGlow: e.target.checked }))}
                className="rounded accent-sky-500"
              />
              <span>Ambient Glow Flare</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={config.hasInnerBorder}
                onChange={(e) => setConfig((prev) => ({ ...prev, hasInnerBorder: e.target.checked }))}
                className="rounded accent-sky-500"
              />
              <span>Inner Light Border</span>
            </label>
          </div>
        </div>

        {/* Primary Action Button to Inject into res/mipmap */}
        <div className="pt-2">
          <button
            onClick={handleApplyToProject}
            disabled={isApplying}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs py-3 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isApplying ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 fill-slate-950 text-emerald-400" />
            )}
            <span>{isApplying ? "Updating res/mipmap..." : "Apply to Project (Update res/mipmap)"}</span>
          </button>
        </div>

        {applySuccess && (
          <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-[11px] text-emerald-300 leading-relaxed animate-in fade-in">
            {applySuccess}
          </div>
        )}
      </div>

      {/* Right Column: Live Previews across Densities & Android Home Screen */}
      <div className="flex-1 flex flex-col overflow-hidden p-6">
        {/* Preview Tabs */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-sky-400" />
            <span className="font-bold text-xs text-slate-300">Live Render & Device Simulation</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setPreviewSizeTab("homescreen")}
              className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
                previewSizeTab === "homescreen"
                  ? "bg-sky-500/20 border-sky-500 text-sky-400 font-bold"
                  : "border-transparent text-slate-400 hover:bg-slate-800"
              }`}
            >
              📱 Home Screen View
            </button>

            <button
              onClick={() => setPreviewSizeTab("densities")}
              className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
                previewSizeTab === "densities"
                  ? "bg-sky-500/20 border-sky-500 text-sky-400 font-bold"
                  : "border-transparent text-slate-400 hover:bg-slate-800"
              }`}
            >
              📐 Screen Densities (mdpi - xxxhdpi)
            </button>

            <button
              onClick={() => setPreviewSizeTab("store")}
              className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
                previewSizeTab === "store"
                  ? "bg-sky-500/20 border-sky-500 text-sky-400 font-bold"
                  : "border-transparent text-slate-400 hover:bg-slate-800"
              }`}
            >
              ⭐ 512px Play Store
            </button>
          </div>
        </div>

        {/* Viewport Content */}
        <div className="flex-1 flex items-center justify-center overflow-auto custom-scrollbar">
          {previewSizeTab === "homescreen" && (
            <div className="w-80 h-[520px] bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 border-8 border-slate-800 rounded-[2.5rem] shadow-2xl p-4 flex flex-col justify-between relative overflow-hidden">
              {/* Notch */}
              <div className="w-20 h-4 bg-slate-800 rounded-full mx-auto" />

              {/* Home Screen App Grid */}
              <div className="grid grid-cols-4 gap-4 px-2 pt-6">
                {/* Generated App Icon on Launcher */}
                <div className="flex flex-col items-center gap-1 group cursor-pointer animate-pulse">
                  <div
                    className="w-14 h-14 rounded-2xl shadow-xl transition-transform hover:scale-105"
                    dangerouslySetInnerHTML={{ __html: currentMasterSvg }}
                  />
                  <span className="text-[10px] text-white font-semibold text-center truncate max-w-[64px]">
                    {appName || "My App"}
                  </span>
                </div>

                {/* Dummy apps to simulate real launcher */}
                <div className="flex flex-col items-center gap-1 opacity-60">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-700 flex items-center justify-center text-white text-xl shadow">
                    📞
                  </div>
                  <span className="text-[10px] text-slate-300">Phone</span>
                </div>

                <div className="flex flex-col items-center gap-1 opacity-60">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-700 flex items-center justify-center text-white text-xl shadow">
                    📷
                  </div>
                  <span className="text-[10px] text-slate-300">Camera</span>
                </div>

                <div className="flex flex-col items-center gap-1 opacity-60">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-700 flex items-center justify-center text-white text-xl shadow">
                    ⚙️
                  </div>
                  <span className="text-[10px] text-slate-300">Settings</span>
                </div>
              </div>

              {/* Bottom Dock Bar */}
              <div className="bg-slate-800/60 backdrop-blur-md rounded-3xl p-3 grid grid-cols-4 gap-3">
                <div className="w-11 h-11 bg-sky-500 rounded-2xl mx-auto flex items-center justify-center text-white text-base">
                  💬
                </div>
                <div className="w-11 h-11 bg-rose-500 rounded-2xl mx-auto flex items-center justify-center text-white text-base">
                  🎵
                </div>
                <div className="w-11 h-11 bg-amber-500 rounded-2xl mx-auto flex items-center justify-center text-white text-base">
                  🌐
                </div>
                <div
                  className="w-11 h-11 rounded-2xl mx-auto overflow-hidden shadow-lg"
                  dangerouslySetInnerHTML={{ __html: currentRoundSvg }}
                />
              </div>
            </div>
          )}

          {previewSizeTab === "densities" && (
            <div className="space-y-6 max-w-2xl w-full">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="font-bold text-xs text-slate-200 flex items-center gap-2">
                    <FolderTree className="w-4 h-4 text-emerald-400" />
                    <span>Target Android Screen Density Map (Auto-Injected)</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Standard Google Android Specs</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                  {/* xxxhdpi */}
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center gap-2">
                    <div
                      className="w-16 h-16 rounded-xl overflow-hidden shadow-md"
                      dangerouslySetInnerHTML={{ __html: currentMasterSvg }}
                    />
                    <div className="font-bold text-[11px] text-sky-400">xxxhdpi</div>
                    <div className="text-[10px] text-slate-500">192 × 192 px</div>
                  </div>

                  {/* xxhdpi */}
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center gap-2">
                    <div
                      className="w-14 h-14 rounded-xl overflow-hidden shadow-md"
                      dangerouslySetInnerHTML={{ __html: currentMasterSvg }}
                    />
                    <div className="font-bold text-[11px] text-sky-400">xxhdpi</div>
                    <div className="text-[10px] text-slate-500">144 × 144 px</div>
                  </div>

                  {/* xhdpi */}
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center gap-2">
                    <div
                      className="w-12 h-12 rounded-xl overflow-hidden shadow-md"
                      dangerouslySetInnerHTML={{ __html: currentMasterSvg }}
                    />
                    <div className="font-bold text-[11px] text-sky-400">xhdpi</div>
                    <div className="text-[10px] text-slate-500">96 × 96 px</div>
                  </div>

                  {/* hdpi */}
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center gap-2">
                    <div
                      className="w-10 h-10 rounded-xl overflow-hidden shadow-md"
                      dangerouslySetInnerHTML={{ __html: currentMasterSvg }}
                    />
                    <div className="font-bold text-[11px] text-sky-400">hdpi</div>
                    <div className="text-[10px] text-slate-500">72 × 72 px</div>
                  </div>

                  {/* mdpi */}
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg overflow-hidden shadow-md"
                      dangerouslySetInnerHTML={{ __html: currentMasterSvg }}
                    />
                    <div className="font-bold text-[11px] text-sky-400">mdpi</div>
                    <div className="text-[10px] text-slate-500">48 × 48 px</div>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                  💡 جب آپ <strong className="text-emerald-400">"Apply to Project"</strong> پر کلک کرتے ہیں تو یہ تمام 5 ڈینسٹیز، ان کے Round ورژنز اور Adaptive XMLs (<code className="text-sky-300">mipmap-anydpi-v26/ic_launcher.xml</code>) خودکار طور پر پروجیکٹ میں شامل ہو جاتے ہیں۔
                </div>
              </div>
            </div>
          )}

          {previewSizeTab === "store" && (
            <div className="flex flex-col items-center gap-4">
              <div
                className="w-64 h-64 rounded-3xl shadow-2xl overflow-hidden border-4 border-slate-800"
                dangerouslySetInnerHTML={{ __html: currentMasterSvg }}
              />
              <div className="text-center">
                <div className="font-bold text-sm text-slate-200">Google Play Store Master Icon</div>
                <div className="text-xs text-slate-500 font-mono">512 × 512 px (Hi-Res 32-bit PNG)</div>
                <div className="text-[11px] text-emerald-400 font-semibold mt-1">
                  Saved at: <code className="text-slate-300">app/src/main/ic_launcher-playstore.png</code>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
