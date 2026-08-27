package com.example.data

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface NotebookDao {
    // Diary Entries
    @Query("SELECT * FROM diary_entries ORDER BY dateMillis DESC")
    fun getAllDiaryEntries(): Flow<List<DiaryEntry>>

    @Query("SELECT * FROM diary_entries WHERE id = :id")
    suspend fun getDiaryEntryById(id: Long): DiaryEntry?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertDiaryEntry(entry: DiaryEntry): Long

    @Update
    suspend fun updateDiaryEntry(entry: DiaryEntry)

    @Delete
    suspend fun deleteDiaryEntry(entry: DiaryEntry)

    @Query("DELETE FROM diary_entries WHERE id = :id")
    suspend fun deleteDiaryEntryById(id: Long)


    // Task Items
    @Query("SELECT * FROM task_items ORDER BY isCompleted ASC, dueDateMillis ASC")
    fun getAllTasks(): Flow<List<TaskItem>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTask(task: TaskItem): Long

    @Update
    suspend fun updateTask(task: TaskItem)

    @Delete
    suspend fun deleteTask(task: TaskItem)

    @Query("DELETE FROM task_items WHERE id = :id")
    suspend fun deleteTaskById(id: Long)


    // Spreadsheet Tables
    @Query("SELECT * FROM spreadsheet_tables ORDER BY updatedAtMillis DESC")
    fun getAllSpreadsheets(): Flow<List<SpreadsheetTable>>

    @Query("SELECT * FROM spreadsheet_tables WHERE id = :id")
    suspend fun getSpreadsheetById(id: Long): SpreadsheetTable?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSpreadsheet(table: SpreadsheetTable): Long

    @Update
    suspend fun updateSpreadsheet(table: SpreadsheetTable)

    @Delete
    suspend fun deleteSpreadsheet(table: SpreadsheetTable)

    @Query("DELETE FROM spreadsheet_tables WHERE id = :id")
    suspend fun deleteSpreadsheetById(id: Long)
}
