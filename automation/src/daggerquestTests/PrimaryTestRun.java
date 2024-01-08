package daggerquestTests;

import static org.junit.Assert.assertTrue;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import constructAutomation.Methods;

class PrimaryTestRun extends Methods {
	
	@BeforeAll
	static void setup() {
		
		startDaggerQuest();
	}
	
	@AfterAll
	static void tearDown() {
		
		quit();
	}

	@Test
	@DisplayName("Verify Fader Functionality")
	void verifyExitButton() {

		assertTrue("Fader is present", waitForJavascriptToBeTrue("return !!runtime.objects.fader.getFirstInstance();"));

		assertTrue("Fader sucessfully faded out",
				waitForJavascriptToBeTrue("return !runtime.objects.fader.getFirstInstance().opacity;"));
	}
}