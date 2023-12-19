package constructAutomation;

import java.awt.AWTException;
import java.awt.Robot;
import java.awt.Toolkit;
import java.awt.datatransfer.StringSelection;
import java.awt.event.KeyEvent;
import java.io.File;
import java.io.StringWriter;
import java.io.PrintWriter;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Paths;
import java.time.Duration;
import java.time.LocalTime;
import java.util.Map;
import java.util.Objects;

import org.apache.commons.compress.utils.FileNameUtils;
import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Keys;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.edge.EdgeOptions;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;

import constructAutomation.ConstructXpaths.Dialog.AnimationsEditor;
import constructAutomation.ConstructXpaths.Dialog.AnimationsEditor.Animations;
import constructAutomation.ConstructXpaths.Dialog.AnimationsEditor.Animations.AnimationContextMenu;
import constructAutomation.ConstructXpaths.Dialog.AnimationsEditor.Animations.ContextMenu;
import constructAutomation.ConstructXpaths.Dialog.AnimationsEditor.Animations.ContextMenu.importAnimationPopout;
import constructAutomation.ConstructXpaths.Dialog.AnimationsEditor.CropDropdown;
import constructAutomation.ConstructXpaths.Dialog.AnimationsEditor.ImagePoints;
import constructAutomation.ConstructXpaths.Dialog.AnimationsEditor.ImagePoints.ImagePointsContextMenu;
import constructAutomation.ConstructXpaths.Dialog.BetaUpdateAvailable;
import constructAutomation.ConstructXpaths.Dialog.ConstructUpdated;
import constructAutomation.ConstructXpaths.Dialog.ExportProject;
import constructAutomation.ConstructXpaths.Dialog.ExportProject.ExportReport;
import constructAutomation.ConstructXpaths.Dialog.ExportProject.NwjsOptions;
import constructAutomation.ConstructXpaths.Dialog.ExportProject.Page2;
import constructAutomation.ConstructXpaths.Dialog.ExportProject.Page2.LosslessFormatOptions;
import constructAutomation.ConstructXpaths.Dialog.ExportProject.Page2.LossyFormatOptions;
import constructAutomation.ConstructXpaths.Dialog.ExportProject.Page2.MinifyModes;
import constructAutomation.ConstructXpaths.Dialog.LogIn;
import constructAutomation.ConstructXpaths.Dialog.NewProject;
import constructAutomation.ConstructXpaths.Dialog.Welcome;
import constructAutomation.ConstructXpaths.MenuDropdown.ProjectPopout;
import constructAutomation.ConstructXpaths.MenuDropdown.ProjectPopout.OpenRecentPopout;
import io.github.bonigarcia.wdm.WebDriverManager;
import io.github.bonigarcia.wdm.config.WebDriverManagerException;

/**
 * <h1>Construct Methods</h1> A helper class for common Construct actions.
 *
 * @author laserwolve
 */
public class ConstructMethods extends ConstructXpaths {
	protected static EdgeOptions edgeOptions;
	protected static WebDriver driver;
	protected static JavascriptExecutor javascriptExecutor;
	protected static Actions actions;
	protected static Robot robot;
	protected static LocalTime expiryTime;
	protected static String userHome;
	protected static String fs;
	protected static String editorURL;

	/**
	 * <h1>Start Engine</h1> Opens the Construct Editor. Launches 'inprivate' to
	 * prevent signing into the browser.
	 *
	 * @return The current URL, once starting has finished.
	 * @author laserwolve
	 */
	protected static String startEngine(boolean logIn) {

		driver = WebDriverManager.edgedriver()
				.capabilities(new EdgeOptions().addArguments("start-maximized").addArguments("inprivate")).create();

		initializeObjects();

		editorURL = "https://editor.construct.net/";

		driver.get(editorURL);

		dismissWelcomeDialog();

		handleUpdate();

		if (logIn)
			logIn();

		return driver.getCurrentUrl();
	}

