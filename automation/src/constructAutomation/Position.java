package constructAutomation;

/**
 * <h1>Position</h1> An X Y position of a Construct object. Can't use
 * {@link java.awt.Point} as those are ints, and we need Doubles.
 * 
 * @author laserwolve
 */
public class Position {
	Double x;
	Double y;

	public Position(Double x, Double y) {
		this.x = x;
		this.y = y;
	}

	public Double getX() {
		return x;
	}

	public Double getY() {
		return y;
	}
}