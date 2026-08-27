package com.example.data

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import org.json.JSONArray

class AppRepository(private val dao: NotebookDao) {

    val allDiaryEntries: Flow<List<DiaryEntry>> = dao.getAllDiaryEntries()
    val allTasks: Flow<List<TaskItem>> = dao.getAllTasks()
    val allSpreadsheets: Flow<List<SpreadsheetTable>> = dao.getAllSpreadsheets()

    suspend fun getDiaryEntryById(id: Long) = dao.getDiaryEntryById(id)
    suspend fun insertDiaryEntry(entry: DiaryEntry) = dao.insertDiaryEntry(entry)
    suspend fun updateDiaryEntry(entry: DiaryEntry) = dao.updateDiaryEntry(entry)
    suspend fun deleteDiaryEntry(entry: DiaryEntry) = dao.deleteDiaryEntry(entry)
    suspend fun deleteDiaryEntryById(id: Long) = dao.deleteDiaryEntryById(id)

    suspend fun insertTask(task: TaskItem) = dao.insertTask(task)
    suspend fun updateTask(task: TaskItem) = dao.updateTask(task)
    suspend fun deleteTask(task: TaskItem) = dao.deleteTask(task)
    suspend fun deleteTaskById(id: Long) = dao.deleteTaskById(id)

    suspend fun getSpreadsheetById(id: Long) = dao.getSpreadsheetById(id)
    suspend fun insertSpreadsheet(table: SpreadsheetTable) = dao.insertSpreadsheet(table)
    suspend fun updateSpreadsheet(table: SpreadsheetTable) = dao.updateSpreadsheet(table)
    suspend fun deleteSpreadsheet(table: SpreadsheetTable) = dao.deleteSpreadsheet(table)
    suspend fun deleteSpreadsheetById(id: Long) = dao.deleteSpreadsheetById(id)

    suspend fun prepopulateSampleDataIfNeeded() {
        val currentDiary = allDiaryEntries.first()
        if (currentDiary.isEmpty()) {
            dao.insertDiaryEntry(
                DiaryEntry(
                    title = "First Journal Reflection",
                    content = "Today I started using my new Personal Notebook app! It is clean, secure, and helps me keep track of daily thoughts, tasks, and spreadsheets in one place.",
                    mood = "😊",
                    tags = "personal, journal, reflection",
                    isFavorite = true,
                    category = "Diary"
                )
            )
            dao.insertDiaryEntry(
                DiaryEntry(
                    title = "Monthly Goals & Planning",
                    content = "Key priorities for this month:\n1. Write daily in my journal for 5 minutes.\n2. Organize monthly household expenses in the spreadsheet tab.\n3. Set up task alarm reminders for team meetings.",
                    mood = "🎯",
                    tags = "goals, plan, important",
                    isFavorite = false,
                    category = "Planning"
                )
            )
        }

        val currentTasks = allTasks.first()
        if (currentTasks.isEmpty()) {
            val now = System.currentTimeMillis()
            dao.insertTask(
                TaskItem(
                    title = "Prepare Monthly Grocery & Budget List",
                    description = "Update the household expense spreadsheet and organize weekly groceries.",
                    dueDateMillis = now + 86400000L,
                    reminderTimeMillis = now + 3600000L,
                    priority = "High",
                    isCompleted = false,
                    category = "Home"
                )
            )
            dao.insertTask(
                TaskItem(
                    title = "Utility & Electricity Bills Payment",
                    description = "Pay monthly utility bills online and record transaction receipts in notebook.",
                    dueDateMillis = now + (86400000L * 2),
                    reminderTimeMillis = now + (86400000L * 2) - 7200000L,
                    priority = "High",
                    isCompleted = false,
                    category = "Finance"
                )
            )
            dao.insertTask(
                TaskItem(
                    title = "Weekly Cloud Sync & Backup",
                    description = "Backup all entries, tasks, and spreadsheet data to secure cloud storage.",
                    dueDateMillis = now + (86400000L * 5),
                    reminderTimeMillis = 0L,
                    priority = "Medium",
                    isCompleted = true,
                    category = "Security"
                )
            )
        }

        val currentSheets = allSpreadsheets.first()
        if (currentSheets.isEmpty()) {
            // Pre-create standard Excel templates!
            // 1. Monthly Budget Sheet
            val budgetHeaders = JSONArray().apply {
                put("Description")
                put("Type")
                put("Budget")
                put("Actual")
                put("Difference")
                put("Notes")
            }.toString()

            val budgetRows = JSONArray().apply {
                put(JSONArray().apply { put("House Rent"); put("Essential"); put("30000"); put("30000"); put("=C1-D1"); put("Paid on time") })
                put(JSONArray().apply { put("Groceries"); put("Food"); put("25000"); put("23500"); put("=C2-D2"); put("Under budget") })
                put(JSONArray().apply { put("Utilities"); put("Bills"); put("12000"); put("11800"); put("=C3-D3"); put("Savings") })
                put(JSONArray().apply { put("Fuel & Travel"); put("Transport"); put("10000"); put("9500"); put("=C4-D4"); put("Fuel card") })
                put(JSONArray().apply { put("Medical & Misc"); put("Health"); put("5000"); put("3000"); put("=C5-D5"); put("Emergency fund") })
                put(JSONArray().apply { put("Total Expenses"); put("Summary"); put("=SUM(C1:C5)"); put("=SUM(D1:D5)"); put("=SUM(E1:E5)"); put("Overall Report") })
            }.toString()

            dao.insertSpreadsheet(
                SpreadsheetTable(
                    name = "Monthly Household Budget",
                    category = "Finance",
                    rowsCount = 6,
                    colsCount = 6,
                    headersJson = budgetHeaders,
                    gridDataJson = budgetRows
                )
            )

            // 2. Habit & Attendance Tracker
            val habitHeaders = JSONArray().apply {
                put("Habit")
                put("Goal")
                put("Mon"); put("Tue"); put("Wed"); put("Thu"); put("Fri"); put("Sat"); put("Sun"); put("Total")
            }.toString()

            val habitRows = JSONArray().apply {
                put(JSONArray().apply { put("Morning Walk"); put("7 Days"); put("1"); put("1"); put("1"); put("1"); put("1"); put("0"); put("1"); put("=SUM(C1:I1)") })
                put(JSONArray().apply { put("Daily Reading"); put("7 Days"); put("1"); put("0"); put("1"); put("1"); put("1"); put("1"); put("0"); put("=SUM(C2:I2)") })
                put(JSONArray().apply { put("Journal Writing"); put("7 Days"); put("1"); put("1"); put("1"); put("1"); put("1"); put("1"); put("1"); put("=SUM(C3:I3)") })
            }.toString()

            dao.insertSpreadsheet(
                SpreadsheetTable(
                    name = "Weekly Habit Tracker",
                    category = "Daily",
                    rowsCount = 3,
                    colsCount = 10,
                    headersJson = habitHeaders,
                    gridDataJson = habitRows
                )
            )
        }
    }
}
