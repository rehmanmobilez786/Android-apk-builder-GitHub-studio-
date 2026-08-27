package com.example

import android.inputmethodservice.InputMethodService
import android.speech.tts.TextToSpeech
import android.util.Log
import android.view.View
import android.view.inputmethod.EditorInfo
import android.widget.Toast
import androidx.compose.runtime.*
import androidx.compose.ui.platform.ComposeView
import androidx.lifecycle.*
import androidx.lifecycle.setViewTreeLifecycleOwner
import androidx.lifecycle.setViewTreeViewModelStoreOwner
import androidx.savedstate.SavedStateRegistry
import androidx.savedstate.SavedStateRegistryController
import androidx.savedstate.SavedStateRegistryOwner
import androidx.savedstate.setViewTreeSavedStateRegistryOwner
import com.example.data.*
import com.example.ui.KeyboardKey
import com.example.ui.KeyboardMode
import com.example.ui.KeyboardView
import kotlinx.coroutines.*
import java.util.Locale

class AIKeyboardService : InputMethodService(), LifecycleOwner, ViewModelStoreOwner, SavedStateRegistryOwner, TextToSpeech.OnInitListener {
    private val TAG = "AIKeyboardService"

    // Lifecycle, VM and SavedState boilerplate for Jetpack Compose support in Service
    private val lifecycleRegistry = LifecycleRegistry(this)
    override val lifecycle: Lifecycle = lifecycleRegistry

    private val store = ViewModelStore()
    override val viewModelStore: ViewModelStore = store

    private val savedStateRegistryController = SavedStateRegistryController.create(this)
    override val savedStateRegistry: SavedStateRegistry = savedStateRegistryController.savedStateRegistry

    // Service-specific coroutine scope
    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    private var suggestionsJob: Job? = null

    // TTS engine for the system keyboard
    private var tts: TextToSpeech? = null
    private var isTtsInitialized = false

    override fun onCreate() {
        super.onCreate()
        lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_CREATE)
        savedStateRegistryController.performRestore(null)