	/**
	 * <h1>Start Game</h1>Launches a Construct game. If the Construct game is using
	 * an NW.js version that doesn't match the latest Google Chrome version,
	 * WebDriverManager throws an exception. The stack trace from this exception is
	 * the only place where we can find out what Chromium version NW.js is. This
	 * method catches that exception, parses out the correct Chromium version, and
	 * to create the webDriver again, with the Chromium version specified. This only
	 * will happen the first time we run against any given NW.js executable.
	 * Subsequent {@link WebDriverManager#create()} calls without specifying browser
	 * version will work fine.
	 * 
	 * @param path The path of to the NW.js executable of the Construct game.
	 * @return The title of the game window.
	 * @author laserwolve
	 */
	protected static String startGame(String path) {

		WebDriverManager webDriverManager = WebDriverManager.chromedriver()
				.capabilities(new ChromeOptions().setBinary(path).addArguments("start-maximized"));

		try {

			driver = webDriverManager.create();

		} catch (WebDriverManagerException webDriverManagerException) {

			StringWriter stringWriter = new StringWriter();

			webDriverManagerException.printStackTrace(new PrintWriter(stringWriter));

			String stackTrace = stringWriter.toString();

			String chromiumVersion = stackTrace.split("Current browser version is ")[1].split(" ")[0].split("\\.")[0];

			driver = webDriverManager.browserVersion(chromiumVersion).create();
		}

		initializeObjects();
		
		// Find the runtime
		executeJavascript("globalThis.runtime = null;\r\n"
				+ "for (let i = 0; i < 1000; i++)\r\n"
				+ "{    \r\n"
				+ "    const instance = IRuntime.prototype.getInstanceByUid(i);\r\n"
				+ "\r\n"
				+ "    if (instance === null) continue;\r\n"
				+ "\r\n"
				+ "    globalThis.runtime = instance.runtime;\r\n"
				+ "\r\n"
				+ "    break;\r\n"
				+ "}");

		return driver.getTitle();
	}
	
	protected static void clickLocation(Double exitButtonX, Double exitButtonY) {
		actions.moveToLocation(exitButtonX.intValue(), exitButtonY.intValue()).click().perform();
	}

	protected static void initializeObjects() {

		javascriptExecutor = (JavascriptExecutor) driver;
		actions = new Actions(driver);
		try {
			robot = new Robot();
		} catch (AWTException ignored) {
		}
		userHome = System.getProperty("user.home");
		fs = File.separator;
	}

	/**
	 * <h1>Handle Update</h1> Handles the Construct engine update prompts that
	 * appear when at startup.
	 * 
	 * @author laserwolve
	 */
	protected static void handleUpdate() {

		try {
			waitUntilElementIsPresent(betaUpdateAvailable);
		} catch (TimeoutException e) {
			return;
		}

		click(BetaUpdateAvailable.update);

		click(ConstructUpdated.notNow);
	}

	/**
	 * <h1>Add Child Element</h1> Creates a new element with the specified
	 * attributes under the specified element. Locates and returns the newly created
	 * element with an XPath derived from its tag name and attribute values.
	 *
	 * @param xpath      The locator for the element under which to create the new
	 *                   element.
	 * @param tagName    The tag name of the new element.
	 * @param attributes Pairs of attributes and values for the new element.
	 * @return An XPath locator for the new element.
	 * @author laserwolve
	 */
	String addChildElement(String xpath, String tagName, Map<String, String> attributes) {
		String setAttributes = "";
		String locatorXpath = "";
		WebElement webElement = presentElement(xpath);

		for (Map.Entry<String, String> entry : attributes.entrySet()) {
			setAttributes += tagName + ".setAttribute('" + entry.getKey() + "', '" + entry.getValue() + "');";

			locatorXpath += "[@" + entry.getKey() + "='" + entry.getValue() + "']";
		}

		executeJavascript("let " + tagName + " = document.createElement('" + tagName + "');"
				+ setAttributes + "arguments[0].appendChild(document.createElement('" + tagName + "'));", webElement);

		return "(" + xpath + "/" + tagName + locatorXpath + ")[last()]";
	}

	/**
	 * <h1>Click</h1> Clicks the element specified in the XPath.
	 *
	 * @param xpath The XPath of the element to click.
	 * @author laserwolve
	 * @see {@link org.openqa.selenium.WebElement#click()}
	 */
	protected static void click(String xpath) {
		clickableElement(xpath).click();
	}

	/**
	 * <h1>Locate</h1> Turns an XPath string into a <code>By</code> locator.
	 *
	 * @param xpath The XPath, as a string.
	 * @return A <code>By</code> locator based upon the referenced XPath.
	 */
	protected static By locate(String xpath) {
		return By.xpath(xpath);
	}

	/**
	 * <h1>Clickable Element</h1> Returns the element specified by the XPath, after
	 * it has become clickable.
	 *
	 * @param xpath The XPath of the element to click.
	 * @see {@link #clickableElement(By, int)}
	 * @return The clickable element.
	 * @author laserwolve
	 */
	protected static WebElement clickableElement(String xpath) {
		return clickableElement(xpath, 5);
	}

