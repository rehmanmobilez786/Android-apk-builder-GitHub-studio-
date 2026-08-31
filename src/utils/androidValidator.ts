import { AndroidFile, ValidationReport, DiagnosticIssue } from "../types";

export function validateAndroidProject(files: AndroidFile[]): ValidationReport {
  const issues: DiagnosticIssue[] = [];
  const missingFiles: string[] = [];

  const paths = files.map((f) => f.path.toLowerCase());

  // Check 1: AndroidManifest.xml
  const manifestFile = files.find((f) => f.path.toLowerCase().includes("androidmanifest.xml"));
  if (!manifestFile) {
    missingFiles.push("app/src/main/AndroidManifest.xml");
    issues.push({
      id: "err-missing-manifest",
      filePath: "app/src/main/AndroidManifest.xml",
      severity: "missing_file",
      message: "CRITICAL: Missing AndroidManifest.xml file.",
      suggestion: "An Android application requires AndroidManifest.xml to define components, activities, and permissions.",
    });
  } else {
    // Validate manifest content
    const content = manifestFile.content;
    if (!content.includes("<manifest") || !content.includes("</manifest>")) {
      issues.push({
        id: "err-invalid-manifest",
        filePath: manifestFile.path,
        severity: "error",
        message: "Malformed AndroidManifest.xml syntax.",
        suggestion: "Ensure root <manifest> and </manifest> tags are properly closed.",
      });
    }
    if (!content.includes("android.intent.action.MAIN") && !content.includes("MAIN")) {
      issues.push({
        id: "warn-no-main-activity",
        filePath: manifestFile.path,
        severity: "warning",
        message: "No Launcher Activity declared in AndroidManifest.xml.",
        suggestion: "Add an activity with <action android:name='android.intent.action.MAIN' /> and <category android:name='android.intent.category.LAUNCHER' />.",
      });
    }
  }

  // Check 2: Gradle build script
  const appGradle = files.find((f) => f.path.toLowerCase().endsWith("build.gradle") || f.path.toLowerCase().endsWith("build.gradle.kts"));
  if (!appGradle) {
    missingFiles.push("app/build.gradle");
    issues.push({
      id: "err-missing-gradle",
      filePath: "app/build.gradle",
      severity: "missing_file",
      message: "Missing app build.gradle configuration file.",
      suggestion: "Gradle build file defines SDK versions, package applicationId, and dependencies.",
    });
  }

  // Check 3: MainActivity
  const hasMainActivity = files.some(
    (f) => f.path.toLowerCase().endsWith("mainactivity.kt") || f.path.toLowerCase().endsWith("mainactivity.java")
  );
  if (!hasMainActivity) {
    missingFiles.push("app/src/main/java/com/example/app/MainActivity.kt");
    issues.push({
      id: "err-missing-mainactivity",
      filePath: "app/src/main/java/com/example/app/MainActivity.kt",
      severity: "missing_file",
      message: "Missing MainActivity class.",
      suggestion: "Android apps require an entry point Activity extending AppCompatActivity or ComponentActivity.",
    });
  }

  // Check 4: Layout XML file check
  const layoutFiles = files.filter((f) => f.path.toLowerCase().includes("res/layout/"));
  if (layoutFiles.length === 0) {
    missingFiles.push("app/src/main/res/layout/activity_main.xml");
    issues.push({
      id: "warn-no-layout",
      filePath: "app/src/main/res/layout/activity_main.xml",
      severity: "warning",
      message: "No Layout XML file found in res/layout/",
      suggestion: "Create activity_main.xml to define the visual interface.",
    });
  }

  // Check 5: Syntax scanning for all XML and Kotlin files
  files.forEach((file) => {
    const content = file.content;
    const lowPath = file.path.toLowerCase();

    if (lowPath.endsWith(".xml")) {
      // Check unclosed XML tags
      const openTags = (content.match(/<[a-zA-Z0-9_-]+/g) || []).length;
      const closeTags = (content.match(/<\/|\/>/g) || []).length;
      if (Math.abs(openTags - closeTags) > 3) {
        issues.push({
          id: `err-xml-${file.path}`,
          filePath: file.path,
          severity: "error",
          message: "Possible unclosed or mismatched XML tags detected.",
          suggestion: "Ensure all XML tags like <TextView ... /> or <LinearLayout>...</LinearLayout> are properly closed.",
        });
      }
    }

    if (lowPath.endsWith(".kt") || lowPath.endsWith(".java")) {
      // Check for dangling variables or obvious syntax errors
      const openBrackets = (content.match(/\{/g) || []).length;
      const closeBrackets = (content.match(/\}/g) || []).length;
      if (openBrackets !== closeBrackets) {
        issues.push({
          id: `err-brackets-${file.path}`,
          filePath: file.path,
          severity: "error",
          message: `Mismatched curly brackets { } in ${file.path}.`,
          suggestion: "Check class or function closures for missing '}' brackets.",
        });
      }

      if (content.includes("val ") || content.includes("var ")) {
        const lines = content.split("\n");
        lines.forEach((line, idx) => {
          if ((line.trim().startsWith("val ") || line.trim().startsWith("var ")) && line.trim().endsWith("=")) {
            issues.push({
              id: `err-line-${file.path}-${idx}`,
              filePath: file.path,
              line: idx + 1,
              severity: "error",
              message: `Unfinished variable assignment on line ${idx + 1}.`,
              suggestion: "Assign a valid value to the variable.",
              codeSnippet: line.trim(),
            });
          }
        });
      }
    }
  });

  return {
    isValid: missingFiles.length === 0 && issues.filter((i) => i.severity === "error").length === 0,
    missingFiles,
    issues,
  };
}

export function generateDefaultMissingFile(filePath: string): string {
  const low = filePath.toLowerCase();

  if (low.includes("androidmanifest.xml")) {
    return `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="My Android App"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.AppCompat.Light.DarkActionBar">
        
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;
  }

  if (low.includes("activity_main.xml") || low.includes("res/layout/")) {
    return `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="20dp"
    android:gravity="center"
    android:background="#0f172a">

    <TextView
        android:id="@+id/tvWelcome"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Welcome to Android App Studio"
        android:textSize="22sp"
        android:textStyle="bold"
        android:textColor="#ffffff"
        android:gravity="center" />

    <TextView
        android:id="@+id/tvSubtitle"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginTop="8dp"
        android:text="Your layout and Kotlin activity are fully synchronized!"
        android:textSize="14sp"
        android:textColor="#94a3b8"
        android:gravity="center" />

    <Button
        android:id="@+id/btnMain"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginTop="28dp"
        android:text="Get Started"
        android:paddingLeft="24dp"
        android:paddingRight="24dp" />
</LinearLayout>`;
  }

  if (low.endsWith("build.gradle") || low.endsWith("build.gradle.kts")) {
    return `plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
}

android {
    namespace 'com.example.app'
    compileSdk 34

    defaultConfig {
        applicationId "com.example.app"
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "1.0"
    }

    buildTypes {
        release {
            minifyEnabled false
        }
    }
}

dependencies {
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
}`;
  }

  if (low.endsWith("mainactivity.kt") || low.endsWith("mainactivity.java")) {
    return `package com.example.app

import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val btnMain = findViewById<Button>(R.id.btnMain)
        val tvWelcome = findViewById<TextView>(R.id.tvWelcome)

        btnMain?.setOnClickListener {
            Toast.makeText(this, "Android App Repaired & Running!", Toast.LENGTH_SHORT).show()
            tvWelcome?.text = "App Active & Ready!"
        }
    }
}`;
  }

  return `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n</resources>`;
}

