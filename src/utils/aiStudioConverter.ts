import { AndroidFile, AndroidProject } from "../types";

export interface AIStudioMetadata {
  name?: string;
  description?: string;
  requestFramePermissions?: string[];
  majorCapabilities?: string[];
}

export function detectAIStudioProject(files: AndroidFile[]): {
  isAIStudio: boolean;
  metadata?: AIStudioMetadata;
  hasReactWeb: boolean;
  hasKotlin: boolean;
  hasGeminiSdk: boolean;
} {
  let isAIStudio = false;
  let metadata: AIStudioMetadata | undefined = undefined;
  let hasReactWeb = false;
  let hasKotlin = false;
  let hasGeminiSdk = false;

  for (const f of files) {
    if (f.path.endsWith("metadata.json") || f.path === "metadata.json") {
      try {
        metadata = JSON.parse(f.content);
        isAIStudio = true;
      } catch (e) {
        // ignore
      }
    }

    if (
      f.path.includes("package.json") ||
      f.path.includes("src/App.tsx") ||
      f.path.includes("src/main.tsx") ||
      f.path.includes("vite.config.ts") ||
      f.path.includes("index.html")
    ) {
      hasReactWeb = true;
    }

    if (f.path.endsWith(".kt") || f.path.endsWith(".java")) {
      hasKotlin = true;
    }

    if (
      f.content.includes("@google/genai") ||
      f.content.includes("GoogleGenAI") ||
      f.content.includes("GEMINI_API_KEY") ||
      f.content.includes("gemini-")
    ) {
      hasGeminiSdk = true;
      isAIStudio = true;
    }
  }

  return {
    isAIStudio: isAIStudio || hasReactWeb,
    metadata,
    hasReactWeb,
    hasKotlin,
    hasGeminiSdk,
  };
}

export function convertAIStudioToAndroidProject(
  rawFiles: AndroidFile[],
  suggestedName?: string
): AndroidProject {
  const analysis = detectAIStudioProject(rawFiles);
  const appName =
    analysis.metadata?.name ||
    suggestedName ||
    "Google AI Studio App";
  
  const cleanPackageName = "com.aistudio." + appName.toLowerCase().replace(/[^a-z0-9]/g, "");
  const permissions = analysis.metadata?.requestFramePermissions || [];

  const neededPerms = new Set<string>(["android.permission.INTERNET", "android.permission.ACCESS_NETWORK_STATE"]);
  if (permissions.includes("camera") || rawFiles.some(f => f.content.toLowerCase().includes("camera"))) {
    neededPerms.add("android.permission.CAMERA");
  }
  if (permissions.includes("microphone") || rawFiles.some(f => f.content.toLowerCase().includes("audio") || f.content.toLowerCase().includes("microphone"))) {
    neededPerms.add("android.permission.RECORD_AUDIO");
    neededPerms.add("android.permission.MODIFY_AUDIO_SETTINGS");
  }
  if (permissions.includes("geolocation") || rawFiles.some(f => f.content.toLowerCase().includes("geolocation"))) {
    neededPerms.add("android.permission.ACCESS_FINE_LOCATION");
    neededPerms.add("android.permission.ACCESS_COARSE_LOCATION");
  }

  // Generate complete AndroidManifest.xml
  const manifestXml = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${cleanPackageName}">

    <!-- Permissions for Google AI Studio Web & Native APIs -->
${Array.from(neededPerms).map(p => `    <uses-permission android:name="${p}" />`).join("\n")}
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="${appName}"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:usesCleartextTraffic="true"
        android:hardwareAccelerated="true"
        android:theme="@style/Theme.AIStudioApp">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|keyboardHidden"
            android:windowSoftInputMode="adjustResize"
            android:label="${appName}">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>`;

  // Generate robust Android Native WebView & Native Bridge MainActivity.kt
  const mainActivityKt = `package ${cleanPackageName}

import android.annotation.SuppressLint
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.View
import android.webkit.*
import android.widget.ProgressBar
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat

/**
 * Production-ready Android Native Host for Google AI Studio Applets.
 * Features Hardware Accelerated WebView, ChromeClient with Camera & File Chooser,
 * Offline Assets Loader, and JavaScript Native Bridge.
 */
class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var progressBar: ProgressBar
    private var fileUploadCallback: ValueCallback<Array<Uri>>? = null

    private val filePickerLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == RESULT_OK) {
            val data: Intent? = result.data
            val results: Array<Uri>? = when {
                data?.dataString != null -> arrayOf(Uri.parse(data.dataString))
                data?.clipData != null -> {
                    val count = data.clipData!!.itemCount
                    Array(count) { i -> data.clipData!!.getItemAt(i).uri }
                }
                else -> null
            }
            fileUploadCallback?.onReceiveValue(results)
        } else {
            fileUploadCallback?.onReceiveValue(null)
        }
        fileUploadCallback = null
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, true)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webView)
        progressBar = findViewById(R.id.progressBar)

        setupWebView()
        loadAIStudioApp()
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.allowFileAccess = true
        settings.allowContentAccess = true
        settings.loadWithOverviewMode = true
        settings.useWideViewPort = true
        settings.mediaPlaybackRequiresUserGesture = false
        settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        settings.cacheMode = WebSettings.LOAD_DEFAULT

        webView.addJavascriptInterface(AIStudioNativeBridge(this), "AIStudioAndroid")

        webView.webViewClient = object : WebViewClient() {
            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                progressBar.visibility = View.VISIBLE
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                progressBar.visibility = View.GONE
            }

            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: WebResourceError?
            ) {
                super.onReceivedError(view, request, error)
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                progressBar.progress = newProgress
                if (newProgress == 100) progressBar.visibility = View.GONE
            }

            override fun onPermissionRequest(request: PermissionRequest?) {
                request?.grant(request.resources)
            }

            override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                fileUploadCallback?.onReceiveValue(null)
                fileUploadCallback = filePathCallback

                val intent = fileChooserParams?.createIntent() ?: Intent(Intent.ACTION_GET_CONTENT).apply {
                    type = "*/*"
                    addCategory(Intent.CATEGORY_OPENABLE)
                }
                filePickerLauncher.launch(intent)
                return true
            }
        }
    }

    private fun loadAIStudioApp() {
        // Loads embedded offline bundle from assets or hosted URL
        webView.loadUrl("file:///android_asset/dist/index.html")
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}