	/**
	 * <h1>Clickable Element</h1> Returns the element specified by the XPath, after
	 * it has become clickable.
	 *
	 * @param xpath   The XPath of the element to click.
	 * @param seconds The length of time, in seconds, to wait for this element to
	 *                become clickable.
	 * @return The clickable element.
	 * @author laserwolve
	 */
	protected static WebElement clickableElement(String xpath, int seconds) {
		return stop(seconds).until(ExpectedConditions.elementToBeClickable(locate(xpath)));
	}

	/**
	 * <h1>Element</h1> Returns the element specified by the Xpath.
	 * 
	 * @param xpath The XPath of the element to click.
	 * @return The element.
	 */
	protected static WebElement element(String xpath) {
		return driver.findElement(locate(xpath));
	}

	/**
	 * <h1>Dismiss Welcome Dialog</h1> Dismisses the welcome popup, and waits for it
	 * to disappear.
	 *
	 * @author laserwolve
	 */
	protected static void dismissWelcomeDialog() {
		click(Welcome.noThanksNotNow);

		waitUntilElementIsGone(welcome);
	}

	/**
	 * <h1>Element is Present</h1> Determine whether or an element is present.
	 *
	 * @param String The XPath of the element in question.
	 * @return Whether or not the element is present.
	 * @author laserwolve
	 */
	protected static boolean elementIsPresent(String xpath) {
		return driver.findElements(locate(xpath)).size() != 0;
	}

	/**
	 * <h1>Export Project</h1> Exports the currently open project. TODO: Get the
	 * project name of the open project. Parameterize the export settings.
	 *
	 * @param projectName The name of the project that's being exported.
	 * @throws InterruptedException
	 */
	protected static void exportProject(String projectName) {
		click(menu);

		click(MenuDropdown.project);

		click(ProjectPopout.export);

		click(ExportProject.nwjs);

		click(ExportProject.next);

		click(Page2.deduplicateImages);

		click(Page2.losslessFormat);

		click(LosslessFormatOptions.webp);

		click(Page2.lossyFormat);

		click(LossyFormatOptions.webp);

		click(Page2.minifyMode);

		click(MinifyModes.advanced);

		click(Page2.next);

		waitUntilElementIsGone(progressDialog, 10); // "Loading NW.js versions..."

		click(NwjsOptions.linux32); // Uncheck

		click(NwjsOptions.linux64); // Uncheck

		click(NwjsOptions.mac64); // Uncheck

		click(NwjsOptions.win32); // Uncheck

		click(NwjsOptions.windowFrame); // Uncheck

		click(NwjsOptions.resizableWindow); // Uncheck

		click(NwjsOptions.enableDevTools); // Uncheck

		click(NwjsOptions.exportForSteam); // Check

		click(NwjsOptions.next);

		waitUntilElementIsGone(progressDialog, 6000);

		click(ExportReport.downloadLink);

		setExpiryTime(30);

		// TODO: Set to browser default download location, instead of the download
		// folder.
		// Is the downloads folder always the default on a new browser session?
		while (Files.notExists(Paths.get(userHome + fs + "Downloads" + fs + projectName + ".zip"),
				LinkOption.NOFOLLOW_LINKS))
			if (hasExpired())
				exceededExpiryTime("Unable to locate exported project");
	}

	/**
	 * <h1>Is Signed Out</h1> Check whether or not the user signed out.
	 *
	 * @return whether or not the user is signed out.
	 * @author laserwolve
	 */
	protected static boolean isSignedOut() {
		setExpiryTime(10);

		while (clickableElement(UserAccount.userAccountName).getText().equals("..."))
			if (hasExpired())
				exceededExpiryTime("Unable to complete sign-in");

		return clickableElement(UserAccount.userAccountName).getText().equals("Guest");
	}

	/**
	 * <h1>Check Expiry</h1> Check if the expiry time has been exceeded.
	 *
	 * @return whether or not the current time is past the expiry time.
	 * @author laserwolve
	 */
	protected static boolean hasExpired() {
		return LocalTime.now().isAfter(expiryTime);
	}

	/**
	 * <h1>Set Expiry Time</h1> Set the time that, when exceeded, will indicate a
	 * process has exceeded its normal boundaries.
	 *
	 * @param seconds The number of seconds to set.
	 * @author laserwolve
	 */
	protected static void setExpiryTime(int seconds) {
		expiryTime = LocalTime.now().plusSeconds(seconds);
	}

	/**
	 * <h1>Exceeded Expiry Time</h1> Throws a {@link TimeoutException}, with a
	 * message.
	 *
	 * @param message The message to include with the exception.
	 * @author laserwolve
	 */
	protected static void exceededExpiryTime(String message) {
		throw new TimeoutException(message);
	}

