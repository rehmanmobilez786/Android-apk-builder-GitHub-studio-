import { AndroidFile } from "../types";

export interface IconDesignConfig {
  appName: string;
  symbol: string; // Icon identifier or monogram text
  symbolType: "icon" | "text" | "emoji";
  shape: "squircle" | "circle" | "rounded_rect" | "hexagon" | "teardrop";
  backgroundType: "linear_gradient" | "radial_gradient" | "solid" | "mesh";
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  symbolColor: string;
  symbolSize: number; // percentage 30 - 80
  hasGlow: boolean;
  hasInnerBorder: boolean;
  shadowIntensity: number; // 0 - 100
  monogramText?: string;
}

export const DEFAULT_ICON_CONFIG: IconDesignConfig = {
  appName: "Google AI Studio App",
  symbol: "Sparkles",
  symbolType: "icon",
  shape: "squircle",
  backgroundType: "linear_gradient",
  primaryColor: "#0284C7", // Sky 600
  secondaryColor: "#6366F1", // Indigo 500
  accentColor: "#38BDF8", // Sky 400
  symbolColor: "#FFFFFF",
  symbolSize: 56,
  hasGlow: true,
  hasInnerBorder: true,
  shadowIntensity: 45,
  monogramText: "AI",
};

export const PRESET_ICON_THEMES: Array<{
  id: string;
  name: string;
  category: string;
  config: Partial<IconDesignConfig>;
}> = [
  {
    id: "gemini_sparkle",
    name: "Gemini AI Quantum",
    category: "AI & Tech",
    config: {
      symbol: "Sparkles",
      symbolType: "icon",
      shape: "squircle",
      backgroundType: "linear_gradient",
      primaryColor: "#0ea5e9",
      secondaryColor: "#6366f1",
      accentColor: "#38bdf8",
      symbolColor: "#ffffff",
      hasGlow: true,
      hasInnerBorder: true,
    },
  },
  {
    id: "neural_brain",
    name: "Neural Core",
    category: "AI & Tech",
    config: {
      symbol: "Brain",
      symbolType: "icon",
      shape: "circle",
      backgroundType: "radial_gradient",
      primaryColor: "#8b5cf6",
      secondaryColor: "#3b82f6",
      accentColor: "#c084fc",
      symbolColor: "#ffffff",
      hasGlow: true,
    },
  },
  {
    id: "cyber_shield",
    name: "Cyber Security",
    category: "Security",
    config: {
      symbol: "Shield",
      symbolType: "icon",
      shape: "hexagon",
      backgroundType: "linear_gradient",
      primaryColor: "#1e293b",
      secondaryColor: "#0f172a",
      accentColor: "#10b981",
      symbolColor: "#10b981",
      hasGlow: true,
      hasInnerBorder: true,
    },
  },
  {
    id: "cosmic_rocket",
    name: "Cosmo Launch",
    category: "Productivity",
    config: {
      symbol: "Rocket",
      symbolType: "icon",
      shape: "squircle",
      backgroundType: "linear_gradient",
      primaryColor: "#f43f5e",
      secondaryColor: "#8b5cf6",
      accentColor: "#fb7185",
      symbolColor: "#ffffff",
      hasGlow: true,
    },
  },
  {
    id: "ecommerce_cart",
    name: "ShopSphere Store",
    category: "E-Commerce",
    config: {
      symbol: "ShoppingBag",
      symbolType: "icon",
      shape: "squircle",
      backgroundType: "linear_gradient",
      primaryColor: "#10b981",
      secondaryColor: "#059669",
      accentColor: "#34d399",
      symbolColor: "#ffffff",
      hasGlow: false,
    },
  },
  {
    id: "bolt_speed",
    name: "Turbo Lightning",
    category: "Utilities",
    config: {
      symbol: "Zap",
      symbolType: "icon",
      shape: "teardrop",
      backgroundType: "linear_gradient",
      primaryColor: "#f59e0b",
      secondaryColor: "#d97706",
      accentColor: "#fde047",
      symbolColor: "#ffffff",
      hasGlow: true,
    },
  },
];

/**
 * Renders an SVG representation of the App Icon based on configuration.
 */
