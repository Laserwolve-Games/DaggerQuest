
type TweenPropertyType = "x" | "y" | "width" | "height" | "angle" | "opacity" | "color" | "z-elevation" | "x-scale" | "y-scale" | "position" | "size" | "scale" | "value";
type TweenEndValueType = number | number[];

interface StartTweenOpts {
	tags?: string | string[];
	destroyOnComplete?: boolean;
	loop?: boolean;
	pingPong?: boolean;
	repeatCount?: number;
	startValue?: number;
}

/** Represents the Tween behavior.
 * @see {@link https://www.construct.net/make-games/manuals/construct-3/scripting/scripting-reference/behavior-interfaces/tween | ITweenBehaviorInstance documentation } */
declare class ITweenBehaviorInstance<InstType> extends IBehaviorInstance<InstType>
{
	startTween(prop: TweenPropertyType, endValue: TweenEndValueType, time: number, ease: string, opts?: StartTweenOpts): ITweenState;

	allTweens(): Iterable<ITweenState>;
	tweensByTags(tags: string | string[]): Iterable<ITweenState>;
	isEnabled: boolean;
}