	/**
	 * <h1>Log In</h1> Logs in to the Construct Editor.
	 *
	 * @author laserwolve
	 */
	protected static void logIn() {
		if (isSignedOut()) {
			click(userAccount);

			click(AccountDropdown.logIn);

			switchToIframe(iframe);

			sendText(LogIn.username, SensitiveData.username, true);

			sendText(LogIn.password, SensitiveData.password, true);

			click(LogIn.logIn);

			waitUntilElementIsGone(logIn);

			switchToDefaultContent();

			waitUntilTextIs(UserAccount.userAccountName, SensitiveData.username, 10);
		}
	}

	/**
	 * <h1>Open a Project Folder</h1> Opens a Construct 3 project folder. The amount
	 * of time it takes a project to load is determined both by the project's size
	 * and speed of the computer. Uses keyboard commands to interact with the
	 * Chromium "Let site edit files?" popup.
	 *
	 * @param projectName A string which is contained by the name of the project to
	 *                    open.
	 * @author laserwolve
	 * @throws InterruptedException from {@link Thread#sleep(long)}
	 */
	protected static void openRecentProject(String projectName) {
		click(menu);

		click(MenuDropdown.project);

		click(ProjectPopout.openRecent);

		click(OpenRecentPopout.recentProject(projectName));

		robot.delay(1000); // TODO: Replace this. I can't find a chrome flag to allow file editing.

		robot.keyPress(KeyEvent.VK_LEFT);
		robot.keyRelease(KeyEvent.VK_LEFT); // Give "Edit files" focus
		robot.keyPress(KeyEvent.VK_ENTER);
		robot.keyRelease(KeyEvent.VK_ENTER); // Select "Edit files"

		waitUntilElementIsPresent(progressDialog);

		waitUntilElementIsGone(progressDialog, 600);
	}

	/** @See {@link #presentElement(By, int)} */
	protected static WebElement presentElement(String xpath) {
		return presentElement(xpath, 5);
	}

	/**
	 * <h1>Present Element</h1> Gets the element specified, as long as it is present
	 * within the DOM within the time limit specified.
	 *
	 * @param by      The locator of the element to find.
	 * @param Seconds The number of seconds to wait for the element to be present.
	 * @return The present element.
	 * @author laserwolve
	 */
	protected static WebElement presentElement(String xpath, int seconds) {
		return stop(seconds).until(ExpectedConditions.presenceOfElementLocated(locate(xpath)));
	}

	/**
	 * <h1>Visible Element</h1> Gets the element specified, as long as it is visible
	 * within the time limit specified.
	 * 
	 * @param xpath   The locator of the element to find.
	 * @param seconds The number of seconds to wait for the element to be visible.
	 * @return The visible element.
	 * @author laserwolve
	 */
	protected static WebElement visibleElement(String xpath, int seconds) {
		return stop(seconds).until(ExpectedConditions.visibilityOfElementLocated(locate(xpath)));
	}

	/**
	 * <h1>Quit</h1> Quits the script.
	 *
	 * @author laserwolve
	 * @see {@link org.openqa.selenium.WebDriver#quit()}
	 */
	protected static void quit() {
		driver.quit();
	}

	/**
	 * <h1>Scroll to Element</h1> Scrolls to the specified element, using
	 * JavaScript.
	 *
	 * @param by The locator of the element to scroll to.
	 * @author laserwolve
	 */
	protected static void scrollToElement(String xpath) {
		executeJavascript("arguments[0].scrollIntoView();", presentElement(xpath));
	}

	/**
	 * <h1>Send Text</h1> Sends the specified text to specified element.
	 * 
	 * @param xpath The XPath of the element which will recieve the text.
	 * @param text  The text to be inputted.
	 * @param clear Whether or not to clear the element before inputting the
	 *              specified text.
	 * @author laserwolve
	 */
	protected static void sendText(String xpath, String text, boolean clear) {
		WebElement element = clickableElement(xpath);

		if (clear)
			element.clear();

		element.sendKeys(text);
	}

	/** @see {@link #sendText(String, String, boolean)} */
	protected static void sendText(String xpath, int value) {

		sendText(xpath, String.valueOf(value));
	}

	/** @see {@link #sendText(String, String, boolean)} */
	protected static void sendText(String xpath, String text) {

		sendText(xpath, text, true);
	}