export function generateIconSvg(config: IconDesignConfig, size: number = 512, isRound: boolean = false): string {
  const {
    symbol,
    symbolType,
    shape,
    backgroundType,
    primaryColor,
    secondaryColor,
    accentColor,
    symbolColor,
    symbolSize,
    hasGlow,
    hasInnerBorder,
    monogramText,
  } = config;

  const effectiveShape = isRound ? "circle" : shape;

  // Clip Path & Geometry based on shape
  let clipPath = "";
  let shapeElement = "";
  const r = size / 2;

  switch (effectiveShape) {
    case "circle":
      clipPath = `<clipPath id="shapeClip"><circle cx="${r}" cy="${r}" r="${r * 0.94}" /></clipPath>`;
      shapeElement = `<circle cx="${r}" cy="${r}" r="${r * 0.94}" fill="url(#bgGrad)" />`;
      break;
    case "squircle":
      // Smooth continuous curvature squircle
      const sqRadius = size * 0.24;
      clipPath = `<clipPath id="shapeClip"><rect x="${size * 0.05}" y="${size * 0.05}" width="${size * 0.9}" height="${size * 0.9}" rx="${sqRadius}" ry="${sqRadius}" /></clipPath>`;
      shapeElement = `<rect x="${size * 0.05}" y="${size * 0.05}" width="${size * 0.9}" height="${size * 0.9}" rx="${sqRadius}" ry="${sqRadius}" fill="url(#bgGrad)" />`;
      break;
    case "rounded_rect":
      const cr = size * 0.16;
      clipPath = `<clipPath id="shapeClip"><rect x="${size * 0.05}" y="${size * 0.05}" width="${size * 0.9}" height="${size * 0.9}" rx="${cr}" ry="${cr}" /></clipPath>`;
      shapeElement = `<rect x="${size * 0.05}" y="${size * 0.05}" width="${size * 0.9}" height="${size * 0.9}" rx="${cr}" ry="${cr}" fill="url(#bgGrad)" />`;
      break;
    case "hexagon":
      const hexPoints = `${r},${size * 0.06} ${size * 0.92},${size * 0.28} ${size * 0.92},${size * 0.72} ${r},${size * 0.94} ${size * 0.08},${size * 0.72} ${size * 0.08},${size * 0.28}`;
      clipPath = `<clipPath id="shapeClip"><polygon points="${hexPoints}" /></clipPath>`;
      shapeElement = `<polygon points="${hexPoints}" fill="url(#bgGrad)" />`;
      break;
    case "teardrop":
      clipPath = `<clipPath id="shapeClip"><path d="M ${r} ${size * 0.06} C ${size * 0.88} ${size * 0.2} ${size * 0.92} ${size * 0.65} ${r} ${size * 0.94} C ${size * 0.08} ${size * 0.65} ${size * 0.12} ${size * 0.2} ${r} ${size * 0.06} Z" /></clipPath>`;
      shapeElement = `<path d="M ${r} ${size * 0.06} C ${size * 0.88} ${size * 0.2} ${size * 0.92} ${size * 0.65} ${r} ${size * 0.94} C ${size * 0.08} ${size * 0.65} ${size * 0.12} ${size * 0.2} ${r} ${size * 0.06} Z" fill="url(#bgGrad)" />`;
      break;
    default:
      clipPath = `<clipPath id="shapeClip"><rect x="${size * 0.05}" y="${size * 0.05}" width="${size * 0.9}" height="${size * 0.9}" rx="${size * 0.2}" /></clipPath>`;
      shapeElement = `<rect x="${size * 0.05}" y="${size * 0.05}" width="${size * 0.9}" height="${size * 0.9}" rx="${size * 0.2}" fill="url(#bgGrad)" />`;
  }

  // Gradients definition
  let gradientDef = "";
  if (backgroundType === "radial_gradient") {
    gradientDef = `
      <radialGradient id="bgGrad" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stop-color="${primaryColor}" />
        <stop offset="100%" stop-color="${secondaryColor}" />
      </radialGradient>
    `;
  } else if (backgroundType === "solid") {
    gradientDef = `
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${primaryColor}" />
        <stop offset="100%" stop-color="${primaryColor}" />
      </linearGradient>
    `;
  } else {
    // Linear Gradient
    gradientDef = `
      <linearGradient id="bgGrad" x1="15%" y1="10%" x2="85%" y2="90%">
        <stop offset="0%" stop-color="${primaryColor}" />
        <stop offset="100%" stop-color="${secondaryColor}" />
      </linearGradient>
    `;
  }

  // Vector Glyphs Map
  const getSymbolPath = (): string => {
    const scale = (size * (symbolSize / 100)) / 24;
    const centerOffset = (size - 24 * scale) / 2;

    switch (symbol) {
      case "Sparkles":
        return `
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" fill="${symbolColor}" />
          <path d="M5 3v4" stroke="${accentColor}" stroke-width="2" stroke-linecap="round"/>
          <path d="M19 17v4" stroke="${accentColor}" stroke-width="2" stroke-linecap="round"/>
        `;
      case "Brain":
        return `
          <path d="M12 4.5a3.5 3.5 0 0 0-3.5 3.5c0 .3.04.58.11.86A3.5 3.5 0 0 0 6 12a3.5 3.5 0 0 0 2.22 3.25A3.5 3.5 0 0 0 12 18.5a3.5 3.5 0 0 0 3.78-3.25A3.5 3.5 0 0 0 18 12a3.5 3.5 0 0 0-2.61-3.14c.07-.28.11-.56.11-.86A3.5 3.5 0 0 0 12 4.5Z" fill="${symbolColor}" opacity="0.95" />
          <path d="M12 4.5V18.5" stroke="${primaryColor}" stroke-width="1.5" />
        `;
      case "Rocket":
        return `
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" fill="${accentColor}"/>
          <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" fill="${symbolColor}"/>
          <circle cx="15.5" cy="8.5" r="1.5" fill="${primaryColor}"/>
        `;
      case "Shield":
        return `
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="${symbolColor}" stroke="${accentColor}" stroke-width="1.5"/>
          <path d="m9 12 2 2 4-4" stroke="${primaryColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        `;
      case "Zap":
        return `
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="${symbolColor}" stroke="${accentColor}" stroke-width="1" />
        `;
      case "ShoppingBag":
        return `
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" fill="${symbolColor}"/>
          <line x1="3" y1="6" x2="21" y2="6" stroke="${primaryColor}" stroke-width="1.5"/>
          <path d="M16 10a4 4 0 0 1-8 0" stroke="${primaryColor}" stroke-width="2" stroke-linecap="round"/>
        `;
      case "Camera":
        return `
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" fill="${symbolColor}"/>
          <circle cx="12" cy="13" r="3.5" fill="${primaryColor}" stroke="${accentColor}" stroke-width="1.5"/>
        `;
      case "Bot":
        return `
          <rect width="18" height="12" x="3" y="6" rx="2" fill="${symbolColor}" />
          <circle cx="9" cy="12" r="1.5" fill="${primaryColor}" />
          <circle cx="15" cy="12" r="1.5" fill="${primaryColor}" />
          <path d="M12 2v4" stroke="${accentColor}" stroke-width="2" />
        `;
      default:
        // Default Google AI Studio Star / Hexagon
        return `
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" fill="${symbolColor}" />
        `;
    }
  };

  const scale = (size * (symbolSize / 100)) / 24;
  const centerOffset = (size - 24 * scale) / 2;

  let symbolMarkup = "";
  if (symbolType === "text") {
    const textContent = (monogramText || "AI").slice(0, 3).toUpperCase();
    const fontSize = size * (symbolSize / 100) * 0.9;
    symbolMarkup = `
      <text x="${r}" y="${r + fontSize * 0.35}" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="${fontSize}" fill="${symbolColor}" text-anchor="middle" letter-spacing="-1">${textContent}</text>
    `;
  } else {
    symbolMarkup = `
      <g transform="translate(${centerOffset}, ${centerOffset}) scale(${scale})">
        ${getSymbolPath()}
      </g>
    `;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <defs>
    ${gradientDef}
    ${clipPath}
    <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="${size * 0.04}" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <filter id="shadowFilter" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="${size * 0.02}" stdDeviation="${size * 0.03}" flood-opacity="${config.shadowIntensity / 100}" flood-color="#000000" />
    </filter>
  </defs>

  <!-- Base Icon Background -->
  <g filter="url(#shadowFilter)">
    ${shapeElement}
  </g>

  <!-- Inner Ambient Shading & Border -->
  <g clip-path="url(#shapeClip)">
    ${
      hasGlow
        ? `<circle cx="${r}" cy="${size * 0.2}" r="${size * 0.45}" fill="${accentColor}" opacity="0.3" filter="url(#glowFilter)" />`
        : ""
    }
    
    <!-- Light Reflection Flare on Top Edge -->
    <path d="M 0 0 L ${size} 0 L ${size} ${size * 0.3} Q ${r} ${size * 0.45} 0 ${size * 0.3} Z" fill="#ffffff" opacity="0.12" />

    <!-- Center Symbol Graphic -->
    ${symbolMarkup}

    ${
      hasInnerBorder
        ? `<rect x="${size * 0.05 + 2}" y="${size * 0.05 + 2}" width="${size * 0.9 - 4}" height="${size * 0.9 - 4}" rx="${size * 0.2}" fill="none" stroke="#ffffff" stroke-width="${size * 0.015}" opacity="0.25" />`
        : ""
    }
  </g>
</svg>`;
}

/**
 * Converts SVG to PNG Data URL using an HTML5 Canvas.
 */
export async function svgToPngDataUrl(svgString: string, width: number, height: number): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve("data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgString))));
        return;
      }

      const img = new Image();
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/png"));
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve("data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgString))));
      };

      img.src = url;
    } catch (err) {
      resolve("data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgString))));
    }
  });
}

/**
 * Generates all Android mipmap density files and Adaptive Icon XMLs.
 */
export async function generateAndroidMipmapFiles(config: IconDesignConfig): Promise<AndroidFile[]> {
  const standardSvg = generateIconSvg(config, 512, false);
  const roundSvg = generateIconSvg(config, 512, true);

  // Density specifications
  const densities = [
    { name: "mdpi", size: 48 },
    { name: "hdpi", size: 72 },
    { name: "xhdpi", size: 96 },
    { name: "xxhdpi", size: 144 },
    { name: "xxxhdpi", size: 192 },
  ];

  const files: AndroidFile[] = [];

  // Generate PNGs for each density
  for (const d of densities) {
    const standardPng = await svgToPngDataUrl(standardSvg, d.size, d.size);
    const roundPng = await svgToPngDataUrl(roundSvg, d.size, d.size);

    files.push({
      path: `app/src/main/res/mipmap-${d.name}/ic_launcher.png`,
      content: standardPng,
      isAutoGenerated: true,
    });

    files.push({
      path: `app/src/main/res/mipmap-${d.name}/ic_launcher_round.png`,
      content: roundPng,
      isAutoGenerated: true,
    });
  }

  // Google Play 512x512 Master Store Icon
  const playStorePng = await svgToPngDataUrl(standardSvg, 512, 512);
  files.push({
    path: `app/src/main/ic_launcher-playstore.png`,
    content: playStorePng,
    isAutoGenerated: true,
  });

  // Vector Background XML (res/values/ic_launcher_background.xml)
  files.push({
    path: `app/src/main/res/values/ic_launcher_background.xml`,
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">${config.primaryColor}</color>
    <color name="ic_launcher_accent">${config.accentColor}</color>
</resources>`,
    isAutoGenerated: true,
  });

  // Adaptive Icon XML (res/mipmap-anydpi-v26/ic_launcher.xml)
  files.push({
    path: `app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml`,
    content: `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background" />
    <foreground android:drawable="@drawable/ic_launcher_foreground" />
</adaptive-icon>`,
    isAutoGenerated: true,
  });

  // Adaptive Round Icon XML (res/mipmap-anydpi-v26/ic_launcher_round.xml)
  files.push({
    path: `app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml`,
    content: `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background" />
    <foreground android:drawable="@drawable/ic_launcher_foreground" />
</adaptive-icon>`,
    isAutoGenerated: true,
  });

  // Vector Foreground Drawable (res/drawable/ic_launcher_foreground.xml)
  files.push({
    path: `app/src/main/res/drawable/ic_launcher_foreground.xml`,
    content: `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="${config.symbolColor}"
        android:pathData="M54,20 L58,45 L83,54 L58,63 L54,88 L50,63 L25,54 L50,45 Z" />
    <path
        android:strokeColor="${config.accentColor}"
        android:strokeWidth="2"
        android:pathData="M35,30 L40,30 M70,75 L75,75" />
</vector>`,
    isAutoGenerated: true,
  });

  return files;
}
