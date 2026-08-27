package com.example.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "task_items")
data class TaskItem(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val title: String,
    val description: String = "",
    val dueDateMillis: Long = System.currentTimeMillis() + 86400000, // Default tomorrow
    val reminderTimeMillis: Long = 0L, // 0 if no reminder/alarm set
    val priority: String = "درمیانہ (Medium)", // High, Medium, Low
    val isCompleted: Boolean = false,
    val category: String = "اہم کام (Important Task)"
)
