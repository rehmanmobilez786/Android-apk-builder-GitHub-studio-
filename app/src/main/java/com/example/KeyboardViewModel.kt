package com.example

import android.app.Application
import android.speech.tts.TextToSpeech
import android.util.Log
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.GeminiService
import com.example.data.KeyboardTheme
import com.example.data.KeyboardThemes
import com.example.data.Language
import com.example.data.Languages
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.util.Locale

class KeyboardViewModel(application: Application) : AndroidViewModel(application), TextToSpeech.OnInitListener {
    private val TAG = "KeyboardViewModel"

    // Text & Translation states
    private val _inputText = MutableStateFlow("")
    val inputText = _inputText.asStateFlow()

    private val _selectedSourceLang = MutableStateFlow(Languages.list[0]) // English
    val selectedSourceLang = _selectedSourceLang.asStateFlow()

    private val _selectedTargetLang = MutableStateFlow(Languages.list[1]) // Spanish
    val selectedTargetLang = _selectedTargetLang.asStateFlow()

    private val _translatedText = MutableStateFlow("")
    val translatedText = _translatedText.asStateFlow()

    // UI Styles & Layout states
    private val _currentTheme = MutableStateFlow(KeyboardThemes.CosmicMidnight)
    val currentTheme = _currentTheme.asStateFlow()

    private val _isShiftEnabled = MutableStateFlow(false)
    val isShiftEnabled = _isShiftEnabled.asStateFlow()

    private val _isSymbolsMode = MutableStateFlow(false)
    val isSymbolsMode = _isSymbolsMode.asStateFlow()

    // Operation / Loading states
    private val _isTranslating = MutableStateFlow(false)
    val isTranslating = _isTranslating.asStateFlow()

    private val _isListening = MutableStateFlow(false)
    val isListening = _isListening.asStateFlow()

    private val _isTtsSpeaking = MutableStateFlow(false)
    val isTtsSpeaking = _isTtsSpeaking.asStateFlow()

    private val _autoReadEnabled = MutableStateFlow(true)
    val autoReadEnabled = _autoReadEnabled.asStateFlow()

    // Smart Suggestions state
    private val _suggestions = MutableStateFlow(listOf("Hello", "I am", "How are"))
    val suggestions = _suggestions.asStateFlow()

    // TTS engine
    private var tts: TextToSpeech? = null
    private var isTtsInitialized = false

    private var suggestionsJob: Job? = null

