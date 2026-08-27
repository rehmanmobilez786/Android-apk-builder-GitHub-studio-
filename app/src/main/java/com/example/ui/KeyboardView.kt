package com.example.ui

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.KeyboardTheme
import com.example.data.KeyboardThemes
import com.example.data.Language
import com.example.data.Languages

enum class KeyboardMode {
    KEYS,
    SOURCE_LANG_PICKER,
    TARGET_LANG_PICKER,
    THEME_PICKER
}

sealed class KeyboardKey {
    data class Char(val text: String) : KeyboardKey()
    object Backspace : KeyboardKey()
    object Space : KeyboardKey()
    object Shift : KeyboardKey()
    object SymbolsToggle : KeyboardKey()
    object Enter : KeyboardKey()
}

@Composable
fun KeyboardView(
    theme: KeyboardTheme,
    inputText: String,
    suggestions: List<String>,
    selectedSourceLang: Language,
    selectedTargetLang: Language,
    autoReadEnabled: Boolean,
    isTranslating: Boolean,
    isListening: Boolean,
    isTtsSpeaking: Boolean,
    isShiftEnabled: Boolean,
    isSymbolsMode: Boolean,
    keyboardMode: KeyboardMode,
    onModeChange: (KeyboardMode) -> Unit,
    onKeyClick: (KeyboardKey) -> Unit,
    onSuggestionClick: (String) -> Unit,
    onTranslateClick: () -> Unit,
    onVoiceClick: () -> Unit,
    onTtsClick: () -> Unit,
    onAutoReadToggle: () -> Unit,
    onThemeSelect: (KeyboardTheme) -> Unit,
    onLanguageSelect: (Language, Boolean) -> Unit, // Boolean is true for Source, false for Target
    onShiftToggle: () -> Unit,
    onSymbolsToggle: () -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier
            .fillMaxWidth()
            .testTag("ai_keyboard_view"),
        color = theme.keyboardBg,
        shape = RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp),
        tonalElevation = 8.dp
    ) {
        Column(
            modifier = Modifier
                .navigationBarsPadding()
                .padding(bottom = 8.dp)
        ) {
            when (keyboardMode) {
                KeyboardMode.KEYS -> {
                    // 1. Suggestion bar
                    SuggestionBar(
                        suggestions = suggestions,
                        theme = theme,
                        onSuggestionClick = onSuggestionClick
                    )

                    // 2. AI Toolbar (Languages, Translate, TTS, Voice, Palette)
                    AiToolbar(
                        theme = theme,
                        selectedSourceLang = selectedSourceLang,
                        selectedTargetLang = selectedTargetLang,
                        autoReadEnabled = autoReadEnabled,
                        isTranslating = isTranslating,
                        isListening = isListening,
                        isTtsSpeaking = isTtsSpeaking,
                        onSourceClick = { onModeChange(KeyboardMode.SOURCE_LANG_PICKER) },
                        onTargetClick = { onModeChange(KeyboardMode.TARGET_LANG_PICKER) },
                        onTranslateClick = onTranslateClick,
                        onVoiceClick = onVoiceClick,
                        onTtsClick = onTtsClick,
                        onAutoReadToggle = onAutoReadToggle,
                        onThemeClick = { onModeChange(KeyboardMode.THEME_PICKER) }
                    )

                    Spacer(modifier = Modifier.height(4.dp))

                    // 3. Main character keyboard
                    if (isSymbolsMode) {
                        SymbolsLayout(theme = theme, onKeyClick = onKeyClick, onSymbolsToggle = onSymbolsToggle)
                    } else {
                        QwertyLayout(
                            theme = theme,
                            isShiftEnabled = isShiftEnabled,
                            onKeyClick = onKeyClick,
                            onShiftToggle = onShiftToggle,
                            onSymbolsToggle = onSymbolsToggle
                        )
                    }
                }
                KeyboardMode.SOURCE_LANG_PICKER -> {
                    InKeyboardLanguagePicker(
                        title = "Select Source Language",
                        theme = theme,
                        selectedLang = selectedSourceLang,
                        onLangSelected = { onLanguageSelect(it, true) },
                        onClose = { onModeChange(KeyboardMode.KEYS) }
                    )
                }
                KeyboardMode.TARGET_LANG_PICKER -> {
                    InKeyboardLanguagePicker(
                        title = "Select Target Language",
                        theme = theme,
                        selectedLang = selectedTargetLang,
                        onLangSelected = { onLanguageSelect(it, false) },
                        onClose = { onModeChange(KeyboardMode.KEYS) }
                    )
                }
                KeyboardMode.THEME_PICKER -> {
                    InKeyboardThemePicker(
                        theme = theme,
                        onThemeSelected = onThemeSelect,
                        onClose = { onModeChange(KeyboardMode.KEYS) }
                    )
                }
            }
        }
    }
}

