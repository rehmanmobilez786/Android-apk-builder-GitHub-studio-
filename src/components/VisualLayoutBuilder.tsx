import React, { useState, useEffect } from "react";
import {
  Type,
  Square,
  Image,
  Edit3,
  Layers,
  Plus,
  Trash2,
  Layout,
  ToggleLeft,
  Sliders,
  Sparkles,
  Wand2,
} from "lucide-react";
import { LayoutComponent, AndroidFile } from "../types";
import { AppIconStudio } from "./AppIconStudio";

interface VisualLayoutBuilderProps {
  layoutXml: string;
  onXmlChange: (newXml: string) => void;
  appName?: string;
  onApplyMipmapFiles?: (newFiles: AndroidFile[]) => void;
  ideTheme?: "dark" | "light";
  onTriggerAutoSync?: () => void;
  isAutoSyncEnabled?: boolean;
}

const PALETTE_ITEMS: { type: LayoutComponent["type"]; label: string; icon: any }[] = [
  { type: "TextView", label: "TextView", icon: Type },
  { type: "Button", label: "Button", icon: Square },
  { type: "EditText", label: "EditText Input", icon: Edit3 },
  { type: "ImageView", label: "ImageView", icon: Image },
  { type: "CardView", label: "CardView Container", icon: Layers },
  { type: "RecyclerView", label: "RecyclerView List", icon: Layout },
  { type: "FloatingActionButton", label: "Floating Action Button", icon: Plus },
  { type: "Switch", label: "Switch Toggle", icon: ToggleLeft },
  { type: "ProgressBar", label: "ProgressBar Indicator", icon: Sliders },
];

