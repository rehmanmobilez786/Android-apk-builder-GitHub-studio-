package com.example.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "diary_entries")
data class DiaryEntry(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val title: String,
    val content: String,
    val dateMillis: Long = System.currentTimeMillis(),
    val mood: String = "😊", // Emoji or description
    val tags: String = "", // Comma-separated tags
    val isFavorite: Boolean = false,
    val category: String = "عام (General)"
)
