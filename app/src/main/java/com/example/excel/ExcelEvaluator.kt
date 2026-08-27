package com.example.excel

import kotlin.math.max
import kotlin.math.min

object ExcelEvaluator {

    /**
     * Evaluates a cell content string given a 2D matrix of raw cell strings.
     * Prevents cyclic infinite loops by limiting depth.
     */
    fun evaluateCell(rawText: String, grid: List<List<String>>, depth: Int = 0): String {
        val trimmed = rawText.trim()
        if (!trimmed.startsWith("=") || depth > 5) {
            return rawText
        }

        val formula = trimmed.substring(1).trim().uppercase()

        return try {
            when {
                formula.startsWith("SUM(") -> evaluateRangeOp(formula, "SUM", grid, depth)
                formula.startsWith("AVERAGE(") || formula.startsWith("AVG(") -> {
                    val op = if (formula.startsWith("AVERAGE(")) "AVERAGE" else "AVG"
                    evaluateRangeOp(formula, op, grid, depth)
                }
                formula.startsWith("COUNT(") -> evaluateRangeOp(formula, "COUNT", grid, depth)
                formula.startsWith("MIN(") -> evaluateRangeOp(formula, "MIN", grid, depth)
                formula.startsWith("MAX(") -> evaluateRangeOp(formula, "MAX", grid, depth)
                formula.contains("+") -> evaluateBinaryOp(formula, "+", grid, depth)
                formula.contains("-") && !formula.startsWith("-") -> evaluateBinaryOp(formula, "-", grid, depth)
                formula.contains("*") -> evaluateBinaryOp(formula, "*", grid, depth)
                formula.contains("/") -> evaluateBinaryOp(formula, "/", grid, depth)
                else -> {
                    // Try evaluating single cell ref like =A1
                    val valFromCell = resolveCellValue(formula, grid, depth)
                    formatNumberOrText(valFromCell)
                }
            }
        } catch (e: Exception) {
            "#ERROR!"
        }
    }

    private fun evaluateRangeOp(
        formula: String,
        opName: String,
        grid: List<List<String>>,
        depth: Int
    ): String {
        val openParen = formula.indexOf("(")
        val closeParen = formula.lastIndexOf(")")
        if (openParen == -1 || closeParen == -1 || closeParen <= openParen) return "#VALUE!"

        val rangeStr = formula.substring(openParen + 1, closeParen).trim()
        val values = getValuesInRange(rangeStr, grid, depth)

        if (values.isEmpty() && opName != "COUNT") return "0"

        val result = when (opName) {
            "SUM" -> values.sum()
            "AVERAGE", "AVG" -> if (values.isNotEmpty()) values.average() else 0.0
            "COUNT" -> values.size.toDouble()
            "MIN" -> if (values.isNotEmpty()) values.minOrNull() ?: 0.0 else 0.0
            "MAX" -> if (values.isNotEmpty()) values.maxOrNull() ?: 0.0 else 0.0
            else -> 0.0
        }

        return formatNumberOrText(result)
    }

    private fun evaluateBinaryOp(
        formula: String,
        operator: String,
        grid: List<List<String>>,
        depth: Int
    ): String {
        val parts = formula.split(operator)
        if (parts.size != 2) return "#SYNTAX!"

        val leftVal = resolveCellValue(parts[0].trim(), grid, depth)
        val rightVal = resolveCellValue(parts[1].trim(), grid, depth)

        val leftNum = leftVal.toDoubleOrNull() ?: 0.0
        val rightNum = rightVal.toDoubleOrNull() ?: 0.0

        val res = when (operator) {
            "+" -> leftNum + rightNum
            "-" -> leftNum - rightNum
            "*" -> leftNum * rightNum
            "/" -> if (rightNum != 0.0) leftNum / rightNum else return "#DIV/0!"
            else -> 0.0
        }

        return formatNumberOrText(res)
    }

    private fun getValuesInRange(
        rangeStr: String,
        grid: List<List<String>>,
        depth: Int
    ): List<Double> {
        val list = mutableListOf<Double>()
        if (rangeStr.contains(":")) {
            val parts = rangeStr.split(":")
            if (parts.size == 2) {
                val start = parseCellRef(parts[0].trim())
                val end = parseCellRef(parts[1].trim())
                if (start != null && end != null) {
                    val minRow = min(start.first, end.first)
                    val maxRow = max(start.first, end.first)
                    val minCol = min(start.second, end.second)
                    val maxCol = max(start.second, end.second)

                    for (r in minRow..maxRow) {
                        for (c in minCol..maxCol) {
                            val raw = getRawCell(r, c, grid)
                            val eval = evaluateCell(raw, grid, depth + 1)
                            eval.toDoubleOrNull()?.let { list.add(it) }
                        }
                    }
                }
            }
        } else {
            // Comma separated list of cell refs e.g. A1,B2,C3
            val refs = rangeStr.split(",")
            for (ref in refs) {
                val eval = resolveCellValue(ref.trim(), grid, depth)
                eval.toDoubleOrNull()?.let { list.add(it) }
            }
        }
        return list
    }

    private fun resolveCellValue(
        token: String,
        grid: List<List<String>>,
        depth: Int
    ): String {
        // Token could be a number literal, e.g. 100, or cell ref A1
        val num = token.toDoubleOrNull()
        if (num != null) return token

        val cellRef = parseCellRef(token) ?: return token
        val raw = getRawCell(cellRef.first, cellRef.second, grid)
        return evaluateCell(raw, grid, depth + 1)
    }

    private fun getRawCell(row: Int, col: Int, grid: List<List<String>>): String {
        if (row in grid.indices && col in grid[row].indices) {
            return grid[row][col]
        }
        return ""
    }

    /**
     * Converts A1 -> Pair(row=0, col=0), B3 -> Pair(row=2, col=1)
     */
    fun parseCellRef(ref: String): Pair<Int, Int>? {
        val upper = ref.trim().uppercase()
        val regex = Regex("^([A-Z]+)(\\d+)$")
        val match = regex.find(upper) ?: return null

        val colLetters = match.groupValues[1]
        val rowNumber = match.groupValues[2].toIntOrNull() ?: return null

        var col = 0
        for (char in colLetters) {
            col = col * 26 + (char - 'A' + 1)
        }
        col -= 1 // 0-based

        val row = rowNumber - 1 // 0-based
        if (row < 0 || col < 0) return null

        return Pair(row, col)
    }

    fun getColumnName(colIndex: Int): String {
        var temp = colIndex
        val result = StringBuilder()
        while (temp >= 0) {
            result.insert(0, ('A' + (temp % 26)))
            temp = temp / 26 - 1
        }
        return result.toString()
    }

    private fun formatNumberOrText(value: Double): String {
        return if (value % 1.0 == 0.0) {
            value.toLong().toString()
        } else {
            String.format("%.2f", value)
        }
    }

    private fun formatNumberOrText(text: String): String {
        val doubleVal = text.toDoubleOrNull()
        return if (doubleVal != null) {
            formatNumberOrText(doubleVal)
        } else {
            text
        }
    }
}