        try {
            tts = TextToSpeech(this, this)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to initialize Service TTS", e)
        }
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            isTtsInitialized = true
            tts?.setPitch(1.0f)
            tts?.setSpeechRate(1.0f)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_DESTROY)
        serviceScope.cancel()
        try {
            tts?.stop()
            tts?.shutdown()
        } catch (e: Exception) {
            Log.e(TAG, "Error cleaning up Service TTS", e)
        }
    }

    override fun onCreateInputView(): View {
        val composeView = ComposeView(this)

        // Bind the view tree owners so Compose can compile correctly
        composeView.setViewTreeLifecycleOwner(this)
        composeView.setViewTreeViewModelStoreOwner(this)
        composeView.setViewTreeSavedStateRegistryOwner(this)

        composeView.setContent {
            // Live state properties for the system keyboard instance
            var textState by remember { mutableStateOf("") }
            var selectedSourceLang by remember { mutableStateOf(Languages.list[0]) } // English
            var selectedTargetLang by remember { mutableStateOf(Languages.list[1]) } // Spanish
            var suggestions by remember { mutableStateOf(listOf("Hello", "Today", "Let's")) }
            var currentTheme by remember { mutableStateOf(KeyboardThemes.CosmicMidnight) }
            var isShiftEnabled by remember { mutableStateOf(false) }
            var isSymbolsMode by remember { mutableStateOf(false) }
            var isTranslating by remember { mutableStateOf(false) }
            var isListening by remember { mutableStateOf(false) }
            var isTtsSpeaking by remember { mutableStateOf(false) }
            var autoReadEnabled by remember { mutableStateOf(true) }
            var keyboardMode by remember { mutableStateOf(KeyboardMode.KEYS) }

            // Periodically check active editor context to refresh suggestions
            LaunchedEffect(Unit) {
                while (isActive) {
                    val textBefore = currentInputConnection?.getTextBeforeCursor(100, 0)?.toString() ?: ""
                    if (textBefore != textState) {
                        textState = textBefore
                        fetchSuggestions(textBefore) { suggestions = it }
                    }
                    delay(800) // check every 800ms for user manual backspaces/typing
                }
            }

            KeyboardView(
                theme = currentTheme,
                inputText = textState,
                suggestions = suggestions,
                selectedSourceLang = selectedSourceLang,
                selectedTargetLang = selectedTargetLang,
                autoReadEnabled = autoReadEnabled,
                isTranslating = isTranslating,
                isListening = isListening,
                isTtsSpeaking = isTtsSpeaking,
                isShiftEnabled = isShiftEnabled,
                isSymbolsMode = isSymbolsMode,
                keyboardMode = keyboardMode,
                onModeChange = { keyboardMode = it },
                onKeyClick = { key ->
                    when (key) {
                        is KeyboardKey.Char -> {
                            currentInputConnection?.commitText(key.text, 1)
                            textState += key.text
                            fetchSuggestions(textState) { suggestions = it }
                        }
                        is KeyboardKey.Backspace -> {
                            currentInputConnection?.deleteSurroundingText(1, 0)
                            if (textState.isNotEmpty()) {
                                textState = textState.substring(0, textState.length - 1)
                                fetchSuggestions(textState) { suggestions = it }
                            }
                        }
                        is KeyboardKey.Space -> {
                            currentInputConnection?.commitText(" ", 1)
                            textState += " "
                            fetchSuggestions(textState) { suggestions = it }
                        }
                        is KeyboardKey.Shift -> {
                            isShiftEnabled = !isShiftEnabled
                        }
                        is KeyboardKey.SymbolsToggle -> {
                            isSymbolsMode = !isSymbolsMode
                        }
                        is KeyboardKey.Enter -> {
                            currentInputConnection?.commitText("\n", 1)
                            textState += "\n"
                        }
                    }
                },
                onSuggestionClick = { suggestion ->
                    // Replace or append
                    val words = textState.split(" ").toMutableList()
                    if (words.isNotEmpty()) {
                        val lastWord = words.last()
                        if (lastWord.isNotBlank() && suggestion.lowercase().startsWith(lastWord.lowercase())) {
                            val diff = suggestion.length - lastWord.length
                            currentInputConnection?.deleteSurroundingText(lastWord.length, 0)
                            currentInputConnection?.commitText(suggestion + " ", 1)
                        } else {
                            currentInputConnection?.commitText(suggestion + " ", 1)
                        }
                    } else {
                        currentInputConnection?.commitText(suggestion + " ", 1)
                    }
                    val textBefore = currentInputConnection?.getTextBeforeCursor(100, 0)?.toString() ?: ""
                    textState = textBefore
                    fetchSuggestions(textState) { suggestions = it }
                },
                onTranslateClick = {
                    val rawText = currentInputConnection?.getTextBeforeCursor(300, 0)?.toString() ?: ""
                    if (rawText.isNotBlank()) {
                        isTranslating = true
                        serviceScope.launch {
                            val translated = GeminiService.translate(rawText, selectedSourceLang.name, selectedTargetLang.name)
                            if (translated.isNotBlank() && !translated.startsWith("Error:") && !translated.startsWith("API Key missing")) {
                                currentInputConnection?.deleteSurroundingText(rawText.length, 0)
                                currentInputConnection?.commitText(translated, 1)
                                textState = translated

                                if (autoReadEnabled) {
                                    speakOut(translated, selectedTargetLang.code) { isTtsSpeaking = it }
                                }
                            } else {
                                Toast.makeText(this@AIKeyboardService, translated, Toast.LENGTH_LONG).show()
                            }
                            isTranslating = false
                        }
                    }
                },
                onVoiceClick = {
                    // Voice translation simulator/guide for system IME context
                    isListening = true
                    serviceScope.launch {
                        delay(1200)
                        currentInputConnection?.commitText("How are you today?", 1)
                        textState += "How are you today?"
                        isListening = false
                        Toast.makeText(this@AIKeyboardService, "Voice typed: How are you today? (Translating...)", Toast.LENGTH_SHORT).show()
                        
                        // auto translate
                        isTranslating = true
                        val translated = GeminiService.translate("How are you today?", selectedSourceLang.name, selectedTargetLang.name)
                        currentInputConnection?.deleteSurroundingText("How are you today?".length, 0)
                        currentInputConnection?.commitText(translated, 1)
                        textState = translated
                        isTranslating = false
                        
                        if (autoReadEnabled) {
                            speakOut(translated, selectedTargetLang.code) { isTtsSpeaking = it }
                        }
                    }
                },
                onTtsClick = {
                    val rawText = currentInputConnection?.getTextBeforeCursor(300, 0)?.toString() ?: ""
                    if (rawText.isNotBlank()) {
                        speakOut(rawText, selectedTargetLang.code) { isTtsSpeaking = it }
                    }
                },
                onAutoReadToggle = {
                    autoReadEnabled = !autoReadEnabled
                },
                onThemeSelect = { themeSelect ->
                    currentTheme = themeSelect
                    keyboardMode = KeyboardMode.KEYS
                },
                onLanguageSelect = { langSelect, isSource ->
                    if (isSource) {
                        selectedSourceLang = langSelect
                    } else {
                        selectedTargetLang = langSelect
                    }
                    keyboardMode = KeyboardMode.KEYS
                },
                onShiftToggle = { isShiftEnabled = !isShiftEnabled },
                onSymbolsToggle = { isSymbolsMode = !isSymbolsMode }
            )
        }

        return composeView
    }

    private fun fetchSuggestions(text: String, onResult: (List<String>) -> Unit) {
        suggestionsJob?.cancel()
        suggestionsJob = serviceScope.launch {
            delay(400)
            if (text.isNotBlank()) {
                val results = GeminiService.getSuggestions(text)
                onResult(results)
            } else {
                onResult(listOf("Hello", "Today", "Let's"))
            }
        }
    }

    private fun speakOut(text: String, langCode: String, onSpeakState: (Boolean) -> Unit) {
        if (!isTtsInitialized || tts == null) return

        onSpeakState(true)
        val locale = getLocaleForCode(langCode)
        tts?.language = locale

        val params = android.os.Bundle()
        params.putString(TextToSpeech.Engine.KEY_PARAM_UTTERANCE_ID, "service_speak")
        tts?.speak(text, TextToSpeech.QUEUE_FLUSH, params, "service_speak")

        tts?.setOnUtteranceProgressListener(object : android.speech.tts.UtteranceProgressListener() {
            override fun onStart(utteranceId: String?) {}
            override fun onDone(utteranceId: String?) {
                onSpeakState(false)
            }
            @Deprecated("Deprecated in Java")
            override fun onError(utteranceId: String?) {
                onSpeakState(false)
            }
            override fun onError(utteranceId: String?, errorCode: Int) {
                onSpeakState(false)
            }
        })
    }

    private fun getLocaleForCode(code: String): Locale {
        return when (code.lowercase()) {
            "en" -> Locale.US
            "es" -> Locale("es", "ES")
            "fr" -> Locale.FRANCE
            "de" -> Locale.GERMANY
            "it" -> Locale.ITALY
            "pt" -> Locale("pt", "PT")
            "zh-cn" -> Locale.SIMPLIFIED_CHINESE
            "zh-tw" -> Locale.TRADITIONAL_CHINESE
            "ja" -> Locale.JAPAN
            "ko" -> Locale.KOREA
            "hi" -> Locale("hi", "IN")
            "ar" -> Locale("ar")
            "ru" -> Locale("ru", "RU")
            else -> Locale(code)
        }
    }

    override fun onStartInputView(info: EditorInfo?, restarting: Boolean) {
        super.onStartInputView(info, restarting)
        lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_START)
    }

    override fun onFinishInputView(finishingInput: Boolean) {
        super.onFinishInputView(finishingInput)
        lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_STOP)
    }
}