export const VisualLayoutBuilder: React.FC<VisualLayoutBuilderProps> = ({
  layoutXml,
  onXmlChange,
  appName = "Google AI Studio App",
  onApplyMipmapFiles,
  ideTheme = "dark",
  onTriggerAutoSync,
  isAutoSyncEnabled = false,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"layout" | "icon">("icon");

  const [components, setComponents] = useState<LayoutComponent[]>([
    {
      id: "comp-1",
      type: "TextView",
      label: "App Title",
      attributes: {
        text: "Android Studio Visual Builder",
        textColor: "#FFFFFF",
        textSize: "20sp",
        textStyle: "bold",
        layout_marginBottom: "12dp",
      },
    },
    {
      id: "comp-2",
      type: "Button",
      label: "Submit Button",
      attributes: {
        text: "Click to Perform Action",
        backgroundTint: "#3B82F6",
        textColor: "#FFFFFF",
        paddingHorizontal: "24dp",
        paddingVertical: "10dp",
      },
    },
  ]);

  const [selectedId, setSelectedId] = useState<string | null>("comp-1");

  const selectedComponent = components.find((c) => c.id === selectedId);

  const addComponent = (type: LayoutComponent["type"]) => {
    const newComp: LayoutComponent = {
      id: `comp-${Date.now()}`,
      type,
      label: `${type} Element`,
      attributes: {
        text: type === "TextView" ? "Sample Text" : type === "Button" ? "Click Here" : "Input value...",
        textColor: "#FFFFFF",
        textSize: "14sp",
        layout_width: "match_parent",
        layout_height: "wrap_content",
        background: type === "CardView" ? "#1E293B" : "transparent",
      },
    };
    setComponents((prev) => [...prev, newComp]);
    setSelectedId(newComp.id);
  };

  const removeComponent = (id: string) => {
    setComponents((prev) => prev.filter((c) => c.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const updateAttribute = (attrKey: string, value: string) => {
    if (!selectedId) return;
    setComponents((prev) =>
      prev.map((c) => {
        if (c.id === selectedId) {
          return {
            ...c,
            attributes: { ...c.attributes, [attrKey]: value },
          };
        }
        return c;
      })
    );
  };

  // Convert visual components state to valid Android XML string
  const generateXmlFromComponents = (): string => {
    let xml = `<?xml version="1.0" encoding="utf-8"?>\n<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"\n    android:layout_width="match_parent"\n    android:layout_height="match_parent"\n    android:orientation="vertical"\n    android:padding="20dp"\n    android:background="#0F172A">\n\n`;

    components.forEach((c) => {
      xml += `    <${c.type}\n`;
      xml += `        android:id="@+id/id_${c.id.replace("-", "_")}"\n`;
      xml += `        android:layout_width="${c.attributes.layout_width || "match_parent"}"\n`;
      xml += `        android:layout_height="${c.attributes.layout_height || "wrap_content"}"\n`;

      if (c.attributes.text) {
        xml += `        android:text="${c.attributes.text}"\n`;
      }
      if (c.attributes.textColor) {
        xml += `        android:textColor="${c.attributes.textColor}"\n`;
      }
      if (c.attributes.textSize) {
        xml += `        android:textSize="${c.attributes.textSize}"\n`;
      }
      if (c.attributes.backgroundTint) {
        xml += `        android:backgroundTint="${c.attributes.backgroundTint}"\n`;
      }
      if (c.attributes.paddingHorizontal) {
        xml += `        android:paddingHorizontal="${c.attributes.paddingHorizontal}"\n`;
      }
      if (c.attributes.layout_marginBottom) {
        xml += `        android:layout_marginBottom="${c.attributes.layout_marginBottom}"\n`;
      }

      xml += `        android:layout_marginVertical="6dp" />\n\n`;
    });

    xml += `</LinearLayout>`;
    return xml;
  };

  // Sync to layoutXml on component edits
  useEffect(() => {
    if (activeSubTab === "layout") {
      const xml = generateXmlFromComponents();
      onXmlChange(xml);
    }
  }, [components, activeSubTab]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Top Sub-Navigation Bar in Visual Builder */}
      <div
        className={`px-4 py-2 border-b flex items-center justify-between text-xs shrink-0 select-none ${
          ideTheme === "light" ? "bg-slate-100 border-slate-200" : "bg-slate-900 border-slate-800"
        }`}
      >
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveSubTab("icon")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              activeSubTab === "icon"
                ? "bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md"
                : ideTheme === "light"
                ? "text-slate-600 hover:bg-slate-200"
                : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI App Icon & Mipmap Studio (لوگو جنریٹر)</span>
            <span className="bg-white/20 text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">
              res/mipmap
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab("layout")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              activeSubTab === "layout"
                ? "bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md"
                : ideTheme === "light"
                ? "text-slate-600 hover:bg-slate-200"
                : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>UI Layout Designer (XML)</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Google AI Studio Visual Engine Active</span>
        </div>
      </div>

      {/* Main View Area */}
      {activeSubTab === "icon" ? (
        <AppIconStudio
          appName={appName}
          onApplyMipmapFiles={onApplyMipmapFiles || (() => {})}
          ideTheme={ideTheme}
          onTriggerAutoSync={onTriggerAutoSync}
          isAutoSyncEnabled={isAutoSyncEnabled}
        />
      ) : (
        <div className="flex-1 flex bg-slate-950 h-full overflow-hidden text-slate-200">
          {/* Left Palette: Drag/Add UI Components */}
          <div className="w-56 bg-slate-900 border-r border-slate-800 p-3 flex flex-col gap-3 select-none">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-400 tracking-wider">
              <Plus className="w-4 h-4 text-sky-400" />
              <span>UI Components</span>
            </div>

            <div className="space-y-1.5 overflow-y-auto flex-1 custom-scrollbar">
              {PALETTE_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.type}
                    onClick={() => addComponent(item.type)}
                    className="w-full flex items-center gap-2.5 p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-sky-500/50 hover:bg-sky-500/10 text-xs text-slate-300 font-medium transition-all group"
                  >
                    <Icon className="w-4 h-4 text-slate-400 group-hover:text-sky-400 transition-colors" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Middle Interactive Canvas */}
          <div className="flex-1 p-6 bg-slate-950 flex flex-col items-center justify-center overflow-auto custom-scrollbar">
            <div className="w-full max-w-sm bg-slate-900 border-4 border-slate-800 rounded-3xl p-4 shadow-2xl flex flex-col min-h-[500px] relative">
              {/* Phone Header Bar */}
              <div className="flex justify-between items-center text-[10px] text-slate-400 mb-4 px-1 pb-2 border-b border-slate-800/80">
                <span>9:41 AM</span>
                <div className="w-12 h-2.5 bg-slate-800 rounded-full" />
                <span>100% 🔋</span>
              </div>

              {/* Render Components List */}
              <div className="flex-1 flex flex-col gap-3 p-2 bg-slate-950/80 rounded-xl border border-slate-800 min-h-[380px]">
                {components.map((comp) => {
                  const isSelected = comp.id === selectedId;

                  return (
                    <div
                      key={comp.id}
                      onClick={() => setSelectedId(comp.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-all border relative ${
                        isSelected
                          ? "border-sky-400 bg-sky-500/15 ring-2 ring-sky-500/30"
                          : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
                      }`}
                    >
                      {comp.type === "TextView" && (
                        <span
                          style={{
                            color: comp.attributes.textColor || "#FFFFFF",
                            fontSize: comp.attributes.textSize || "14sp",
                            fontWeight: comp.attributes.textStyle === "bold" ? "bold" : "normal",
                          }}
                        >
                          {comp.attributes.text || "TextView"}
                        </span>
                      )}

                      {comp.type === "Button" && (
                        <button
                          className="w-full py-2 px-4 rounded font-bold text-xs shadow transition-all"
                          style={{
                            backgroundColor: comp.attributes.backgroundTint || "#3B82F6",
                            color: comp.attributes.textColor || "#FFFFFF",
                          }}
                        >
                          {comp.attributes.text || "Button"}
                        </button>
                      )}

                      {comp.type === "EditText" && (
                        <div className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-xs text-slate-400">
                          {comp.attributes.text || "Enter text input..."}
                        </div>
                      )}

                      {comp.type === "CardView" && (
                        <div className="p-4 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-300">
                          CardView Container
                        </div>
                      )}

                      {comp.type === "ImageView" && (
                        <div className="w-full h-24 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center text-slate-500 text-xs">
                          [ ImageView Graphic ]
                        </div>
                      )}

                      {isSelected && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeComponent(comp.id);
                          }}
                          className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-400 bg-slate-900 rounded border border-slate-700"
                          title="Delete element"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Attribute Inspector Panel */}
          <div className="w-64 bg-slate-900 border-l border-slate-800 p-4 flex flex-col gap-4 text-xs select-none">
            <div className="font-bold text-slate-200 border-b border-slate-800 pb-2">
              XML Inspector
            </div>

            {selectedComponent ? (
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Component Type</label>
                  <input
                    type="text"
                    value={selectedComponent.type}
                    disabled
                    className="w-full bg-slate-950 border border-slate-800 text-slate-400 px-2.5 py-1.5 rounded"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">android:text</label>
                  <input
                    type="text"
                    value={selectedComponent.attributes.text || ""}
                    onChange={(e) => updateAttribute("text", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 px-2.5 py-1.5 rounded focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">android:textColor</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={selectedComponent.attributes.textColor || "#FFFFFF"}
                      onChange={(e) => updateAttribute("textColor", e.target.value)}
                      className="w-8 h-8 rounded bg-transparent cursor-pointer border border-slate-700"
                    />
                    <input
                      type="text"
                      value={selectedComponent.attributes.textColor || "#FFFFFF"}
                      onChange={(e) => updateAttribute("textColor", e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-700 text-slate-100 px-2.5 py-1.5 rounded focus:outline-none"
                    />
                  </div>
                </div>

                {selectedComponent.type === "Button" && (
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">android:backgroundTint</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={selectedComponent.attributes.backgroundTint || "#3B82F6"}
                        onChange={(e) => updateAttribute("backgroundTint", e.target.value)}
                        className="w-8 h-8 rounded bg-transparent cursor-pointer border border-slate-700"
                      />
                      <input
                        type="text"
                        value={selectedComponent.attributes.backgroundTint || "#3B82F6"}
                        onChange={(e) => updateAttribute("backgroundTint", e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-700 text-slate-100 px-2.5 py-1.5 rounded focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">android:textSize</label>
                  <select
                    value={selectedComponent.attributes.textSize || "14sp"}
                    onChange={(e) => updateAttribute("textSize", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 px-2.5 py-1.5 rounded"
                  >
                    <option value="12sp">12sp Small</option>
                    <option value="14sp">14sp Regular</option>
                    <option value="18sp">18sp Subtitle</option>
                    <option value="22sp">22sp Heading</option>
                    <option value="28sp">28sp Display</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="text-slate-500 text-center py-8">Select an element on canvas to modify attributes</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
