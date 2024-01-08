package daggerquestTests;

import org.junit.platform.suite.api.SelectClasses;
import org.junit.platform.suite.api.Suite;

@Suite
@SelectClasses({
	
	VerifyExitButton.class,
	PrimaryTestRun.class,
})
public class AllTests {

}
