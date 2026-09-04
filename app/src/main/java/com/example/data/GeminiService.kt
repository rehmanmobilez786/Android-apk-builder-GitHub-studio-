package com.example.data

import android.util.Log
import com.example.BuildConfig
import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST
import retrofit2.http.Query
import java.util.concurrent.TimeUnit

@JsonClass(generateAdapter = true)
data class Part(
    @Json(name = "text") val text: String? = null
)

@JsonClass(generateAdapter = true)
data class Content(
    @Json(name = "parts") val parts: List<Part>
)

@JsonClass(generateAdapter = true)
data class GenerateContentRequest(
    @Json(name = "contents") val contents: List<Content>,
    @Json(name = "systemInstruction") val systemInstruction: Content? = null
)

@JsonClass(generateAdapter = true)
data class Candidate(
    @Json(name = "content") val content: Content?
)

@JsonClass(generateAdapter = true)
data class GenerateContentResponse(
    @Json(name = "candidates") val candidates: List<Candidate>?
)

interface GeminiApiService {
    @POST("v1beta/models/gemini-3.5-flash:generateContent")
    suspend fun generateContent(
        @Query("key") apiKey: String,
        @Body request: GenerateContentRequest
    ): GenerateContentResponse
}

object RetrofitClient {
    private val moshi = Moshi.Builder()
        .addLast(KotlinJsonAdapterFactory())
        .build()

    private val okHttpClient = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()

    private const val BASE_URL = "https://generativelanguage.googleapis.com/"

    val service: GeminiApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(MoshiConverterFactory.create(moshi))
            .build()
            .create(GeminiApiService::class.java)
    }
}

object GeminiService {
    private const val TAG = "GeminiService"

    val apiKey: String
        get() = try {
            BuildConfig.GEMINI_API_KEY
        } catch (e: Throwable) {
            ""
        }

    val isApiKeyConfigured: Boolean
        get() = apiKey.isNotEmpty() && apiKey != "MY_GEMINI_API_KEY"

    suspend fun translate(text: String, sourceLang: String, targetLang: String): String = withContext(Dispatchers.IO) {
        if (text.isBlank()) return@withContext ""
        if (!isApiKeyConfigured) {
            return@withContext "API Key missing. Enter GEMINI_API_KEY in AI Studio Secrets."
        }

        val prompt = """
            Translate the following text from $sourceLang to $targetLang in real-time.
            Only return the exact translated text. Do not include explanation, notes, translation markers, pronunciation, or quotes.
            Text to translate:
            $text
        """.trimIndent()

        val request = GenerateContentRequest(
            contents = listOf(Content(parts = listOf(Part(text = prompt)))),
            systemInstruction = Content(parts = listOf(Part(text = "You are a highly professional real-time translator keyboard assistant. Always translate text accurately and return ONLY the translated text, preserving line breaks if any, without quotes or remarks.")))
        )

        try {
            val response = RetrofitClient.service.generateContent(apiKey, request)
            response.candidates?.firstOrNull()?.content?.parts?.firstOrNull()?.text?.trim() ?: "No translation returned."
        } catch (e: Exception) {
            Log.e(TAG, "Translation error", e)
            "Error: ${e.localizedMessage ?: "Failed to contact Gemini API"}"
        }
    }

    suspend fun getSuggestions(contextBeforeCursor: String): List<String> = withContext(Dispatchers.IO) {
        if (contextBeforeCursor.isBlank()) {
            return@withContext listOf("Hello", "I am", "How are")
        }
        if (!isApiKeyConfigured) {
            return@withContext listOf("How", "Today", "Awesome")
        }

        val prompt = """
            Given the typed text context, suggest up to 3 smart, context-aware continuation completions (next word or brief phrase).
            Return a JSON string array of completions, like: ["today", "going to", "soon"]
            Do not write any notes, codes, explanation or markdown code block. Just return raw JSON.
            Typed context: "$contextBeforeCursor"
        """.trimIndent()

        val request = GenerateContentRequest(
            contents = listOf(Content(parts = listOf(Part(text = prompt)))),
            systemInstruction = Content(parts = listOf(Part(text = "You are a smart autocomplete predictor keyboard. Return ONLY a JSON string array of 3 strings.")))
        )

        try {
            val response = RetrofitClient.service.generateContent(apiKey, request)
            val resultText = response.candidates?.firstOrNull()?.content?.parts?.firstOrNull()?.text?.trim() ?: ""
            parseJsonArray(resultText)
        } catch (e: Exception) {
            Log.e(TAG, "Suggestions error", e)
            listOf("then", "more", "now") // fallback
        }
    }

    private fun parseJsonArray(jsonStr: String): List<String> {
        return try {
            // Try extracting strings using simple Regex to be completely safe from formatting variations or markdown wrappers
            val regex = "\"([^\"]*)\"".toRegex()
            val matches = regex.findAll(jsonStr)
                .map { it.groupValues[1] }
                .filter { it.isNotBlank() && !it.contains("content") && !it.contains("parts") }
                .toList()
            if (matches.isNotEmpty()) {
                matches.take(3)
            } else {
                listOf("then", "more", "now")
            }
        } catch (e: Exception) {
            listOf("then", "more", "now")
        }
    }
}
