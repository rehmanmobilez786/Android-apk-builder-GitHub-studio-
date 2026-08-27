package com.example.backup

import com.example.data.DiaryEntry
import com.example.data.SpreadsheetTable
import com.example.data.TaskItem
import org.json.JSONArray
import org.json.JSONObject

data class CloudBackupInfo(
    val timestamp: Long,
    val diaryCount: Int,
    val taskCount: Int,
    val sheetCount: Int,
    val sizeKb: Double,
    val isAutoSyncActive: Boolean
)

object CloudSyncManager {

    fun generateBackupJson(
        diaryEntries: List<DiaryEntry>,
        tasks: List<TaskItem>,
        sheets: List<SpreadsheetTable>
    ): String {
        val root = JSONObject()
        root.put("version", 1)
        root.put("exportTime", System.currentTimeMillis())

        val diaryArray = JSONArray()
        for (d in diaryEntries) {
            val obj = JSONObject()
            obj.put("title", d.title)
            obj.put("content", d.content)
            obj.put("dateMillis", d.dateMillis)
            obj.put("mood", d.mood)
            obj.put("tags", d.tags)
            obj.put("isFavorite", d.isFavorite)
            obj.put("category", d.category)
            diaryArray.put(obj)
        }
        root.put("diaryEntries", diaryArray)

        val taskArray = JSONArray()
        for (t in tasks) {
            val obj = JSONObject()
            obj.put("title", t.title)
            obj.put("description", t.description)
            obj.put("dueDateMillis", t.dueDateMillis)
            obj.put("reminderTimeMillis", t.reminderTimeMillis)
            obj.put("priority", t.priority)
            obj.put("isCompleted", t.isCompleted)
            obj.put("category", t.category)
            taskArray.put(obj)
        }
        root.put("tasks", taskArray)

        val sheetArray = JSONArray()
        for (s in sheets) {
            val obj = JSONObject()
            obj.put("name", s.name)
            obj.put("category", s.category)
            obj.put("rowsCount", s.rowsCount)
            obj.put("colsCount", s.colsCount)
            obj.put("headersJson", s.headersJson)
            obj.put("gridDataJson", s.gridDataJson)
            obj.put("createdAtMillis", s.createdAtMillis)
            obj.put("updatedAtMillis", s.updatedAtMillis)
            sheetArray.put(obj)
        }
        root.put("sheets", sheetArray)

        return root.toString(2)
    }

    fun parseBackupJson(jsonString: String): Triple<List<DiaryEntry>, List<TaskItem>, List<SpreadsheetTable>>? {
        return try {
            val root = JSONObject(jsonString)

            val diaryEntries = mutableListOf<DiaryEntry>()
            if (root.has("diaryEntries")) {
                val array = root.getJSONArray("diaryEntries")
                for (i in 0 until array.length()) {
                    val obj = array.getJSONObject(i)
                    diaryEntries.add(
                        DiaryEntry(
                            title = obj.getString("title"),
                            content = obj.getString("content"),
                            dateMillis = obj.optLong("dateMillis", System.currentTimeMillis()),
                            mood = obj.optString("mood", "😊"),
                            tags = obj.optString("tags", ""),
                            isFavorite = obj.optBoolean("isFavorite", false),
                            category = obj.optString("category", "عام (General)")
                        )
                    )
                }
            }

            val tasks = mutableListOf<TaskItem>()
            if (root.has("tasks")) {
                val array = root.getJSONArray("tasks")
                for (i in 0 until array.length()) {
                    val obj = array.getJSONObject(i)
                    tasks.add(
                        TaskItem(
                            title = obj.getString("title"),
                            description = obj.optString("description", ""),
                            dueDateMillis = obj.optLong("dueDateMillis", System.currentTimeMillis()),
                            reminderTimeMillis = obj.optLong("reminderTimeMillis", 0L),
                            priority = obj.optString("priority", "درمیانہ (Medium)"),
                            isCompleted = obj.optBoolean("isCompleted", false),
                            category = obj.optString("category", "اہم کام (Important Task)")
                        )
                    )
                }
            }

            val sheets = mutableListOf<SpreadsheetTable>()
            if (root.has("sheets")) {
                val array = root.getJSONArray("sheets")
                for (i in 0 until array.length()) {
                    val obj = array.getJSONObject(i)
                    sheets.add(
                        SpreadsheetTable(
                            name = obj.getString("name"),
                            category = obj.optString("category", "بجٹ (Budget)"),
                            rowsCount = obj.optInt("rowsCount", 10),
                            colsCount = obj.optInt("colsCount", 6),
                            headersJson = obj.optString("headersJson", "[]"),
                            gridDataJson = obj.optString("gridDataJson", "[]"),
                            createdAtMillis = obj.optLong("createdAtMillis", System.currentTimeMillis()),
                            updatedAtMillis = obj.optLong("updatedAtMillis", System.currentTimeMillis())
                        )
                    )
                }
            }

            Triple(diaryEntries, tasks, sheets)
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }
}
