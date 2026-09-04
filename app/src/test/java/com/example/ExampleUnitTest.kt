package com.example

import com.example.data.KeyboardThemes
import com.example.data.Languages
import org.junit.Assert.*
import org.junit.Test

/**
 * Example local unit test, which will execute on the development machine (host).
 *
 * See [testing documentation](http://d.android.com/tools/testing).
 */
class ExampleUnitTest {
  @Test
  fun addition_isCorrect() {
    assertEquals(4, 2 + 2)
  }

  @Test
  fun testLanguagesListContainsOverFiftyLanguages() {
    val size = Languages.list.size
    assertTrue("Languages list should contain over 50 languages (found: $size)", size >= 50)
  }

  @Test
  fun testThemesConfigurationContainsAllThemes() {
    val themeNames = KeyboardThemes.list.map { it.name }
    assertTrue(themeNames.contains("Cosmic Midnight"))
    assertTrue(themeNames.contains("Cyberpunk Neon"))
    assertTrue(themeNames.contains("Warm Sunset"))
    assertTrue(themeNames.contains("Emerald Forest"))
    assertTrue(themeNames.contains("Minimal Light"))
    assertEquals(5, KeyboardThemes.list.size)
  }
}
