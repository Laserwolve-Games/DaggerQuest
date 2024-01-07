package daggerquestTests;

import static org.junit.Assert.assertThrows;
import static org.junit.Assert.assertTrue;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.NoSuchWindowException;

import constructAutomation.ConstructMethods;

class VerifyExitButton extends ConstructMethods {

	@Test
	@DisplayName("Test the Exit Button on the Main Menu")
	void test() {

		String name = startGame("C:\\Users\\Andre\\Downloads\\DaggerQuest WebView2\\x64\\DaggerQuest.exe");

		assertTrue("Fader is present", waitForJavascriptToBeTrue("return !!runtime.objects.fader.getFirstInstance();"));

		assertTrue("Fader sucessfully faded out",
				waitForJavascriptToBeTrue("return !runtime.objects.fader.getFirstInstance().opacity;"));

		@SuppressWarnings("unchecked")
		List<Double> exitButtonLocation = (List<Double>) executeJavascript(
				"const exitButton = runtime.objects.exit.getFirstInstance();"
						+ "return exitButton.layer.layerToCssPx(exitButton.x, exitButton.y);");

		clickLocation(exitButtonLocation.get(0), exitButtonLocation.get(1));

		assertThrows(name + "sucessfully exited", NoSuchWindowException.class, () -> driver.getTitle());
	}
}