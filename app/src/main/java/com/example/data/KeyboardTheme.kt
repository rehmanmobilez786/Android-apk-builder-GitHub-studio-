package com.example.data

import androidx.compose.ui.graphics.Color

data class KeyboardTheme(
    val name: String,
    val isDark: Boolean,
    val bgGradientStart: Color,
    val bgGradientEnd: Color,
    val keyboardBg: Color,
    val keyBg: Color,
    val keyText: Color,
    val accentBg: Color,
    val accentText: Color,
    val suggestionBg: Color,
    val suggestionText: Color
)

object KeyboardThemes {
    val CosmicMidnight = KeyboardTheme(
        name = "Cosmic Midnight",
        isDark = true,
        bgGradientStart = Color(0xFF0F0C1B),
        bgGradientEnd = Color(0xFF241435),
        keyboardBg = Color(0xFF130E29),
        keyBg = Color(0xFF231C44),
        keyText = Color(0xFFECE8FF),
        accentBg = Color(0xFF7A22FF),
        accentText = Color(0xFFFFFFFF),
        suggestionBg = Color(0xFF1A143A),
        suggestionText = Color(0xFFD2C4FF)
    )

    val CyberpunkNeon = KeyboardTheme(
        name = "Cyberpunk Neon",
        isDark = true,
        bgGradientStart = Color(0xFF05070A),
        bgGradientEnd = Color(0xFF0F151E),
        keyboardBg = Color(0xFF070A0F),
        keyBg = Color(0xFF141A24),
        keyText = Color(0xFF00FFCC),
        accentBg = Color(0xFFFF007F),
        accentText = Color(0xFFFFFFFF),
        suggestionBg = Color(0xFF0D121B),
        suggestionText = Color(0xFFFFFF00)
    )

    val WarmSunset = KeyboardTheme(
        name = "Warm Sunset",
        isDark = true,
        bgGradientStart = Color(0xFF241512),
        bgGradientEnd = Color(0xFF3E1F1A),
        keyboardBg = Color(0xFF221310),
        keyBg = Color(0xFF3F211A),
        keyText = Color(0xFFFFE5B4),
        accentBg = Color(0xFFE25B45),
        accentText = Color(0xFFFFFFFF),
        suggestionBg = Color(0xFF2F1A15),
        suggestionText = Color(0xFFFFAE99)
    )

    val EmeraldForest = KeyboardTheme(
        name = "Emerald Forest",
        isDark = true,
        bgGradientStart = Color(0xFF06120E),
        bgGradientEnd = Color(0xFF12281E),
        keyboardBg = Color(0xFF081410),
        keyBg = Color(0xFF163025),
        keyText = Color(0xFFD0F2E1),
        accentBg = Color(0xFF2EB85C),
        accentText = Color(0xFF06120E),
        suggestionBg = Color(0xFF0D211A),
        suggestionText = Color(0xFF90E3B6)
    )

    val MinimalLight = KeyboardTheme(
        name = "Minimal Light",
        isDark = false,
        bgGradientStart = Color(0xFFF6F8FA),
        bgGradientEnd = Color(0xFFE9ECF0),
        keyboardBg = Color(0xFFEBEDF0),
        keyBg = Color(0xFFFFFFFF),
        keyText = Color(0xFF1C1E21),
        accentBg = Color(0xFF000000),
        accentText = Color(0xFFFFFFFF),
        suggestionBg = Color(0xFFDFE2E6),
        suggestionText = Color(0xFF4B535E)
    )

    val list = listOf(CosmicMidnight, CyberpunkNeon, WarmSunset, EmeraldForest, MinimalLight)
}
