package com.example.excel

import org.json.JSONArray

object CsvHelper {

    fun exportToCsv(headersJson: String, gridDataJson: String): String {
        val sb = StringBuilder()
        try {
            val headers = JSONArray(headersJson)
            val headerRow = mutableListOf<String>()
            for (i in 0 until headers.length()) {
                headerRow.add(escapeCsv(headers.getString(i)))
            }
            sb.append(headerRow.joinToString(",")).append("\n")

            val grid = JSONArray(gridDataJson)
            for (r in 0 until grid.length()) {
                val rowArray = grid.getJSONArray(r)
                val rowCells = mutableListOf<String>()
                for (c in 0 until rowArray.length()) {
                    rowCells.add(escapeCsv(rowArray.getString(c)))
                }
                sb.append(rowCells.joinToString(",")).append("\n")
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        return sb.toString()
    }

    private fun escapeCsv(value: String): String {
        return if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            "\"" + value.replace("\"", "\"\"") + "\""
        } else {
            value
        }
    }

    fun parseCsv(csvText: String): Pair<List<String>, List<List<String>>> {
        val lines = csvText.lines().filter { it.isNotBlank() }
        if (lines.isEmpty()) return Pair(emptyList(), emptyList())

        val parseRow = { line: String ->
            val cells = mutableListOf<String>()
            var inQuotes = false
            val current = StringBuilder()
            var i = 0
            while (i < line.length) {
                val c = line[i]
                if (c == '"') {
                    if (inQuotes && i + 1 < line.length && line[i + 1] == '"') {
                        current.append('"')
                        i++
                    } else {
                        inQuotes = !inQuotes
                    }
                } else if (c == ',' && !inQuotes) {
                    cells.add(current.toString().trim())
                    current.clear()
                } else {
                    current.append(c)
                }
                i++
            }
            cells.add(current.toString().trim())
            cells
        }

        val headers = parseRow(lines[0])
        val rows = lines.drop(1).map { parseRow(it) }
        return Pair(headers, rows)
    }
}
