package constructAutomation;

public class Data {
	/**
	 * <h1>Username</h1> Strangely, this is allowed to contain spaces. It isn't
	 * allowed to be an email address.
	 * 
	 * @author laserwolve
	 */
	static String username = "username";
	static String password = "password";
	static String projectName = "DaggerQuest";

	/**
	 * <h1>DaggerQuest Object</h1> This doesn't need to be a class, because we can
	 * just use the actual name of the enumeration to reference the object via
	 * JavaScript. Lowercase to we don't have to convert it every time.
	 * @author laserwolve
	 */
	public enum DaggerQuestObject {
		exit, settings
	}
}