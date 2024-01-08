package daggerquestTests;

import static org.junit.Assert.assertThrows;

import java.util.List;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.NoSuchWindowException;

import constructAutomation.Methods;

class VerifyExitButton extends Methods {
	
	@BeforeAll
	static void setup() {
		
		startDaggerQuest();

		waitForJavascriptToBeTrue("return !!runtime.objects.fader.getFirstInstance();");

		waitForJavascriptToBeTrue("return !runtime.objects.fader.getFirstInstance().opacity;");
	}

	@Test
	@DisplayName("Test the Exit Button on the Main Menu")
	void verifyExitButton() {

		@SuppressWarnings("unchecked")
		List<Double> exitButtonLocation = (List<Double>) executeJavascript(
				"const exitButton = runtime.objects.exit.getFirstInstance();"
						+ "return exitButton.layer.layerToCssPx(exitButton.x, exitButton.y);");

		clickLocation(exitButtonLocation.get(0), exitButtonLocation.get(1));

		assertThrows("DaggerQuest sucessfully exited", NoSuchWindowException.class, () -> driver.getTitle());
	}
}