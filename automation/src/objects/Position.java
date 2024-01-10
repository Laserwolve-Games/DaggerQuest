package objects;

/**
 * <h1>Position</h1> An X Y position of a Construct object. Can't use
 * {@link java.awt.Point} as those are ints, and we need doubles.
 * 
 * @author laserwolve
 */
public class Position {
	double x;
	double y;

	public Position(double x, double y) {
		this.x = x;
		this.y = y;
	}

	public double getX() {
		return x;
	}

	public double getY() {
		return y;
	}
}