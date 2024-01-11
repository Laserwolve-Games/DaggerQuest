package daggerquestTests;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import constructAutomation.Methods;

class PrimaryTest extends Methods {

	@Test
	@DisplayName("Primary Test")
	void primaryTest() {

		startDaggerQuest();

		click(DaggerQuestObject.settings);

		verifyTrue("Settings menu is present",
				(boolean) executeJavascript("return runtime.layout.getLayer('settingsMenu').isVisible"));

		click(DaggerQuestObject.back);

		verifyTrue("Settings menu is not present",
				!(boolean) executeJavascript("return runtime.layout.getLayer('settingsMenu').isVisible"));

		quit();
	}
}