@Composable
fun SuggestionBar(
    suggestions: List<String>,
    theme: KeyboardTheme,
    onSuggestionClick: (String) -> Unit
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .height(42.dp),
        color = theme.suggestionBg
    ) {
        Row(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 4.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            suggestions.take(3).forEach { suggestion ->
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxHeight()
                        .clickable(
                            interactionSource = remember { MutableInteractionSource() },
                            indication = ripple()
                        ) { onSuggestionClick(suggestion) }
                        .padding(horizontal = 4.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = suggestion,
                        color = theme.suggestionText,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Medium,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        textAlign = TextAlign.Center
                    )
                }

                // Vertical divider
                if (suggestion != suggestions.take(3).lastOrNull()) {
                    Spacer(
                        modifier = Modifier
                            .fillMaxHeight(0.5f)
                            .width(1.dp)
                            .background(theme.keyBg.copy(alpha = 0.3f))
                    )
                }
            }
        }
    }
}

@Composable
fun AiToolbar(
    theme: KeyboardTheme,
    selectedSourceLang: Language,
    selectedTargetLang: Language,
    autoReadEnabled: Boolean,
    isTranslating: Boolean,
    isListening: Boolean,
    isTtsSpeaking: Boolean,
    onSourceClick: () -> Unit,
    onTargetClick: () -> Unit,
    onTranslateClick: () -> Unit,
    onVoiceClick: () -> Unit,
    onTtsClick: () -> Unit,
    onAutoReadToggle: () -> Unit,
    onThemeClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .height(52.dp)
            .background(theme.keyboardBg.copy(alpha = 0.5f))
            .padding(horizontal = 6.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Source Picker
        Button(
            onClick = onSourceClick,
            colors = ButtonDefaults.buttonColors(
                containerColor = theme.keyBg,
                contentColor = theme.keyText
            ),
            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
            modifier = Modifier
                .weight(1.1f)
                .height(36.dp),
            shape = RoundedCornerShape(8.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(selectedSourceLang.flag, fontSize = 16.sp)
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    selectedSourceLang.name,
                    fontSize = 12.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    fontWeight = FontWeight.Bold
                )
            }
        }

        IconButton(
            onClick = {},
            enabled = false,
            modifier = Modifier.weight(0.3f)
        ) {
            Icon(
                imageVector = Icons.Default.ArrowForward,
                contentDescription = null,
                tint = theme.keyText.copy(alpha = 0.5f),
                modifier = Modifier.size(16.dp)
            )
        }

        // Target Picker
        Button(
            onClick = onTargetClick,
            colors = ButtonDefaults.buttonColors(
                containerColor = theme.keyBg,
                contentColor = theme.keyText
            ),
            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
            modifier = Modifier
                .weight(1.1f)
                .height(36.dp),
            shape = RoundedCornerShape(8.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(selectedTargetLang.flag, fontSize = 16.sp)
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    selectedTargetLang.name,
                    fontSize = 12.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    fontWeight = FontWeight.Bold
                )
            }
        }

        Spacer(modifier = Modifier.width(6.dp))

        // Actions Block
        Row(
            modifier = Modifier.weight(1.8f),
            horizontalArrangement = Arrangement.End,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Translate Action Button
            IconButton(
                onClick = onTranslateClick,
                colors = IconButtonDefaults.iconButtonColors(
                    containerColor = if (isTranslating) theme.accentBg else theme.keyBg,
                    contentColor = if (isTranslating) theme.accentText else theme.keyText
                ),
                modifier = Modifier
                    .size(36.dp)
                    .padding(2.dp)
            ) {
                if (isTranslating) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(18.dp),
                        color = theme.accentText,
                        strokeWidth = 2.dp
                    )
                } else {
                    Icon(
                        imageVector = Icons.Default.Translate,
                        contentDescription = "Translate text",
                        modifier = Modifier.size(18.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.width(4.dp))

            // Speech Recognition Input button
            IconButton(
                onClick = onVoiceClick,
                colors = IconButtonDefaults.iconButtonColors(
                    containerColor = if (isListening) theme.accentBg else theme.keyBg,
                    contentColor = if (isListening) theme.accentText else theme.keyText
                ),
                modifier = Modifier
                    .size(36.dp)
                    .padding(2.dp)
            ) {
                Icon(
                    imageVector = if (isListening) Icons.Default.MicExternalOn else Icons.Default.Mic,
                    contentDescription = "Translate Voice",
                    modifier = Modifier.size(18.dp)
                )
            }

            Spacer(modifier = Modifier.width(4.dp))

            // TTS Speaker Button
            IconButton(
                onClick = onTtsClick,
                colors = IconButtonDefaults.iconButtonColors(
                    containerColor = if (isTtsSpeaking) theme.accentBg else theme.keyBg,
                    contentColor = if (isTtsSpeaking) theme.accentText else theme.keyText
                ),
                modifier = Modifier
                    .size(36.dp)
                    .padding(2.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.VolumeUp,
                    contentDescription = "Speak translation",
                    modifier = Modifier.size(18.dp)
                )
            }

            Spacer(modifier = Modifier.width(4.dp))

            // Auto-Read Indicator Toggle
            IconButton(
                onClick = onAutoReadToggle,
                colors = IconButtonDefaults.iconButtonColors(
                    containerColor = if (autoReadEnabled) theme.accentBg.copy(alpha = 0.2f) else theme.keyBg,
                    contentColor = if (autoReadEnabled) theme.accentBg else theme.keyText.copy(alpha = 0.5f)
                ),
                modifier = Modifier
                    .size(36.dp)
                    .padding(2.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Hearing,
                    contentDescription = "Toggle auto speaker",
                    modifier = Modifier.size(18.dp)
                )
            }

            Spacer(modifier = Modifier.width(4.dp))

            // Themes selection button
            IconButton(
                onClick = onThemeClick,
                colors = IconButtonDefaults.iconButtonColors(
                    containerColor = theme.keyBg,
                    contentColor = theme.keyText
                ),
                modifier = Modifier
                    .size(36.dp)
                    .padding(2.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Palette,
                    contentDescription = "Change keyboard theme",
                    modifier = Modifier.size(18.dp)
                )
            }
        }
    }
}

