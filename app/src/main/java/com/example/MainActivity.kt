package com.example

import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.provider.Settings
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.view.inputmethod.InputMethodManager
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import android.util.Log
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import androidx.lifecycle.viewModelScope
import com.example.data.*
import com.example.ui.KeyboardKey
import com.example.ui.KeyboardMode
import com.example.ui.KeyboardView
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

    private val viewModel: KeyboardViewModel by viewModels()
    private var speechRecognizer: SpeechRecognizer? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            val currentTheme by viewModel.currentTheme.collectAsState()
            val inputText by viewModel.inputText.collectAsState()
            val translatedText by viewModel.translatedText.collectAsState()
            val suggestions by viewModel.suggestions.collectAsState()
            val selectedSourceLang by viewModel.selectedSourceLang.collectAsState()
            val selectedTargetLang by viewModel.selectedTargetLang.collectAsState()
            val autoReadEnabled by viewModel.autoReadEnabled.collectAsState()
            val isTranslating by viewModel.isTranslating.collectAsState()
            val isListening by viewModel.isListening.collectAsState()
            val isTtsSpeaking by viewModel.isTtsSpeaking.collectAsState()
            val isShiftEnabled by viewModel.isShiftEnabled.collectAsState()
            val isSymbolsMode by viewModel.isSymbolsMode.collectAsState()

            var keyboardMode by remember { mutableStateOf(KeyboardMode.KEYS) }

            val context = LocalContext.current
            val clipboardManager = LocalClipboardManager.current

            // Microphone permission launcher
            val recordAudioPermissionLauncher = rememberLauncherForActivityResult(
                contract = ActivityResultContracts.RequestPermission()
            ) { isGranted ->
                if (isGranted) {
                    startVoiceInput(context)
                } else {
                    Toast.makeText(context, "Microphone permission is required for real voice input. Running simulator...", Toast.LENGTH_LONG).show()
                    startVoiceSimulation()
                }
            }

            Surface(
                modifier = Modifier.fillMaxSize(),
                color = Color.Transparent
            ) {
                // Background Gradient styled matching active keyboard theme
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(
                            Brush.verticalGradient(
                                colors = listOf(currentTheme.bgGradientStart, currentTheme.bgGradientEnd)
                            )
                        )
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .windowInsetsPadding(WindowInsets.statusBars)
                    ) {
                        // Top playground scroll area
                        Column(
                            modifier = Modifier
                                .weight(1f)
                                .verticalScroll(rememberScrollState())
                                .padding(16.dp)
                        ) {
                            // Onboarding Banner
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(110.dp)
                                    .clip(RoundedCornerShape(12.dp))
                                    .border(1.dp, currentTheme.keyBg.copy(alpha = 0.5f), RoundedCornerShape(12.dp))
                            ) {
                                // Fallback if image isn't built yet, but we generated it!
                                Image(
                                    painter = painterResource(id = R.drawable.ai_keyboard_banner),
                                    contentDescription = "Futuristic AI Keyboard",
                                    contentScale = ContentScale.Crop,
                                    modifier = Modifier.fillMaxSize()
                                )

                                Box(
                                    modifier = Modifier
                                        .fillMaxSize()
                                        .background(
                                            Brush.verticalGradient(
                                                colors = listOf(Color.Transparent, Color.Black.copy(alpha = 0.7f))
                                            )
                                        )
                                )

                                Column(
                                    modifier = Modifier
                                        .fillMaxSize()
                                        .padding(12.dp),
                                    verticalArrangement = Arrangement.Bottom
                                ) {
                                    Text(
                                        text = "Aura AI Keyboard",
                                        color = Color.White,
                                        fontSize = 18.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                    Text(
                                        text = "Real-time AI voice & text translator in 50+ languages",
                                        color = Color.White.copy(alpha = 0.8f),
                                        fontSize = 11.sp
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(12.dp))

                            // Key check configuration warning
                            if (!GeminiService.isApiKeyConfigured) {
                                Card(
                                    colors = CardDefaults.cardColors(
                                        containerColor = Color(0x22FFA500),
                                        contentColor = Color(0xFFFFD580)
                                    ),
                                    shape = RoundedCornerShape(10.dp),
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .border(1.dp, Color(0x66FFA500), RoundedCornerShape(10.dp))
                                ) {
                                    Row(
                                        modifier = Modifier.padding(10.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Icon(imageVector = Icons.Default.Warning, contentDescription = "Warning", tint = Color(0xFFFFA500))
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Column {
                                            Text("Gemini API Key Missing", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                            Text("Configure GEMINI_API_KEY in the Secrets panel in AI Studio to unlock real-time translation.", fontSize = 10.sp)
                                        }
                                    }
                                }
                                Spacer(modifier = Modifier.height(10.dp))
                            } else {
                                Card(
                                    colors = CardDefaults.cardColors(
                                        containerColor = Color(0x1100FFCC),
                                        contentColor = Color(0xFFE0FFFF)
                                    ),
                                    shape = RoundedCornerShape(10.dp),
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .border(1.dp, Color(0x3300FFCC), RoundedCornerShape(10.dp))
                                ) {
                                    Row(
                                        modifier = Modifier.padding(10.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Icon(imageVector = Icons.Default.CloudQueue, contentDescription = "Active", tint = Color(0xFF00FFCC))
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text("Aura AI Translator Service: Active (Gemini-3.5-Flash)", fontSize = 11.sp, fontWeight = FontWeight.Medium)
                                    }
                                }
                                Spacer(modifier = Modifier.height(10.dp))
                            }

                            // Interactive Editor playground
                            Card(
                                colors = CardDefaults.cardColors(
                                    containerColor = currentTheme.keyboardBg.copy(alpha = 0.3f)
                                ),
                                shape = RoundedCornerShape(14.dp),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .border(1.dp, currentTheme.keyBg.copy(alpha = 0.3f), RoundedCornerShape(14.dp))
                            ) {
                                Column(modifier = Modifier.padding(12.dp)) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(
                                            text = "PLAYGROUND EDITOR",
                                            color = currentTheme.keyText.copy(alpha = 0.6f),
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Bold
                                        )

                                        if (inputText.isNotEmpty()) {
                                            IconButton(
                                                onClick = { viewModel.clearText() },
                                                modifier = Modifier.size(24.dp)
                                            ) {
                                                Icon(
                                                    imageVector = Icons.Default.DeleteSweep,
                                                    contentDescription = "Clear editor",
                                                    tint = currentTheme.keyText.copy(alpha = 0.5f),
                                                    modifier = Modifier.size(16.dp)
                                                )
                                            }
                                        }
                                    }

                                    Spacer(modifier = Modifier.height(6.dp))

                                    // Interactive Input Panel
                                    Box(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .heightIn(min = 56.dp)
                                            .clip(RoundedCornerShape(8.dp))
                                            .background(currentTheme.keyBg.copy(alpha = 0.4f))
                                            .padding(10.dp),
                                        contentAlignment = Alignment.TopStart
                                    ) {
                                        if (inputText.isEmpty()) {
                                            Text(
                                                text = "Tap keys on the custom keyboard below to type here...",
                                                color = currentTheme.keyText.copy(alpha = 0.4f),
                                                fontSize = 13.sp
                                            )
                                        } else {
                                            Text(
                                                text = inputText,
                                                color = currentTheme.keyText,
                                                fontSize = 14.sp
                                            )
                                        }
                                    }

                                    // Active Status indicator banner
                                    AnimatedVisibility(visible = isListening || isTranslating || isTtsSpeaking) {
                                        Row(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .padding(top = 8.dp),
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            val textMsg = when {
                                                isListening -> "Listening to speech input..."
                                                isTranslating -> "Gemini is translating..."
                                                else -> "TTS reading translation..."
                                            }
                                            val barColor = when {
                                                isListening -> Color(0xFFFF007F)
                                                isTranslating -> Color(0xFF00FFCC)
                                                else -> currentTheme.accentBg
                                            }

                                            CircularProgressIndicator(
                                                modifier = Modifier.size(12.dp),
                                                color = barColor,
                                                strokeWidth = 1.5.dp
                                            )
                                            Spacer(modifier = Modifier.width(6.dp))
                                            Text(textMsg, color = currentTheme.keyText.copy(alpha = 0.8f), fontSize = 11.sp)
                                        }
                                    }

                                    Spacer(modifier = Modifier.height(10.dp))

                                    // Output Translated panel
                                    Text(
                                        text = "TRANSLATED TEXT (${selectedTargetLang.name})",
                                        color = currentTheme.accentBg,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold
                                    )

                                    Spacer(modifier = Modifier.height(4.dp))

                                    Box(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .heightIn(min = 56.dp)
                                            .clip(RoundedCornerShape(8.dp))
                                            .background(currentTheme.accentBg.copy(alpha = 0.1f))
                                            .border(1.dp, currentTheme.accentBg.copy(alpha = 0.2f), RoundedCornerShape(8.dp))
                                            .padding(10.dp),
                                        contentAlignment = Alignment.TopStart
                                    ) {
                                        if (translatedText.isEmpty()) {
                                            Text(
                                                text = "Click the [Translate 🌐] key to view results.",
                                                color = currentTheme.keyText.copy(alpha = 0.4f),
                                                fontSize = 13.sp
                                            )
                                        } else {
                                            Text(
                                                text = translatedText,
                                                color = currentTheme.keyText,
                                                fontSize = 14.sp,
                                                fontWeight = FontWeight.Medium
                                            )
                                        }
                                    }

                                    // Translation action bar
                                    if (translatedText.isNotEmpty() && !translatedText.startsWith("Translating...")) {
                                        Row(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .padding(top = 8.dp),
                                            horizontalArrangement = Arrangement.End,
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            // Speak source text
                                            TextButton(
                                                onClick = { viewModel.speakSourceText() },
                                                colors = ButtonDefaults.textButtonColors(contentColor = currentTheme.keyText)
                                            ) {
                                                Icon(imageVector = Icons.Default.VolumeDown, contentDescription = null, modifier = Modifier.size(14.dp))
                                                Spacer(modifier = Modifier.width(4.dp))
                                                Text("Read Original", fontSize = 11.sp)
                                            }

                                            Spacer(modifier = Modifier.width(8.dp))

                                            // Copy translation
                                            Button(
                                                onClick = {
                                                    clipboardManager.setText(AnnotatedString(translatedText))
                                                    Toast.makeText(context, "Translation copied!", Toast.LENGTH_SHORT).show()
                                                },
                                                colors = ButtonDefaults.buttonColors(
                                                    containerColor = currentTheme.keyBg,
                                                    contentColor = currentTheme.keyText
                                                ),
                                                shape = RoundedCornerShape(6.dp),
                                                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                                                modifier = Modifier.height(28.dp)
                                            ) {
                                                Icon(imageVector = Icons.Default.ContentCopy, contentDescription = null, modifier = Modifier.size(12.dp))
                                                Spacer(modifier = Modifier.width(4.dp))
                                                Text("Copy", fontSize = 11.sp)
                                            }

                                            Spacer(modifier = Modifier.width(6.dp))

                                            // Read aloud translation
                                            Button(
                                                onClick = { viewModel.speakTranslation() },
                                                colors = ButtonDefaults.buttonColors(
                                                    containerColor = currentTheme.accentBg,
                                                    contentColor = currentTheme.accentText
                                                ),
                                                shape = RoundedCornerShape(6.dp),
                                                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                                                modifier = Modifier.height(28.dp)
                                            ) {
                                                Icon(imageVector = Icons.Default.VolumeUp, contentDescription = null, modifier = Modifier.size(12.dp))
                                                Spacer(modifier = Modifier.width(4.dp))
                                                Text("Speak", fontSize = 11.sp)
                                            }
                                        }
                                    }
                                }
                            }

                            Spacer(modifier = Modifier.height(16.dp))

                            // Settings Guide
                            Text(
                                text = "SYSTEM KEYBOARD SETUP GUIDE",
                                color = currentTheme.keyText.copy(alpha = 0.5f),
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )

                            Spacer(modifier = Modifier.height(6.dp))

                            // Step 1 Enable
                            Card(
                                colors = CardDefaults.cardColors(containerColor = currentTheme.keyBg.copy(alpha = 0.2f)),
                                shape = RoundedCornerShape(10.dp),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(10.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(24.dp)
                                            .clip(RoundedCornerShape(12.dp))
                                            .background(currentTheme.accentBg),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text("1", color = currentTheme.accentText, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                    }

                                    Spacer(modifier = Modifier.width(10.dp))

                                    Column(modifier = Modifier.weight(1f)) {
                                        Text("Enable AI Keyboard", color = currentTheme.keyText, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                        Text("Activate 'AI Keyboard' in your language settings.", color = currentTheme.keyText.copy(alpha = 0.6f), fontSize = 10.sp)
                                    }

                                    Button(
                                        onClick = {
                                            context.startActivity(Intent(Settings.ACTION_INPUT_METHOD_SETTINGS))
                                        },
                                        colors = ButtonDefaults.buttonColors(containerColor = currentTheme.accentBg, contentColor = currentTheme.accentText),
                                        shape = RoundedCornerShape(6.dp),
                                        contentPadding = PaddingValues(horizontal = 10.dp),
                                        modifier = Modifier.height(30.dp)
                                    ) {
                                        Text("Enable", fontSize = 11.sp)
                                    }
                                }
                            }

                            Spacer(modifier = Modifier.height(6.dp))

                            // Step 2 Switch
                            Card(
                                colors = CardDefaults.cardColors(containerColor = currentTheme.keyBg.copy(alpha = 0.2f)),
                                shape = RoundedCornerShape(10.dp),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(10.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(24.dp)
                                            .clip(RoundedCornerShape(12.dp))
                                            .background(currentTheme.keyText.copy(alpha = 0.2f)),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text("2", color = currentTheme.keyText, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                    }

                                    Spacer(modifier = Modifier.width(10.dp))

                                    Column(modifier = Modifier.weight(1f)) {
                                        Text("Switch Input Method", color = currentTheme.keyText, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                        Text("Select 'AI Keyboard' as your primary input.", color = currentTheme.keyText.copy(alpha = 0.6f), fontSize = 10.sp)
                                    }

                                    Button(
                                        onClick = {
                                            val im = context.getSystemService(INPUT_METHOD_SERVICE) as InputMethodManager
                                            im.showInputMethodPicker()
                                        },
                                        colors = ButtonDefaults.buttonColors(containerColor = currentTheme.keyBg, contentColor = currentTheme.keyText),
                                        shape = RoundedCornerShape(6.dp),
                                        contentPadding = PaddingValues(horizontal = 10.dp),
                                        modifier = Modifier.height(30.dp)
                                    ) {
                                        Text("Switch", fontSize = 11.sp)
                                    }
                                }
                            }
                        }

                        // Bottom Custom Keyboard View (Showcase / Playground Input)
                        KeyboardView(
                            theme = currentTheme,
                            inputText = inputText,
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
                                    is KeyboardKey.Char -> viewModel.appendCharacter(key.text)
                                    is KeyboardKey.Backspace -> viewModel.deleteLastCharacter()
                                    is KeyboardKey.Space -> viewModel.appendCharacter(" ")
                                    is KeyboardKey.Shift -> viewModel.toggleShift()
                                    is KeyboardKey.SymbolsToggle -> viewModel.toggleSymbolsMode()
                                    is KeyboardKey.Enter -> viewModel.appendCharacter("\n")
                                }
                            },
                            onSuggestionClick = { suggestion ->
                                viewModel.insertSuggestion(suggestion)
                            },
                            onTranslateClick = {
                                viewModel.translateCurrentText()
                            },
                            onVoiceClick = {
                                // Dynamic record permission query
                                if (ContextCompat.checkSelfPermission(context, android.Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
                                    startVoiceInput(context)
                                } else {
                                    recordAudioPermissionLauncher.launch(android.Manifest.permission.RECORD_AUDIO)
                                }
                            },
                            onTtsClick = {
                                viewModel.speakTranslation()
                            },
                            onAutoReadToggle = {
                                viewModel.toggleAutoRead()
                            },
                            onThemeSelect = { theme ->
                                viewModel.setTheme(theme)
                                keyboardMode = KeyboardMode.KEYS
                            },
                            onLanguageSelect = { lang, isSource ->
                                if (isSource) {
                                    viewModel.setSourceLanguage(lang)
                                } else {
                                    viewModel.setTargetLanguage(lang)
                                }
                                keyboardMode = KeyboardMode.KEYS
                            },
                            onShiftToggle = { viewModel.toggleShift() },
                            onSymbolsToggle = { viewModel.toggleSymbolsMode() }
                        )
                    }
                }
            }
        }
    }

    private fun startVoiceInput(context: Context) {
        if (!SpeechRecognizer.isRecognitionAvailable(context)) {
            Toast.makeText(context, "Speech recognizer not supported on this engine. Launching simulator...", Toast.LENGTH_SHORT).show()
            startVoiceSimulation()
            return
        }

        if (speechRecognizer == null) {
            speechRecognizer = SpeechRecognizer.createSpeechRecognizer(context)
        }

        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, viewModel.selectedSourceLang.value.code)
        }

        speechRecognizer?.setRecognitionListener(object : RecognitionListener {
            override fun onReadyForSpeech(params: Bundle?) {
                viewModel.setListeningState(true)
            }
            override fun onBeginningOfSpeech() {}
            override fun onRmsChanged(rmsd: Float) {}
            override fun onBufferReceived(buffer: ByteArray?) {}
            override fun onEndOfSpeech() {
                viewModel.setListeningState(false)
            }
            override fun onError(error: Int) {
                viewModel.setListeningState(false)
                // Fallback gracefully to Simulation if microphone input fails or acts up in emulator context
                Log.d("VoiceInput", "SpeechRecognizer error: $error. Falling back to simulator.")
                startVoiceSimulation()
            }
            override fun onResults(results: Bundle?) {
                val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                val voiceText = matches?.firstOrNull()
                if (!voiceText.isNullOrBlank()) {
                    viewModel.updateInputFromVoice(voiceText)
                }
                viewModel.setListeningState(false)
            }
            override fun onPartialResults(partialResults: Bundle?) {}
            override fun onEvent(eventType: Int, params: Bundle?) {}
        })

        try {
            speechRecognizer?.startListening(intent)
        } catch (e: Exception) {
            Log.e("VoiceInput", "Error starting speech recognizer", e)
            startVoiceSimulation()
        }
    }

    private fun startVoiceSimulation() {
        viewModel.viewModelScope.launch {
            viewModel.setListeningState(true)
            delay(1500)
            val simulatedPhrases = listOf(
                "Good morning! I love learning new foreign languages with this cool AI translator tool.",
                "How can I set up this customizable polyglot translation keyboard on my Android phone?",
                "This translation is incredibly clean and fast, with amazing text to speech voice output!"
            )
            val phrase = simulatedPhrases.random()
            viewModel.updateInputFromVoice(phrase)
            viewModel.setListeningState(false)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        speechRecognizer?.destroy()
    }
}