/**
 * JavaScript Native Bridge for Gemini AI & Android Device Hardware
 */
class AIStudioNativeBridge(private val context: MainActivity) {

    @JavascriptInterface
    fun showToast(message: String) {
        context.runOnUiThread {
            Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
        }
    }

    @JavascriptInterface
    fun getAndroidVersion(): String {
        return "Android \${Build.VERSION.RELEASE} (SDK \${Build.VERSION.SDK_INT})"
    }

    @JavascriptInterface
    fun getAppName(): String {
        return "${appName}"
    }
}
`;

  // Layout XML
  const layoutXml = `<?xml version="1.0" encoding="utf-8"?>
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#0F172A">

    <ProgressBar
        android:id="@+id/progressBar"
        style="?android:attr/progressBarStyleHorizontal"
        android:layout_width="match_parent"
        android:layout_height="4dp"
        android:layout_alignParentTop="true"
        android:indeterminate="false"
        android:max="100"
        android:progressTint="#38BDF8"
        android:visibility="gone" />

    <WebView
        android:id="@+id/webView"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:layout_below="@id/progressBar" />

</RelativeLayout>`;

  // Build Gradle
  const appBuildGradle = `plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
}

android {
    namespace '${cleanPackageName}'
    compileSdk 34

    defaultConfig {
        applicationId "${cleanPackageName}"
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "1.0.0"

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
    kotlinOptions {
        jvmTarget = '1.8'
    }
}

dependencies {
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
    implementation 'androidx.webkit:webkit:1.9.0'
    implementation 'androidx.activity:activity-ktx:1.8.2'
    implementation 'com.squareup.okhttp3:okhttp:4.12.0'
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3'
}`;

  // Root build.gradle
  const rootBuildGradle = `buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.2.2'
        classpath 'org.jetbrains.kotlin:kotlin-gradle-plugin:1.9.22'
    }
}

task clean(type: Delete) {
    delete rootProject.buildDir
}`;

  // Settings Gradle
  const settingsGradle = `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "${appName.replace(/[^a-zA-Z0-9_-]/g, "")}"
