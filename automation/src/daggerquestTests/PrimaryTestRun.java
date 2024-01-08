package daggerquestTests;

import static org.junit.Assert.assertTrue;

import org.junit.Before;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import constructAutomation.ConstructMethods;

class PrimaryTestRun extends ConstructMethods {
	
	@Before
	void setup() {
		
		startDaggerQuest();
	}

	@Test
	@DisplayName("Verify Fader Functionality")
	void verifyExitButton() {

		assertTrue("Fader is present", waitForJavascriptToBeTrue("return !!runtime.objects.fader.getFirstInstance();"));

		assertTrue("Fader sucessfully faded out",
				waitForJavascriptToBeTrue("return !runtime.objects.fader.getFirstInstance().opacity;"));
	}
}