@Composable
fun QwertyLayout(
    theme: KeyboardTheme,
    isShiftEnabled: Boolean,
    onKeyClick: (KeyboardKey) -> Unit,
    onShiftToggle: () -> Unit,
    onSymbolsToggle: () -> Unit
) {
    val row1 = listOf("q", "w", "e", "r", "t", "y", "u", "i", "o", "p")
    val row2 = listOf("a", "s", "d", "f", "g", "h", "j", "k", "l")
    val row3 = listOf("z", "x", "c", "v", "b", "n", "m")

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 4.dp),
        verticalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        // Row 1
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            row1.forEach { char ->
                val label = if (isShiftEnabled) char.uppercase() else char
                KeyButton(
                    text = label,
                    theme = theme,
                    modifier = Modifier.weight(1f),
                    onClick = { onKeyClick(KeyboardKey.Char(label)) }
                )
            }
        }

        // Row 2
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 10.dp),
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            row2.forEach { char ->
                val label = if (isShiftEnabled) char.uppercase() else char
                KeyButton(
                    text = label,
                    theme = theme,
                    modifier = Modifier.weight(1f),
                    onClick = { onKeyClick(KeyboardKey.Char(label)) }
                )
            }
        }

        // Row 3 (Shift, letters, Backspace)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(4.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Shift Key
            IconButtonKey(
                imageVector = Icons.Default.ArrowUpward,
                theme = theme,
                isActivated = isShiftEnabled,
                modifier = Modifier.weight(1.3f),
                onClick = onShiftToggle
            )

            row3.forEach { char ->
                val label = if (isShiftEnabled) char.uppercase() else char
                KeyButton(
                    text = label,
                    theme = theme,
                    modifier = Modifier.weight(1f),
                    onClick = { onKeyClick(KeyboardKey.Char(label)) }
                )
            }

            // Backspace Key
            IconButtonKey(
                imageVector = Icons.Default.KeyboardBackspace,
                theme = theme,
                isActivated = false,
                modifier = Modifier.weight(1.3f),
                onClick = { onKeyClick(KeyboardKey.Backspace) }
            )
        }

        // Row 4 (Symbols, Space, Enter)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(4.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Symbols Switcher
            KeyButton(
                text = "?123",
                theme = theme,
                isSpecial = true,
                modifier = Modifier.weight(1.5f),
                onClick = onSymbolsToggle
            )

            // Spacebar
            KeyButton(
                text = "Space",
                theme = theme,
                modifier = Modifier.weight(4.5f),
                onClick = { onKeyClick(KeyboardKey.Space) }
            )

            // Enter / Action Key
            IconButtonKey(
                imageVector = Icons.Default.Check,
                theme = theme,
                isActivated = true,
                modifier = Modifier.weight(1.5f),
                onClick = { onKeyClick(KeyboardKey.Enter) }
            )
        }
    }
}