include ':app'`;

  // HTML Entry for offline assets
  let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>${appName}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      background-color: #0b1120;
      color: #f8fafc;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      margin: 0;
      padding: 0;
      -webkit-tap-highlight-color: transparent;
    }
  </style>
</head>
<body class="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
  <div id="root" class="flex-1 flex flex-col">
    <!-- Header -->
    <header class="bg-slate-900/90 backdrop-blur border-b border-slate-800 p-4 sticky top-0 z-20 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center font-bold text-white shadow-lg shadow-sky-500/30">
          ✨
        </div>
        <div>
          <h1 class="font-bold text-sm text-white">${appName}</h1>
          <p class="text-[10px] text-sky-400">Google AI Studio Android APK</p>
        </div>
      </div>
      <span class="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-medium border border-emerald-500/30">
        Live Native
      </span>
    </header>

    <!-- Main Content Container -->
    <main class="flex-1 p-4 flex flex-col justify-between max-w-lg mx-auto w-full">
      <div class="space-y-4">
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div class="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-2">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Google AI Studio Applet
          </div>
          <p class="text-xs text-slate-400 leading-relaxed">
            ${analysis.metadata?.description || "Welcome to your converted Google AI Studio application, ready to run on any Android smartphone or tablet."}
          </p>
        </div>

        <div class="bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/20 rounded-2xl p-4 text-xs">
          <div class="font-bold text-indigo-300 mb-1">⚡ Gemini AI Engine Ready</div>
          <p class="text-slate-400 text-[11px]">
            Connected to Gemini models with native Android hardware acceleration.
          </p>
        </div>
      </div>

      <!-- Action Card -->
      <div class="mt-6 space-y-3">
        <button 
          onclick="if(window.AIStudioAndroid) window.AIStudioAndroid.showToast('🚀 Google AI Studio Running on Android!')"
          class="w-full bg-sky-600 hover:bg-sky-500 active:scale-95 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-sky-600/30 transition-all text-xs flex items-center justify-center gap-2">
          <span>Test Native Android Toast</span>
        </button>
      </div>
    </main>
  </div>
</body>
</html>`;

  // If there is existing index.html or App.tsx, preserve it
  const existingHtml = rawFiles.find(f => f.path.endsWith("index.html"));
  if (existingHtml) {
    htmlContent = existingHtml.content;
  }

  // Combine files
  const androidFiles: AndroidFile[] = [
    { path: "app/src/main/AndroidManifest.xml", content: manifestXml },
    { path: `app/src/main/java/${cleanPackageName.replace(/\./g, "/")}/MainActivity.kt`, content: mainActivityKt },
    { path: "app/src/main/res/layout/activity_main.xml", content: layoutXml },
    {
      path: "app/src/main/res/values/strings.xml",
      content: `<resources>
    <string name="app_name">${appName}</string>
</resources>`,
    },
    {
      path: "app/src/main/res/values/colors.xml",
      content: `<resources>
    <color name="primary">#0284C7</color>
    <color name="primary_dark">#0369A1</color>
    <color name="accent">#38BDF8</color>
</resources>`,
    },
    {
      path: "app/src/main/res/values/styles.xml",
      content: `<resources>
    <style name="Theme.AIStudioApp" parent="Theme.MaterialComponents.DayNight.NoActionBar">
        <item name="colorPrimary">@color/primary</item>
        <item name="colorPrimaryDark">@color/primary_dark</item>
        <item name="colorAccent">@color/accent</item>
        <item name="android:statusBarColor">#0F172A</item>
    </style>
</resources>`,
    },
    { path: "app/build.gradle", content: appBuildGradle },
    { path: "build.gradle", content: rootBuildGradle },
    { path: "settings.gradle", content: settingsGradle },
    {
      path: "gradle/wrapper/gradle-wrapper.properties",
      content: `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.2-bin.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists`,
    },
    {
      path: "gradle.properties",
      content: `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.enableJetifier=true
kotlin.code.style=official`,
    },
    {
      path: "app/src/main/assets/dist/index.html",
      content: htmlContent,
    },
    {
      path: ".github/workflows/android-build-apk.yml",
      content: `name: Build Google AI Studio Android APK

on:
  push:
    branches: [ "main", "master" ]
    paths-ignore:
      - '**.md'
      - '.gitignore'
  workflow_dispatch:

# Prevents runaway parallel builds & resource exhaustion (GitHub Policy Compliant)
concurrency:
  group: \${{ github.workflow }}-\${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: write

jobs:
  build:
    name: Assemble Android APK with Gradle & SDK 34
    runs-on: ubuntu-latest
    timeout-minutes: 25

    steps:
      - name: Checkout Google AI Studio Android Project
        uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
          cache: gradle

      - name: Setup Android SDK Build-Tools & Platforms
        uses: android-actions/setup-android@v3

      - name: Grant Execute Permission for Gradlew
        run: chmod +x gradlew || true

      - name: Build Debug Android APK (assembleDebug)
        run: |
          if [ -f "./gradlew" ]; then
            ./gradlew assembleDebug --no-daemon --stacktrace
          else
            gradle assembleDebug --no-daemon --stacktrace
          fi

      - name: Upload Android APK Artifact for Download
        uses: actions/upload-artifact@v4
        with:
          name: google-ai-studio-app-debug
          path: app/build/outputs/apk/debug/*.apk
          retention-days: 14`,
    },
  ];

  // Preserve all original files inside the Android project repository
  for (const raw of rawFiles) {
    if (!androidFiles.some(af => af.path === raw.path)) {
      androidFiles.push(raw);
    }
  }

  return {
    id: `aistudio-${Date.now()}`,
    name: appName,
    packageName: cleanPackageName,
    versionName: "1.0.0",
    versionCode: 1,
    minSdk: 24,
    targetSdk: 34,
    compileSdk: 34,
    files: androidFiles,
    updatedAt: new Date().toISOString(),
  };
}
