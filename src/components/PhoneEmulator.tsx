import React, { useState } from "react";
import {
  Smartphone,
  Tablet,
  RotateCw,
  Sun,
  Moon,
  Wifi,
  Battery,
  Sparkles,
  Check,
  Globe,
  Bot,
  Send,
  Camera,
  Mic,
} from "lucide-react";
import { AndroidProject } from "../types";

interface PhoneEmulatorProps {
  layoutXml: string;
  appName: string;
  ideTheme?: "dark" | "light";
  project?: AndroidProject;
}

type DevicePreset = "pixel" | "iphone" | "tablet" | "foldable" | "desktop";

export const PhoneEmulator: React.FC<PhoneEmulatorProps> = ({
  layoutXml,
  appName,
  ideTheme = "dark",
  project,
}) => {
  const [devicePreset, setDevicePreset] = useState<DevicePreset>("pixel");
  const [isDeviceDarkMode, setIsDeviceDarkMode] = useState(true);
  const [isLandscape, setIsLandscape] = useState(false);
  const [viewMode, setViewMode] = useState<"app" | "playstore">("app");
  const [playStoreInstallStatus, setPlayStoreInstallStatus] = useState<"idle" | "installing" | "installed">("idle");
  const [toastText, setToastText] = useState<string | null>(null);
  
  // Interactive Chat inside the Emulator
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    { sender: "ai", text: `✨ Welcome to ${appName}! I am your Google AI Studio assistant running on Android APK with Gemini AI and native hardware acceleration.` }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isAiReplying, setIsAiReplying] = useState(false);

  const triggerToast = (msg: string) => {
    setToastText(msg);
    setTimeout(() => setToastText(null), 2500);
  };

  const handleSimulatePlayStoreInstall = () => {
    setPlayStoreInstallStatus("installing");
    setTimeout(() => {
      setPlayStoreInstallStatus("installed");
      triggerToast("App Successfully Installed from Google Play Store!");
    }, 1500);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isAiReplying) return;

    const userText = inputVal.trim();
    setChatMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setInputVal("");
    setIsAiReplying(true);
    triggerToast("Haptic Feedback: Input Sent");

    setTimeout(() => {
      let aiText = `I processed your request "${userText}". Google AI Studio native Android APK bridge executed successfully!`;
      if (userText.toLowerCase().includes("camera") || userText.toLowerCase().includes("photo")) {
        aiText = `📷 Camera permission granted! In the native APK, this activates CameraX and Gemini Vision processing.`;
      } else if (userText.toLowerCase().includes("voice") || userText.toLowerCase().includes("mic")) {
        aiText = `🎙️ Audio recording active! Real-time streaming to Gemini Live API supported.`;
      }
      setChatMessages((prev) => [...prev, { sender: "ai", text: aiText }]);
      setIsAiReplying(false);
    }, 600);
  };

  // Simple XML parser to extract title and buttons from activity_main.xml
  const extractTitleFromXml = () => {
    const textMatch = layoutXml.match(/android:text="([^"]+)"/g);
    if (textMatch && textMatch.length > 0) {
      return textMatch[0].replace('android:text="', "").replace('"', "");
    }
    return appName;
  };

  // Dimension matrix for devices
  const getDeviceDimensions = () => {
    switch (devicePreset) {
      case "pixel":
        return isLandscape ? "w-[620px] h-[340px]" : "w-[340px] h-[620px]";
      case "iphone":
        return isLandscape ? "w-[600px] h-[320px]" : "w-[320px] h-[600px]";
      case "tablet":
        return isLandscape ? "w-[720px] h-[480px]" : "w-[480px] h-[720px]";
      case "foldable":
        return isLandscape ? "w-[680px] h-[520px]" : "w-[520px] h-[680px]";
      case "desktop":
        return "w-[800px] h-[500px]";
      default:
        return "w-[340px] h-[620px]";
    }
  };

  const getDeviceLabel = () => {
    switch (devicePreset) {
      case "pixel":
        return "Google Pixel 8 Pro (1080 x 2400)";
      case "iphone":
        return "Compact Smartphone (1080 x 2340)";
      case "tablet":
        return "Android Tablet 10.5\" (1600 x 2560)";
      case "foldable":
        return "Foldable Dual Screen (2176 x 1812)";
      case "desktop":
        return "Android TV / ChromeOS Desktop (1920 x 1080)";
    }
  };

  // Check if project is Google AI Studio
  const isGoogleAIStudio = project?.files.some(
    (f) => f.path.includes("metadata.json") || f.content.includes("Google AI Studio") || f.path.includes("assets/dist/index.html")
  );

  return (
    <div
      className={`flex-1 flex flex-col items-center justify-center p-6 h-full overflow-auto relative select-none transition-colors ${
        ideTheme === "light" ? "bg-slate-100 text-slate-800" : "bg-slate-950 text-slate-100"
      }`}
    >
      {/* Device Controls Bar */}
      <div
        className={`mb-4 border px-4 py-2.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-lg ${
          ideTheme === "light"
            ? "bg-white border-slate-200 text-slate-800"
            : "bg-slate-900 border-slate-800 text-slate-200"
        }`}
      >
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 mr-1">Device:</span>

          <button
            onClick={() => setDevicePreset("pixel")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
              devicePreset === "pixel"
                ? "bg-sky-500/20 border-sky-500 text-sky-400 font-bold"
                : "border-transparent hover:bg-slate-800/20 text-slate-400"
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Pixel 8</span>
          </button>

          <button
            onClick={() => setDevicePreset("tablet")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
              devicePreset === "tablet"
                ? "bg-sky-500/20 border-sky-500 text-sky-400 font-bold"
                : "border-transparent hover:bg-slate-800/20 text-slate-400"
            }`}
          >
            <Tablet className="w-4 h-4" />
            <span>Tablet</span>
          </button>

          <button
            onClick={() => setIsLandscape(!isLandscape)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 hover:bg-slate-800/20 text-slate-300 transition-colors"
            title="Rotate Device Orientation"
          >
            <RotateCw className="w-3.5 h-3.5 text-sky-400" />
            <span>{isLandscape ? "Landscape" : "Portrait"}</span>
          </button>
        </div>

        {/* View Mode & OS Theme Toggle */}
        <div className="flex items-center gap-2">
          {viewMode === "app" ? (
            <button
              onClick={() => setViewMode("playstore")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors font-medium"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Google Play View</span>
            </button>
          ) : (
            <button
              onClick={() => setViewMode("app")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-sky-500/40 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 transition-colors font-medium"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Live App View</span>
            </button>
          )}

          <button
            onClick={() => setIsDeviceDarkMode(!isDeviceDarkMode)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 hover:bg-slate-800/20 text-purple-400 transition-colors font-medium"
            title="Toggle Android OS Day/Night Mode"
          >
            {isDeviceDarkMode ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
            <span>{isDeviceDarkMode ? "Night" : "Day"}</span>
          </button>
        </div>
      </div>

      {/* Viewport Specs Badge */}
      <div className="mb-3 text-[11px] font-mono text-slate-400 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>{getDeviceLabel()}</span>
        <span className="text-slate-600">•</span>
        <span className="text-sky-400 font-semibold">Google AI Studio Android Runtime</span>
      </div>

      {/* Device Shell Frame */}
      <div
        className={`bg-slate-900 border-8 border-slate-800 rounded-[2.5rem] shadow-2xl transition-all relative overflow-hidden flex flex-col ${getDeviceDimensions()}`}
      >
        {/* Status Bar */}
        <div
          className={`px-6 py-2 flex justify-between items-center text-[10px] font-mono select-none ${
            isDeviceDarkMode ? "bg-slate-950 text-slate-400" : "bg-slate-200 text-slate-700"
          }`}
        >
          <span>09:41 AM</span>
          <div className="w-16 h-3 bg-slate-800 rounded-full mx-auto" />
          <div className="flex items-center gap-2">
            <Wifi className="w-3 h-3 text-emerald-400" />
            <Battery className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </div>

        {/* Screen Content Viewport */}
        <div
          className={`flex-1 flex flex-col justify-between overflow-y-auto relative transition-colors ${
            isDeviceDarkMode ? "bg-slate-950 text-white" : "bg-white text-slate-900"
          }`}
        >
          {viewMode === "playstore" ? (
            /* Play Store Listing Simulation Page */
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Play Store Header */}
                <div className="flex items-center justify-between border-b border-slate-800/40 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-emerald-500 rounded-md flex items-center justify-center text-[10px] font-bold text-slate-950">
                      ▶
                    </div>
                    <span className="font-bold text-xs tracking-wider uppercase text-slate-400">Google Play Store</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                    Google AI Studio APK
                  </span>
                </div>

                {/* App Listing Card */}
                <div className="flex items-start gap-4 pt-1">
                  <div className="w-16 h-16 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shrink-0 text-white font-bold text-xl">
                    ✨
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base leading-snug truncate">{appName || "Google AI Studio App"}</h3>
                    <p className="text-xs text-sky-400 font-semibold">Google AI Studio • Verified Developer</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Gemini 1.5 Powered • Free</p>
                  </div>
                </div>

                {/* Play Store Metrics */}
                <div className="grid grid-cols-3 gap-2 text-center py-2 border-y border-slate-800/40 text-xs">
                  <div>
                    <div className="font-bold text-amber-400">5.0 ★</div>
                    <div className="text-[10px] text-slate-400">24K reviews</div>
                  </div>
                  <div className="border-x border-slate-800/40">
                    <div className="font-bold text-slate-200">5.1 MB</div>
                    <div className="text-[10px] text-slate-400">APK Size</div>
                  </div>
                  <div>
                    <div className="font-bold text-emerald-400">3+</div>
                    <div className="text-[10px] text-slate-400">Rated for 3+</div>
                  </div>
                </div>

                {/* Play Store Install CTA Button */}
                <div>
                  {playStoreInstallStatus === "idle" && (
                    <button
                      onClick={handleSimulatePlayStoreInstall}
                      className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-3 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Install APK (One-Touch Google Play)</span>
                    </button>
                  )}

                  {playStoreInstallStatus === "installing" && (
                    <div className="w-full bg-slate-800 text-emerald-400 text-xs py-3 rounded-xl font-bold flex items-center justify-center gap-2 border border-emerald-500/40 animate-pulse">
                      <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                      <span>Downloading & Installing package...</span>
                    </div>
                  )}

                  {playStoreInstallStatus === "installed" && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewMode("app")}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-3 rounded-xl shadow-lg flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Open Installed App</span>
                      </button>
                      <button
                        onClick={() => setPlayStoreInstallStatus("idle")}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-3 rounded-xl border border-slate-700 font-medium"
                      >
                        Uninstall
                      </button>
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 leading-relaxed pt-1">
                  <p className="font-semibold text-slate-200 mb-1">About this app</p>
                  <p className="line-clamp-3">
                    Exported directly from Google AI Studio and converted to Android native APK with complete Gradle build-tools, Material 3 theming, and AndroidX WebKit.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Interactive Live App Screen */
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              {/* App Bar */}
              <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
                    ✨
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-white leading-tight truncate max-w-[150px]">
                      {appName || extractTitleFromXml()}
                    </h3>
                    <p className="text-[9px] text-sky-400">Google AI Studio • Native APK</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => triggerToast("📷 Camera Access Ready")}
                    className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white text-xs"
                    title="Test Camera Permission"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => triggerToast("🎙️ Audio Recorder Ready")}
                    className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white text-xs"
                    title="Test Microphone Permission"
                  >
                    <Mic className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Chat & UI Output List */}
              <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
                {chatMessages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`p-2.5 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                        m.sender === "user"
                          ? "bg-sky-600 text-white rounded-tr-none shadow-md font-medium"
                          : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}

                {isAiReplying && (
                  <div className="flex items-center gap-2 text-slate-400 text-[11px] p-1">
                    <div className="w-3 h-3 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                    <span>Gemini is generating response...</span>
                  </div>
                )}
              </div>

              {/* Interactive Input Form */}
              <form onSubmit={handleSendMessage} className="p-2.5 bg-slate-900 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  placeholder="Ask Gemini or test touch input..."
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
                <button
                  type="submit"
                  disabled={!inputVal.trim() || isAiReplying}
                  className="bg-sky-600 hover:bg-sky-500 text-white font-bold p-2 rounded-xl text-xs disabled:opacity-40 shadow transition-transform active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}

          {/* Floating Toast Notification Popup */}
          {toastText && (
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-slate-800/95 text-white text-[11px] px-3.5 py-1.5 rounded-full shadow-2xl border border-slate-700 font-mono animate-bounce z-20 whitespace-nowrap">
              {toastText}
            </div>
          )}

          {/* Android System Navigation Bar */}
          <div className="py-2 flex justify-center items-center bg-slate-950">
            <div className="w-28 h-1 bg-slate-700 rounded-full cursor-pointer hover:bg-slate-500 transition-colors" onClick={() => triggerToast("System Home Key Pressed")} />
          </div>
        </div>
      </div>
    </div>
  );
};