	/**
	 * <h1>Stop</h1> Returns a wait of the specified duration in seconds.
	 *
	 * @param seconds The duration (in seconds) of this wait.
	 * @return A wait of the specified duration.
	 * @author laserwolve
	 * @see {@link org.openqa.selenium.support.ui.WebDriverWait#WebDriverWait(WebDriver, Duration)}
	 */
	protected static WebDriverWait stop(int seconds) {
		return new WebDriverWait(driver, Duration.ofSeconds(seconds));
	}

	/**
	 * <h1>Switch to Default Content</h1> Switches to the default content.
	 *
	 * @see {@link org.openqa.selenium.WebDriver.TargetLocator#defaultContent()}
	 * @author laserwolve
	 * @return The WebDriver focused on the default content.
	 */
	protected static WebDriver switchToDefaultContent() {
		return driver.switchTo().defaultContent();
	}

	/**
	 * <h1>Switch to IFrame</h1> Switches to the specified IFrame.
	 *
	 * @param by The IFrame to switch to.
	 * @author laserwolve
	 * @return The driver focused on the iframe.
	 */
	protected static WebDriver switchToIframe(String xpath) {
		return driver.switchTo().frame(clickableElement(xpath));
	}

	/**
	 * <h1>Type into File Explorer</h1> Type text into a Windows File Explorer
	 * window. Use {@link #sendText} to type elsewhere. Requires window focus, so
	 * you can't do other things on the computer executing this method. This method
	 * sets the clipboard's contents to <strong>path</strong>, then pastes it into
	 * the File Explorer window.
	 *
	 * @param path The file path to type/paste into the File Explorer window.
	 * @throws InterruptedException from {@link Thread#sleep}
	 * @author laserwolve
	 */
	protected static void typeIntoFileExplorer(String path) {
		Toolkit.getDefaultToolkit().getSystemClipboard().setContents(new StringSelection(path), null);

		robot.delay(2000); // TODO: Find a way to determine if the file explorer has popped up

		robot.keyPress(KeyEvent.VK_CONTROL);
		robot.keyPress(KeyEvent.VK_V);
		robot.keyRelease(KeyEvent.VK_CONTROL);
		robot.keyRelease(KeyEvent.VK_V); // Paste
		robot.keyPress(KeyEvent.VK_ENTER);
		robot.keyRelease(KeyEvent.VK_ENTER); // Open directory or file
	}

	/**
	 * <h1>Wait Until Element is Gone</h1> Waits until the specified element is no
	 * longer visible.
	 *
	 * @param By The element for which to wait upon.
	 * @see {@link #waitUntilElementIsGone(by, int)}
	 * @author laserwolve
	 */
	protected static void waitUntilElementIsGone(String xpath) {
		waitUntilElementIsGone(xpath, 10);
	}

	/**
	 * <h1>Wait Until Element is Gone</h1> Waits until the specified element is no
	 * longer visible.
	 *
	 * @param xpath   The element for which to wait upon.
	 * @param seconds How long to wait, in seconds, for the element to no longer be
	 *                visible.
	 * @author laserwolve
	 * @return Whether or not the element is invisible.
	 */
	protected static Boolean waitUntilElementIsGone(String xpath, int seconds) {
		try {
			return stop(seconds).until(ExpectedConditions.invisibilityOfElementLocated(locate(xpath)));
		} catch (Exception e) {
			return true;
		}
	}

	/** @see #waitUntilElementIsPresent(By, int) */
	protected static void waitUntilElementIsPresent(String xpath) {
		waitUntilElementIsPresent(xpath, 5);
	}

	/**
	 * <h1>Wait Until Element is Visible</h1> Waits until the specified element is
	 * visible.
	 *
	 * @param xpath   The element for which to wait upon.
	 * @param seconds How long to wait, in seconds, for the element to be visible.
	 * @author laserwolve
	 * @return The web element, once present.
	 */
	protected static WebElement waitUntilElementIsPresent(String xpath, int seconds) {
		return stop(seconds).until(ExpectedConditions.visibilityOfElementLocated(locate(xpath)));
	}

	/**
	 * <h1>Wait for JavaScript to be True</h1> Waits for a JavaScript code snippet
	 * to return true.
	 * 
	 * @param javascript The JavaScript code to run, as a string.
	 * @return True if the code returned true within {@link #stop()}'s timeframe.
	 * @see https://stackoverflow.com/questions/41554625/selenium-wait-until-returned-javascript-script-value-match-value
	 * @author laserwolve
	 */
	protected static Boolean waitForJavascriptToBeTrue(String javascript) {
		return stop(10).until(new ExpectedCondition<Boolean>() {

			@Override
			public Boolean apply(WebDriver driver) {
				return (Boolean) executeJavascript(javascript);
			}
		});
	}

