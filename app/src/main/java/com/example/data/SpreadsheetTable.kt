package com.example.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "spreadsheet_tables")
data class SpreadsheetTable(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String,
    val category: String = "بجٹ اور حساب (Budget & Calculation)",
    val rowsCount: Int = 10,
    val colsCount: Int = 6,
    val headersJson: String = "[]",
    val gridDataJson: String = "[]",
    val createdAtMillis: Long = System.currentTimeMillis(),
    val updatedAtMillis: Long = System.currentTimeMillis()
)