@Composable
fun SymbolsLayout(
    theme: KeyboardTheme,
    onKeyClick: (KeyboardKey) -> Unit,
    onSymbolsToggle: () -> Unit
) {
    val row1 = listOf("1", "2", "3", "4", "5", "6", "7", "8", "9", "0")
    val row2 = listOf("@", "#", "$", "%", "&", "*", "-", "+", "(", ")")
    val row3 = listOf("!", "\"", "'", ":", ";", "/", "?", ",")

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 4.dp),
        verticalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        // Row 1
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            row1.forEach { char ->
                KeyButton(
                    text = char,
                    theme = theme,
                    modifier = Modifier.weight(1f),
                    onClick = { onKeyClick(KeyboardKey.Char(char)) }
                )
            }
        }

        // Row 2
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            row2.forEach { char ->
                KeyButton(
                    text = char,
                    theme = theme,
                    modifier = Modifier.weight(1f),
                    onClick = { onKeyClick(KeyboardKey.Char(char)) }
                )
            }
        }

        // Row 3
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(4.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Spacer(modifier = Modifier.weight(0.5f))

            row3.forEach { char ->
                KeyButton(
                    text = char,
                    theme = theme,
                    modifier = Modifier.weight(1f),
                    onClick = { onKeyClick(KeyboardKey.Char(char)) }
                )
            }

            // Backspace Key
            IconButtonKey(
                imageVector = Icons.Default.KeyboardBackspace,
                theme = theme,
                isActivated = false,
                modifier = Modifier.weight(1.3f),
                onClick = { onKeyClick(KeyboardKey.Backspace) }
            )
        }

        // Row 4 (Symbols, Space, Enter)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(4.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Symbols Switcher
            KeyButton(
                text = "ABC",
                theme = theme,
                isSpecial = true,
                modifier = Modifier.weight(1.5f),
                onClick = onSymbolsToggle
            )

            // Spacebar
            KeyButton(
                text = "Space",
                theme = theme,
                modifier = Modifier.weight(4.5f),
                onClick = { onKeyClick(KeyboardKey.Space) }
            )

            // Enter / Action Key
            IconButtonKey(
                imageVector = Icons.Default.Check,
                theme = theme,
                isActivated = true,
                modifier = Modifier.weight(1.5f),
                onClick = { onKeyClick(KeyboardKey.Enter) }
            )
        }
    }
}

@Composable
fun KeyButton(
    text: String,
    theme: KeyboardTheme,
    modifier: Modifier = Modifier,
    isSpecial: Boolean = false,
    onClick: () -> Unit
) {
    val bgColor = if (isSpecial) theme.accentBg.copy(alpha = 0.2f) else theme.keyBg
    val textColor = if (isSpecial) theme.accentBg else theme.keyText

    Button(
        onClick = onClick,
        colors = ButtonDefaults.buttonColors(
            containerColor = bgColor,
            contentColor = textColor
        ),
        shape = RoundedCornerShape(6.dp),
        contentPadding = PaddingValues(0.dp),
        modifier = modifier
            .height(48.dp)
            .testTag("key_$text")
    ) {
        Text(
            text = text,
            fontSize = if (text.length > 2) 13.sp else 18.sp,
            fontWeight = FontWeight.Medium
        )
    }
}

@Composable
fun IconButtonKey(
    imageVector: androidx.compose.ui.graphics.vector.ImageVector,
    theme: KeyboardTheme,
    isActivated: Boolean,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    val bgColor = if (isActivated) theme.accentBg else theme.keyBg
    val tintColor = if (isActivated) theme.accentText else theme.keyText

    Button(
        onClick = onClick,
        colors = ButtonDefaults.buttonColors(
            containerColor = bgColor,
            contentColor = tintColor
        ),
        shape = RoundedCornerShape(6.dp),
        contentPadding = PaddingValues(0.dp),
        modifier = modifier.height(48.dp)
    ) {
        Icon(
            imageVector = imageVector,
            contentDescription = null,
            modifier = Modifier.size(20.dp)
        )
    }
}