	/**
	 * <h1>Execute Javascript</h1> Executes JavaScript against the DOM.
	 * 
	 * @param javascript The JavaScript to be executed.
	 * @return Various possible objects, see
	 *         {@link org.openqa.selenium.JavascriptExecutor#executeScript(String, Object...)}
	 *         for a full list.
	 * @author laserwolve
	 */
	protected static Object executeJavascript(String javascript, Object... args) {
		return javascriptExecutor.executeScript(javascript, args);
	}

	/**
	 * <h1>Wait Until Text is</h1> Wait until the text of an element is the
	 * specified text.
	 *
	 * @param by      The <code>By</code> of the element of which to check the text
	 * @param text    The awaited text
	 * @param seconds How long to wait for the text
	 * @author laserwolve
	 * @return Whether or not the text is as expected.
	 */
	protected static Boolean waitUntilTextIs(String xpath, String text, int seconds) {
		return stop(seconds).until(ExpectedConditions.textToBe(locate(xpath), text));

	}

	/**
	 * <h1>Context Click</h1> Performs a context click on the element specified in
	 * the By.
	 *
	 * @param by The By of the element on which to perform a context click.
	 * @author laserwolve
	 * @see {@link org.openqa.selenium.interactions.Actions#contextClick(WebElement)}
	 */
	protected static void contextClick(String xpath) {
		actions.contextClick(clickableElement(xpath)).perform();
	}

	/**
	 * <h1>Context Click Upper Left Corner</h1> Performs a context click that's 1
	 * pixel down and to the right of the specified element.
	 *
	 * @param by The element on which to perform the context click.
	 * @author laserwolve
	 */
	protected static void contextClickUpperLeftCorner(String xpath) {
		WebElement webElement = clickableElement(xpath);

		Dimension dimension = webElement.getSize();

		actions.moveToElement(webElement, dimension.width / -2 + 1, dimension.height / -2 + 1).contextClick().perform();
	}

	/**
	 * <h1>Double Click</h1> Double clicks the element specified in the locator.
	 *
	 * @param by The locator of the element to double click.
	 * @author laserwolve
	 * @see {@link org.openqa.selenium.interactions.Actions#doubleClick(WebElement)}
	 */
	protected static void doubleClick(String xpath) {
		actions.doubleClick(visibleElement(xpath, 5)).perform();
	}

	/**
	 * <h1>Is Element Clickable</h1> Uses {@link #clickableElement(By)} to determine
	 * if an element is clickable or not.
	 *
	 * @param by The locator of the element to check.
	 * @return whether or not the element is clickable.
	 * @author laserwolve
	 * @see {@link #clickableElement(By)}
	 */
	protected static boolean isElementClickable(String xpath) {
		return Objects.nonNull(clickableElement(xpath));
	}

	/**
	 * <h1>Open a Project Folder</h1> Opens a Construct 3 project folder. Must be on
	 * the Start page. The amount of time a project takes to load is determined both
	 * by the project's size and speed of the computer. Uses keyboard commands to
	 * interact with the Chromium "Let site edit files?" popup.
	 *
	 * @param MaximumProjectLoadTimeInSeconds The maximum amount of time to wait (in
	 *                                        seconds) for the project to load.
	 * @throws InterruptedException in {@link #typeIntoFileExplorer}
	 * @throws TimeoutException     if the project doesn't load in time
	 * @author laserwolve
	 */
	protected static void openProjectFolder(int MaximumProjectLoadTimeInSeconds, String projectPath) {
		click(StartPage.open);

		click(StartPage.OpenButtonDropdown.projectFolder);

		typeIntoFileExplorer(projectPath);

		robot.keyPress(KeyEvent.VK_ENTER);
		robot.keyRelease(KeyEvent.VK_ENTER); // Select directory
		robot.delay(1000);
		robot.keyPress(KeyEvent.VK_RIGHT);
		robot.keyRelease(KeyEvent.VK_RIGHT); // Give "Edit files" focus
		robot.keyPress(KeyEvent.VK_ENTER);
		robot.keyRelease(KeyEvent.VK_ENTER); // Select "Edit files"

		waitUntilElementIsPresent(progressDialog);

		waitUntilElementIsGone(progressDialog, MaximumProjectLoadTimeInSeconds);
	}

	/**
	 * <h1>Refresh</h1> Refreshes the webpage.
	 *
	 * @author laserwolve
	 * @see {@link org.openqa.selenium.WebDriver.Navigation#refresh()}
	 */
	protected static void refresh() {
		driver.navigate().refresh();
	}

