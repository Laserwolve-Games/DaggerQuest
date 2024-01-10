package daggerquestTests;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import constructAutomation.Methods;

class PrimaryTest extends Methods {

	@Test
	@DisplayName("Primary Test")
	void verifyExitButton() {
		
		startDaggerQuest();

		verifyTrue("Fader is present", waitForJavascriptToBeTrue("return !!runtime.objects.fader.getFirstInstance();"));

		verifyTrue("Fader sucessfully faded out",
				waitForJavascriptToBeTrue("return !runtime.objects.fader.getFirstInstance().opacity;"));

		click(DaggerQuestObject.settings);
		
		quit();
	}
}