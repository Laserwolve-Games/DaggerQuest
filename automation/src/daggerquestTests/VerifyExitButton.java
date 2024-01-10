package daggerquestTests;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.NoSuchWindowException;

import constructAutomation.Methods;

class VerifyExitButton extends Methods {
	
	@Test
	@DisplayName("Test the Exit Button on the Main Menu")
	void verifyExitButton() {
		
		startDaggerQuest();

		click(DaggerQuestObject.exit);

		verifyThrows("DaggerQuest sucessfully exited", NoSuchWindowException.class, () -> driver.getTitle());
	}
}