	/**
	 * <h1>Stop</h1> Returns a wait of a fixed duration.
	 *
	 * @see {@link #stop(int)}
	 * @return A wait of the specified duration.
	 * @author laserwolve
	 */
	protected static WebDriverWait stop() {
		return stop(5);
	}

	/**
	 * <h1>Wait for Element to have Attribute</h1> Waits a specified amount of
	 * seconds for the specified attribute to appear in the specified element.
	 *
	 * @param xpath     The locator of the element to wait upon.
	 * @param seconds   How many seconds to wait.
	 * @param attribute Waits for this attribute to appear.
	 * @author laserwolve
	 * @return A {@link org.openqa.selenium.WebElement} for the element in question.
	 */
	protected static WebElement waitForElementToHaveAttribute(String xpath, String attribute, int seconds) {
		return stop(seconds).until(ExpectedConditions.presenceOfElementLocated(locate(xpath + "[@" + attribute + "]")));
	}

	/**
	 * <h1>Wait for Element to not have Attribute</h1> Waits a specified amount of
	 * seconds for the specified attribute to not be in the specified element.
	 *
	 * @param xpath     The locator of the element to wait upon.
	 * @param seconds   How many seconds to wait.
	 * @param attribute Waits for this attribute to be gone.
	 * @author laserwolve
	 * @return A {@link org.openqa.selenium.WebElement} for the element in question.
	 */
	protected static WebElement waitForElementToNotHaveAttribute(String xpath, String attribute, int seconds) {
		return stop(seconds)
				.until(ExpectedConditions.presenceOfElementLocated(locate(xpath + "[not(@" + attribute + ")]")));
	}

	/**
	 * <h1>Import Animations</h1> Imports the specified animations into the
	 * specified project. Replaces all existing animations of a sprite, if that
	 * sprite already exists. Otherwise creates a new sprite. Corrects the Y value
	 * of the new animations to the specified value, then crops to visible pixels.
	 * Saves the project.
	 *
	 * @param path          The path to the zipped archive containing the
	 *                      animations.
	 * @param projectFolder The path to the project folder.
	 * @param yValue        the new Y value of the animations.
	 */
	protected static void importAnimations(String path, String projectFolder, String yValue) {

		openProjectFolder(6000, projectFolder);

		File[] directory = new File(path).listFiles((file) -> {
			return file.getName().endsWith(".zip");
		});

		for (File animation : directory) {

			String sprite = FileNameUtils.getBaseName(animation.getPath());

			sendText(Project.search, sprite, true);

			// TODO: Check if the sprite doesn't exist here. If it doesn't, create it.

			// TODO: Figure out why the search result can't be picked up by any of the
			// Expected Conditions. Maybe instead go through the tree to find what we're
			// looking for.
			robot.delay(1000);

			doubleClick(Project.searchResult(sprite));

			String newAnimation = addAnimation();

			click(Animations.animation(1));

			waitForElementToHaveAttribute(Animations.animation(1), "selected", 5);

			int penultimateAnimation = numberOfAnimations() - 1;

//			scrollToElement(AnimationsPane.animation(penultimateAnimation));

			actions.keyDown(Keys.SHIFT).perform();

			click(Animations.animation(penultimateAnimation));

			actions.keyUp(Keys.SHIFT).perform();

			waitForElementToHaveAttribute(Animations.animation(penultimateAnimation), "selected", 5);

			contextClick(Animations.animation(penultimateAnimation));

			click(AnimationContextMenu.delete);

			contextClick(Animations.title);

			click(ContextMenu.importAnimation);

			click(importAnimationPopout.fromFiles);

			typeIntoFileExplorer(animation.getPath());

			waitForElementToHaveAttribute(AnimationsEditor.blocker, "locked", 60);

			waitForElementToNotHaveAttribute(AnimationsEditor.blocker, "locked", 180);

			contextClick(Animations.animation(newAnimation));

			// Delete the animation we created, whose whole purpose was to satisfy the
			// requirement that a sprite must always have at least one animation.
			click(AnimationContextMenu.delete);

			if (Objects.nonNull(yValue)) {
				click(AnimationsEditor.editTheImagePoints);

				// Click into the input box, to make the correct input appear
				click(AnimationsEditor.ySpinner);

				sendText(AnimationsEditor.y, yValue, false);

				contextClick(ImagePoints.origin);

				click(ImagePointsContextMenu.applyToAllAnimations);
			}
			click(AnimationsEditor.cropDropdownArrow);

			actions.keyDown(Keys.SHIFT).keyDown(Keys.CONTROL).perform();

			click(CropDropdown.applyToAllAnimations);

			actions.keyUp(Keys.SHIFT).keyUp(Keys.CONTROL).perform();

			waitForElementToHaveAttribute(AnimationsEditor.blocker, "locked", 5);

			waitForElementToNotHaveAttribute(AnimationsEditor.blocker, "locked", 180);

			click(AnimationsEditor.x);

			waitUntilElementIsGone(dimmer, 300);

			click(save);

			waitUntilElementIsGone(progressDialog, 300);
		}
	}

