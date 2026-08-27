package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Book
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Cloud
import androidx.compose.material.icons.filled.GridOn
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.ui.AppTab
import com.example.ui.BiometricLockScreen
import com.example.ui.NotebookViewModel
import com.example.ui.ThemeMode
import com.example.ui.screens.BackupScreen
import com.example.ui.screens.DiaryScreen
import com.example.ui.screens.ExcelScreen
import com.example.ui.screens.SettingsScreen
import com.example.ui.screens.TasksScreen
import com.example.ui.theme.NotebookTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            val viewModel: NotebookViewModel = viewModel()
            val themeMode by viewModel.themeMode.collectAsStateWithLifecycle()

            val isDark = when (themeMode) {
                ThemeMode.SYSTEM -> isSystemInDarkTheme()
                ThemeMode.LIGHT -> false
                ThemeMode.DARK -> true
            }

            NotebookTheme(darkTheme = isDark) {
                MainAppScreen(viewModel = viewModel)
            }
        }
    }
}

@Composable
fun MainAppScreen(viewModel: NotebookViewModel) {
    val isUnlocked by viewModel.isUnlocked.collectAsStateWithLifecycle()
    val pinError by viewModel.pinError.collectAsStateWithLifecycle()

    if (!isUnlocked) {
        BiometricLockScreen(
            pinError = pinError,
            onUnlockWithPin = { viewModel.unlockWithPin(it) },
            onUnlockWithBiometric = { viewModel.unlockWithBiometric() }
        )
    } else {
        val selectedTab by viewModel.selectedTab.collectAsStateWithLifecycle()
        val themeMode by viewModel.themeMode.collectAsStateWithLifecycle()

        // State collections for screens
        val filteredDiaryEntries by viewModel.filteredDiaryEntries.collectAsStateWithLifecycle()
        val diarySearchQuery by viewModel.diarySearchQuery.collectAsStateWithLifecycle()
        val selectedMoodFilter by viewModel.selectedMoodFilter.collectAsStateWithLifecycle()

        val filteredTasks by viewModel.filteredTasks.collectAsStateWithLifecycle()
        val taskFilterCompleted by viewModel.taskFilterCompleted.collectAsStateWithLifecycle()

        val spreadsheets by viewModel.spreadsheets.collectAsStateWithLifecycle()
        val selectedSpreadsheet by viewModel.selectedSpreadsheet.collectAsStateWithLifecycle()
        val selectedCell by viewModel.selectedCell.collectAsStateWithLifecycle()
        val formulaInput by viewModel.formulaInput.collectAsStateWithLifecycle()

        val cloudBackupStatus by viewModel.cloudBackupStatus.collectAsStateWithLifecycle()
        val lastBackupTime by viewModel.lastBackupTime.collectAsStateWithLifecycle()

        Scaffold(
            modifier = Modifier.fillMaxSize(),
            bottomBar = {
                NavigationBar(modifier = Modifier.testTag("main_navigation_bar")) {
                    NavigationBarItem(
                        selected = selectedTab == AppTab.DIARY,
                        onClick = { viewModel.selectTab(AppTab.DIARY) },
                        icon = { Icon(imageVector = Icons.Default.Book, contentDescription = "Diary") },
                        label = { Text("Diary") },
                        modifier = Modifier.testTag("nav_item_diary")
                    )
                    NavigationBarItem(
                        selected = selectedTab == AppTab.TASKS,
                        onClick = { viewModel.selectTab(AppTab.TASKS) },
                        icon = { Icon(imageVector = Icons.Default.CheckCircle, contentDescription = "Tasks") },
                        label = { Text("Tasks") },
                        modifier = Modifier.testTag("nav_item_tasks")
                    )
                    NavigationBarItem(
                        selected = selectedTab == AppTab.EXCEL,
                        onClick = { viewModel.selectTab(AppTab.EXCEL) },
                        icon = { Icon(imageVector = Icons.Default.GridOn, contentDescription = "Excel") },
                        label = { Text("Excel") },
                        modifier = Modifier.testTag("nav_item_excel")
                    )
                    NavigationBarItem(
                        selected = selectedTab == AppTab.BACKUP,
                        onClick = { viewModel.selectTab(AppTab.BACKUP) },
                        icon = { Icon(imageVector = Icons.Default.Cloud, contentDescription = "Backup") },
                        label = { Text("Cloud") },
                        modifier = Modifier.testTag("nav_item_backup")
                    )
                    NavigationBarItem(
                        selected = selectedTab == AppTab.SETTINGS,
                        onClick = { viewModel.selectTab(AppTab.SETTINGS) },
                        icon = { Icon(imageVector = Icons.Default.Settings, contentDescription = "Settings") },
                        label = { Text("Settings") },
                        modifier = Modifier.testTag("nav_item_settings")
                    )
                }
            }
        ) { padding ->
            Scaffold(modifier = Modifier.padding(padding)) { innerPadding ->
                val modifier = Modifier.padding(innerPadding)
                when (selectedTab) {
                    AppTab.DIARY -> DiaryScreen(
                        entries = filteredDiaryEntries,
                        searchQuery = diarySearchQuery,
                        onSearchQueryChange = { viewModel.setDiarySearchQuery(it) },
                        selectedMood = selectedMoodFilter,
                        onMoodSelected = { viewModel.setMoodFilter(it) },
                        onSaveEntry = { viewModel.addOrUpdateDiaryEntry(it) },
                        onDeleteEntry = { viewModel.deleteDiaryEntry(it) },
                        onToggleFavorite = { viewModel.toggleFavoriteDiary(it) }
                    )
                    AppTab.TASKS -> TasksScreen(
                        tasks = filteredTasks,
                        filterCompleted = taskFilterCompleted,
                        onFilterChange = { viewModel.setTaskFilter(it) },
                        onSaveTask = { viewModel.saveTask(it) },
                        onToggleCompleted = { viewModel.toggleTaskCompleted(it) },
                        onDeleteTask = { viewModel.deleteTask(it) }
                    )
                    AppTab.EXCEL -> ExcelScreen(
                        spreadsheets = spreadsheets,
                        selectedSheet = selectedSpreadsheet,
                        selectedCell = selectedCell,
                        formulaInput = formulaInput,
                        onOpenSheet = { viewModel.openSpreadsheet(it) },
                        onCloseSheet = { viewModel.closeSpreadsheet() },
                        onSelectCell = { r, c -> viewModel.selectCell(r, c) },
                        onFormulaInputChange = { viewModel.updateFormulaInput(it) },
                        onApplyFormula = { viewModel.applyFormulaToCurrentCell() },
                        onAddRow = { viewModel.addRowToSpreadsheet(it) },
                        onAddCol = { viewModel.addColumnToSpreadsheet(it) },
                        onCreateNewSheet = { viewModel.createNewSpreadsheet(it) },
                        onDeleteSheet = { viewModel.deleteSpreadsheet(it) },
                        onExportCsv = { viewModel.exportSpreadsheetToCsv(it) },
                        onImportCsv = { title, csv -> viewModel.importSpreadsheetFromCsv(title, csv) },
                        parseGridData = { json, r, c -> viewModel.parseGridData(json, r, c) },
                        parseHeaders = { json, c -> viewModel.parseHeaders(json, c) }
                    )
                    AppTab.BACKUP -> BackupScreen(
                        statusMessage = cloudBackupStatus,
                        lastBackupTime = lastBackupTime,
                        onPerformBackup = { viewModel.performCloudBackup() },
                        onRestoreBackup = { viewModel.restoreBackupFromJson(it) }
                    )
                    AppTab.SETTINGS -> SettingsScreen(
                        currentTheme = themeMode,
                        securityManager = viewModel.securityManager,
                        onThemeChange = { viewModel.setThemeMode(it) },
                        onToggleBiometric = { viewModel.toggleBiometric(it) },
                        onTogglePinLock = { enabled, pin -> viewModel.togglePinLock(enabled, pin) },
                        onLockAppNow = { viewModel.lockApp() }
                    )
                }
            }
        }
    }
}