    init {
        // Initialize Android Text To Speech
        try {
            tts = TextToSpeech(application, this)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to initialize TTS", e)
        }
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            isTtsInitialized = true
            tts?.setPitch(1.0f)
            tts?.setSpeechRate(1.0f)
            Log.d(TAG, "TextToSpeech successfully initialized")
        } else {
            Log.e(TAG, "TextToSpeech initialization failed")
        }
    }

    // Input actions
    fun appendCharacter(char: String) {
        val current = _inputText.value
        _inputText.value = current + char
        onTextChange()
    }

    fun deleteLastCharacter() {
        val current = _inputText.value
        if (current.isNotEmpty()) {
            _inputText.value = current.substring(0, current.length - 1)
            onTextChange()
        }
    }

    fun clearText() {
        _inputText.value = ""
        _translatedText.value = ""
        onTextChange()
    }

    fun insertSuggestion(suggestion: String) {
        val words = _inputText.value.split(" ").toMutableList()
        if (words.isNotEmpty()) {
            // Replace the last typing fragment or just append
            val lastWord = words.last()
            if (lastWord.isNotBlank() && suggestion.lowercase().startsWith(lastWord.lowercase())) {
                words[words.size - 1] = suggestion
            } else {
                if (words.last().isBlank()) {
                    words[words.size - 1] = suggestion
                } else {
                    words.add(suggestion)
                }
            }
            _inputText.value = words.joinToString(" ") + " "
        } else {
            _inputText.value = suggestion + " "
        }
        onTextChange()
    }

    private fun onTextChange() {
        // Trigger smart suggestions with a 400ms debounce
        suggestionsJob?.cancel()
        suggestionsJob = viewModelScope.launch {
            delay(400)
            val textContext = _inputText.value
            if (textContext.isNotBlank()) {
                val results = GeminiService.getSuggestions(textContext)
                _suggestions.value = results
            } else {
                _suggestions.value = listOf("Hello", "I am", "How are")
            }
        }
    }

    // Setters
    fun setSourceLanguage(language: Language) {
        _selectedSourceLang.value = language
    }

    fun setTargetLanguage(language: Language) {
        _selectedTargetLang.value = language
    }

    fun setTheme(theme: KeyboardTheme) {
        _currentTheme.value = theme
    }

    fun toggleShift() {
        _isShiftEnabled.value = !_isShiftEnabled.value
    }

    fun toggleSymbolsMode() {
        _isSymbolsMode.value = !_isSymbolsMode.value
    }

    fun setSymbolsMode(enabled: Boolean) {
        _isSymbolsMode.value = enabled
    }

    fun toggleAutoRead() {
        _autoReadEnabled.value = !_autoReadEnabled.value
    }

    fun updateInputFromVoice(voiceText: String) {
        _inputText.value = voiceText
        onTextChange()
        translateCurrentText()
    }

    fun setListeningState(listening: Boolean) {
        _isListening.value = listening
    }

    // Translation engine
    fun translateCurrentText() {
        val textToTranslate = _inputText.value
        if (textToTranslate.isBlank()) return

        _isTranslating.value = true
        _translatedText.value = "Translating..."

        viewModelScope.launch {
            val result = GeminiService.translate(
                text = textToTranslate,
                sourceLang = _selectedSourceLang.value.name,
                targetLang = _selectedTargetLang.value.name
            )
            _translatedText.value = result
            _isTranslating.value = false

            // Automatically read aloud if auto-read is enabled
            if (_autoReadEnabled.value && !result.startsWith("Error:") && !result.startsWith("API Key missing")) {
                speakText(result, _selectedTargetLang.value.code)
            }
        }
    }

    // TTS speak
    fun speakTranslation() {
        val text = _translatedText.value
        if (text.isNotBlank() && !text.startsWith("Translating...") && !text.startsWith("Error:")) {
            speakText(text, _selectedTargetLang.value.code)
        }
    }

    fun speakSourceText() {
        val text = _inputText.value
        if (text.isNotBlank()) {
            speakText(text, _selectedSourceLang.value.code)
        }
    }

    private fun speakText(text: String, languageCode: String) {
        if (!isTtsInitialized || tts == null) {
            Log.e(TAG, "TTS not initialized")
            return
        }

        _isTtsSpeaking.value = true
        val locale = getLocaleForCode(languageCode)
        tts?.language = locale

        // Use UTTERANCE_ID to track complete status
        val params = android.os.Bundle()
        params.putString(TextToSpeech.Engine.KEY_PARAM_UTTERANCE_ID, "ai_keyboard_speak")

        tts?.speak(text, TextToSpeech.QUEUE_FLUSH, params, "ai_keyboard_speak")

        // Set TTS listener to toggle state when finished
        tts?.setOnUtteranceProgressListener(object : android.speech.tts.UtteranceProgressListener() {
            override fun onStart(utteranceId: String?) {}
            override fun onDone(utteranceId: String?) {
                _isTtsSpeaking.value = false
            }
            @Deprecated("Deprecated in Java")
            override fun onError(utteranceId: String?) {
                _isTtsSpeaking.value = false
            }
            override fun onError(utteranceId: String?, errorCode: Int) {
                _isTtsSpeaking.value = false
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
            "bn" -> Locale("bn", "BD")
            "nl" -> Locale("nl", "NL")
            "tr" -> Locale("tr", "TR")
            "pl" -> Locale("pl", "PL")
            "sv" -> Locale("sv", "SE")
            "no" -> Locale("no", "NO")
            "da" -> Locale("da", "DK")
            "fi" -> Locale("fi", "FI")
            "el" -> Locale("el", "GR")
            "cs" -> Locale("cs", "CZ")
            "hu" -> Locale("hu", "HU")
            "ro" -> Locale("ro", "RO")
            "vi" -> Locale("vi", "VN")
            "th" -> Locale("th", "TH")
            "id" -> Locale("id", "ID")
            "ms" -> Locale("ms", "MY")
            "tl" -> Locale("tl", "PH")
            "uk" -> Locale("uk", "UA")
            "he" -> Locale("he", "IL")
            "fa" -> Locale("fa", "IR")
            "sk" -> Locale("sk", "SK")
            "hr" -> Locale("hr", "HR")
            "sr" -> Locale("sr", "RS")
            "bg" -> Locale("bg", "BG")
            "ca" -> Locale("ca", "ES")
            "et" -> Locale("et", "EE")
            "ga" -> Locale("ga", "IE")
            "is" -> Locale("is", "IS")
            "lt" -> Locale("lt", "LT")
            "lv" -> Locale("lv", "LV")
            "gu" -> Locale("gu", "IN")
            "kn" -> Locale("kn", "IN")
            "ml" -> Locale("ml", "IN")
            "mr" -> Locale("mr", "IN")
            "ta" -> Locale("ta", "IN")
            "te" -> Locale("te", "IN")
            "ur" -> Locale("ur", "PK")
            "sw" -> Locale("sw", "KE")
            "cy" -> Locale("cy", "GB")
            else -> Locale(code)
        }
    }

    override fun onCleared() {
        super.onCleared()
        try {
            tts?.stop()
            tts?.shutdown()
        } catch (e: Exception) {
            Log.e(TAG, "Error shutting down TTS", e)
        }
    }
}