	/**
	 * <h1>Add Animation</h1> Adds a new animation, called "Animation X", where X is
	 * the next available number. (i.e. If "Animation 1" and "Animation 2" already
	 * exist, this method will create "Animation 3".) Must be in the Animations
	 * Editor. Waits until the animatiom is created to continue. This deselects all
	 * currently selected animations and selects the newly created animation.
	 *
	 * @author laserwolve
	 * @return The name of the animation that was created.
	 *
	 */
	protected static String addAnimation() {

		int numberOfAnimationsBefore = numberOfAnimations();

		contextClick(Animations.title);

		click(ContextMenu.addAnimation);

		setExpiryTime(5);

		while (numberOfAnimationsBefore == numberOfAnimations()) {
			if (hasExpired())
				exceededExpiryTime("Animation was never created");
		}

		return presentElement(Animations.animation(numberOfAnimations())).getText();
	}

	/**
	 * <h1>Number of Animations</h1> Gets how many animations this sprite has. Must
	 * be in the Animations Editor.
	 *
	 * @return The number of animations of the sprite.
	 * @author laserwolve
	 */
	protected static int numberOfAnimations() {
		return driver.findElements(locate(Animations.animations)).size();
	}

	/**
	 * <h1>Create New Project</h1> Create a new project. Uses the menu, so can be
	 * called from an existing project. All parameters are 'optional'; substitute
	 * null.
	 * 
	 * @param projectName
	 * @param preset
	 * @param viewportWidth
	 * @param viewportHeight
	 * @param orientations
	 * @param startWith
	 * @param optimizeForPixelArt
	 * @author laserwolve
	 */
	protected static void createNewProject(String projectName, String preset, Integer viewportWidth, Integer viewportHeight,
			String orientations, String startWith, boolean optimizeForPixelArt) {

		click(menu);

		click(MenuDropdown.project);

		click(ProjectPopout.newProject);

		if (projectName != null)
			sendText(NewProject.name, projectName);

		if (preset != null) {
			click(NewProject.choosePreset);

			click(preset);
		}

		if (viewportWidth != null)
			sendText(NewProject.viewportSizeWidth, viewportWidth);

		if (viewportHeight != null)
			sendText(NewProject.viewportSizeHeight, viewportHeight);

		if (orientations != null) {
			click(NewProject.orientations);

			click(orientations);
		}

		if (startWith != null) {
			click(NewProject.startWith);

			click(startWith);
		}

		if (optimizeForPixelArt)
			click(NewProject.optimizeForPixelArt);

		click(NewProject.create);
	}

	/**
	 * <h1>Set Property</h1> Set the property's value to the specified string. Works
	 * for text inputs and colors. Some property's values cannot be blank, ever, so
	 * {@link WebElement#clear()} won't work on them. In such cases, the property's
	 * input must be clicked before sending the text. This doesn't highlight the
	 * value for some properties, so we also press Ctrl+A.
	 * 
	 * @param property The property of which to set the value.
	 * @param value    The string to which to set this property's value.
	 * @author laserwolve
	 */
	protected static void setProperty(String property, String value) {

		String propertyInput = Properties.propertyTextInput(property);

		click(propertyInput);

		if (clickableElement(propertyInput).getTagName().equals("input")) {

			sendText(property, Keys.LEFT_CONTROL + "A", false);

			sendText(propertyInput, value, false);

		} else
			new Select(clickableElement(propertyInput)).selectByValue(value);
	}

	/**
	 * <h1>Set Property</h1> Checks or unchecks a property checkbox.
	 * 
	 * @param property The property of which to set the value.
	 * @param value    The boolean to which the property should be set.
	 * @see {@link ConstructMethods#setProperty(String, String)}
	 * @author laserwolve
	 */
	protected static void setProperty(String property, Boolean value) {

		String checkbox = Properties.propertyTextInput(property);

		if (clickableElement(checkbox).isSelected() != value)
			click(checkbox);
	}
}