@Composable
fun InKeyboardLanguagePicker(
    title: String,
    theme: KeyboardTheme,
    selectedLang: Language,
    onLangSelected: (Language) -> Unit,
    onClose: () -> Unit
) {
    var searchQuery by remember { mutableStateOf("") }
    val filteredLanguages = remember(searchQuery) {
        if (searchQuery.isBlank()) {
            Languages.list
        } else {
            Languages.list.filter { it.name.contains(searchQuery, ignoreCase = true) }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .height(280.dp)
            .background(theme.keyboardBg)
            .padding(8.dp)
    ) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = title,
                color = theme.keyText,
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.weight(1f)
            )

            IconButton(
                onClick = onClose,
                colors = IconButtonDefaults.iconButtonColors(contentColor = theme.keyText)
            ) {
                Icon(imageVector = Icons.Default.Close, contentDescription = "Close Language Picker")
            }
        }

        // Search Bar
        TextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            placeholder = { Text("Search 50+ languages...", color = theme.keyText.copy(alpha = 0.5f), fontSize = 13.sp) },
            colors = TextFieldDefaults.colors(
                focusedContainerColor = theme.keyBg,
                unfocusedContainerColor = theme.keyBg,
                focusedTextColor = theme.keyText,
                unfocusedTextColor = theme.keyText,
                cursorColor = theme.accentBg,
                focusedIndicatorColor = Color.Transparent,
                unfocusedIndicatorColor = Color.Transparent
            ),
            shape = RoundedCornerShape(8.dp),
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp)
                .padding(bottom = 6.dp),
            singleLine = true
        )

        Spacer(modifier = Modifier.height(4.dp))

        // Language Grid
        if (filteredLanguages.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                contentAlignment = Alignment.Center
            ) {
                Text("No languages found.", color = theme.keyText.copy(alpha = 0.5f), fontSize = 13.sp)
            }
        } else {
            LazyVerticalGrid(
                columns = GridCells.Fixed(2),
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                verticalArrangement = Arrangement.spacedBy(6.dp),
                modifier = Modifier.weight(1f)
            ) {
                items(filteredLanguages) { lang ->
                    val isSelected = lang.code == selectedLang.code
                    val itemBg = if (isSelected) theme.accentBg else theme.keyBg
                    val itemText = if (isSelected) theme.accentText else theme.keyText

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(6.dp))
                            .background(itemBg)
                            .clickable { onLangSelected(lang) }
                            .padding(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(lang.flag, fontSize = 18.sp)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = lang.name,
                            color = itemText,
                            fontSize = 13.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun InKeyboardThemePicker(
    theme: KeyboardTheme,
    onThemeSelected: (KeyboardTheme) -> Unit,
    onClose: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .height(280.dp)
            .background(theme.keyboardBg)
            .padding(8.dp)
    ) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Customize Keyboard Theme",
                color = theme.keyText,
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.weight(1f)
            )

            IconButton(
                onClick = onClose,
                colors = IconButtonDefaults.iconButtonColors(contentColor = theme.keyText)
            ) {
                Icon(imageVector = Icons.Default.Close, contentDescription = "Close Theme Picker")
            }
        }

        Spacer(modifier = Modifier.height(4.dp))

        // Theme List
        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.weight(1f)
        ) {
            items(KeyboardThemes.list) { item ->
                val isSelected = item.name == theme.name

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(10.dp))
                        .background(
                            Brush.linearGradient(
                                colors = listOf(item.bgGradientStart, item.bgGradientEnd)
                            )
                        )
                        .clickable { onThemeSelected(item) }
                        .padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = item.name,
                            color = if (item.isDark) Color.White else Color.Black,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = if (item.isDark) "Dark Theme Accent" else "Light Theme Accent",
                            color = (if (item.isDark) Color.White else Color.Black).copy(alpha = 0.6f),
                            fontSize = 11.sp
                        )
                    }

                    // Key color indicator dots
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        ColorDot(color = item.keyboardBg, border = Color.Gray)
                        ColorDot(color = item.keyBg, border = Color.Gray)
                        ColorDot(color = item.accentBg)

                        if (isSelected) {
                            Spacer(modifier = Modifier.width(8.dp))
                            Icon(
                                imageVector = Icons.Default.Check,
                                contentDescription = "Active Theme",
                                tint = if (item.isDark) Color.White else Color.Black,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun ColorDot(color: Color, border: Color? = null) {
    Box(
        modifier = Modifier
            .size(16.dp)
            .clip(RoundedCornerShape(8.dp))
            .background(color)
    )
}
