package constructAutomation;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.NoSuchWindowException;

class DaggerQuestTest extends Methods {

	@Test
	void test() {
		
		startProject();

		click("exit");

		verifyThrows("DaggerQuest sucessfully exited", NoSuchWindowException.class, () -> driver.getTitle());
		
		startProject();

		click("settings");

		verifyTrue("Settings menu is present",
				(boolean) executeJavascript("return runtime.layout.getLayer('settingsMenu').isVisible"));

		click("back");

		verifyTrue("Settings menu is not present",
				!(boolean) executeJavascript("return runtime.layout.getLayer('settingsMenu').isVisible"));

		quit();
	}
}