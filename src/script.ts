const { FunctionalComponent, useRef, useEffect, useState, useMemo } = React;

// Globals ------------------------------------ //

// Degrees for a full circle
const fullCircle: number = 360;

// Decimal Time ------------------------------------ //

// Components of time extracted from `DecimalTime` instance
interface DecimalTimeComponents {
    hours: number;
    minutes: number;
    seconds: number;
    milliseconds: number;
}

// Components of time extracted from `DecimalTime` instance when they represent rotation in degrees for a clock hand
interface DecimalTimeRotationComponents extends DecimalTimeComponents {}

/**
 * Class to convert and hold decimal time
 */
class DecimalTime {
    hours: number = 0;
    minutes: number = 0;
    seconds: number = 0;
    milliseconds: number = 0;
    private run: boolean = false;
    private refreshRate: number = 100;
    private static conversion: number = 0.864;
	private static decimalSecond: number = 1000 * DecimalTime.conversion

	/**
	 * @param {Date} date - JavaScript `Date` instance
	 * @param {boolean} start - Start the clock updating on init
	 * @param {number} refreshRate - Refresh rate for clock updates
	 */
    constructor(date: Date = new Date(), start: boolean = false, refreshRate?: number) {
        this.setTime(date);
        if (start) this.start(refreshRate);
    }

	/**
	 * Starts the clock updating with given refresh rate
	 *
	 * @param {number} refreshRate - Refresh rate for clock updates
	 */
    start(refreshRate?: number) {
        this.run = true;
        this.refreshTime(refreshRate);
    }

	/**
	 * Stops the clock updating
	 */
    stop() {
        this.run = false;
    }
	
	/**
	 * Calls for clock to update to current time
	 */
	update() {
        this.setTime(new Date());
    }
	
	/**
	 * Checks if clock is running
	 *
	 * @returns {boolean}
	 */
	get isRunning(): boolean {
		return this.run;
	}
	
	/**
	 * Gets clock rotations in degrees for each time component
	 *
	 * @returns {DecimalTimeRotationComponents}
	 */
	get rotation(): DecimalTimeRotationComponents {
		const { hours: h, minutes: m, seconds: s, milliseconds: ms } = this;
		const msDec = ms / 1000;
		const sDec = (s + msDec) / 100;
		const mDec = (m + sDec) / 100;
		const hDec = (h + mDec) / 10;
		const milliseconds = msDec * fullCircle;
		const seconds = sDec * fullCircle;
		const minutes = mDec * fullCircle;
		const hours = hDec * fullCircle;
		return { hours, minutes, seconds, milliseconds };
	}

	/**
	 * Makes a descriptive time string of the decimal time instance
	 *
	 * @returns {string}
	 */
    get description(): string {
        const { hours, minutes, seconds, milliseconds } = this;
        const paddedHours = hours.toString().padStart(2, "0");
        const paddedMinutes = minutes.toString().padStart(2, "0");
        const paddedSeconds = seconds.toString().padStart(2, "0");
        const paddedMilliseconds = milliseconds.toString().padStart(3, "0");
        return `${paddedHours} : ${paddedMinutes} : ${paddedSeconds}.${paddedMilliseconds}`;
    }

	/**
	 * @overrride
	 * String representation
	 *
	 * @returns {string}
	 */
    toString(): string {
        return this.description;
    }
	
	// Private ------------------------------------ //
	
	/**
	 * @private
	 * Gets the current time
	 *
	 * @param {number} refreshRate - Refresh rate for clock updates
	 */
    private refreshTime(refreshRate?: number) {
        if (refreshRate) this.refreshRate = refreshRate;
        setTimeout(() => {
            this.update();
            if (this.run) this.refreshTime(refreshRate)
        }, this.refreshRate);
    }

	/**
	 * @private
	 * Sets the time from a JavaScript `Date` instance
	 *
	 * @param {Date} date - JavaScript `Date` instance
	 */
    private setTime(date: Date = new Date()) {
        const { hours, minutes, seconds, milliseconds } = DecimalTime.getDecimalTime(date);
        this.hours = hours;
        this.minutes = minutes;
        this.seconds = seconds;
        this.milliseconds = milliseconds;
    }
	
	// Static ------------------------------------ //

	/**
	 * @static
	 * Static utility function to convert a JavaScript `Date` instance to the time components for a decimal time
	 *
	 * @param {Date} date - JavaScript `Date` instance
	 * @returns {DecimalTimeComponents}
	 */
    static getDecimalTime(date: Date = new Date()): DecimalTimeComponents  {
        const msInDay: number = date.getTime() - new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
        const totalDecimalMS: number = msInDay / DecimalTime.conversion;
        const decimalHours = totalDecimalMS / 1000 / 100 / 100;
        const hours = Math.floor(decimalHours);
        const decimalMinutes = (hours === 0 ? decimalHours : (decimalHours % hours)) * 100;
        const minutes = Math.floor(decimalMinutes);
        const decimalSeconds = (minutes === 0 ? decimalMinutes : (decimalMinutes % minutes)) * 100;
        const seconds = Math.floor(decimalSeconds);
        const decimalMS = (seconds === 0 ? decimalSeconds : (decimalSeconds % seconds)) * 1000;
        const milliseconds = Math.floor(decimalMS);
        return { hours, minutes, seconds, milliseconds };
    }
}

// React Hooks ------------------------------------ //

/**
 * Uses a `DecimalTime` instance to get updated time components in a functional component
 *
 * @param {DecimalTime} decimalTime
 * @param {number} refreshRate - Refresh rate for clock updates
 * @param {boolean} getRotation - If `false` (default), gets standard clock components, if `true` gets rotations for clock hands
 * @returns {DecimalTimeComponents}
 */
const useDecimalTime = (decimalTime: DecimalTime = new DecimalTime(), refreshRate: number = 1000, getRotation: boolean = false): DecimalTimeComponents => {
	const time = useRef(decimalTime);
	
	const [hours, setHours] = useState(0);
	const [minutes, setMinutes] = useState(0);
	const [seconds, setSeconds] = useState(0);
	const [milliseconds, setMilliseconds] = useState(0);
	
	const tick = "tick";
	const tock = "tock";
	const [tickTock, setTickTock] = useState(tick);
	
	useEffect(() => {
		if (!time.current.isRunning) decimalTime.start();
		return () => {
			time.current.stop();
		};
	}, [refreshRate]);
	
	const getTime = () => {
		const { hours, minutes, seconds, milliseconds } = getRotation ? time.current.rotation : time.current;
		setHours(hours);
		setMinutes(minutes);
		setSeconds(getRotation && refreshRate >= 1000 ? Math.floor(seconds) : seconds);
		setMilliseconds(milliseconds);
		setTickTock(tickTock === tick ? tock : tick)
	};
	
	const timeout = useRef(null);
	useEffect(() => {
		timeout.current = setTimeout(() => {
			getTime();
		}, refreshRate);
		return () => {
			clearTimeout(timeout.current);
		}
	}, [tickTock]);
	
	return { hours, minutes, seconds, milliseconds };
};

/**
 * Uses gets boolean visibility toggled at a given interval to apply to visual item
 *
 * @param {number} blinkRate - Blink rate for item
 * @returns {boolean}
 */
const useBlink = (blinkRate: number = 1000): boolean => {
	const [visible, setVisible] = useState(true);
	const timeout = useRef(null);
	useEffect(() => {
		if (blinkRate) {
			timeout.current = setTimeout(() => {
				setVisible(!visible);
			}, blinkRate);
		}
		return () => {
			clearTimeout(timeout.current);
		};
	}, [visible]);
	
	return visible;
};

// Separators ------------------------------------ //

interface SeparatorProps {
	char?: string;
	visible?: boolean;
}

// Component for separator element beteween time components on a digital display
const Separator: FunctionComponent<SeparatorProps> = ({ char = ":", visible = true }: SeparatorProps) => (
	<div className="display-component display-chars separator">
		{visible ? char : null}
	</div>
);

// Time Digits ------------------------------------ //

interface TimeDigitProps {
	value?: number;
	padAmount?: number;
}

// Component for numeric digits representing the time components on a digital display
const TimeDigits: FunctionComponent<TimeDigitProps> = ({ value = 0, padAmount = 2 }: TimeDigitProps) => {
	const padded = value.toString().padStart(padAmount, "0");
	return (
		<div className="display-component time-digits display-chars">
			{padded}
		</div>
	);
}

// Digital Display ------------------------------------ //

interface DigitalDisplayProps {
	decimalTime?: DecimalTime;
	refreshRate?: number;
	blinkRate?: number|null;
	showSeconds?: boolean;
	showMilliseconds?: boolean;
}

// Component for a digital display of a decimal time
const DigitalDecimalDisplay: FunctionalComponent<DigitalDisplayProps> = ({ decimalTime = new DecimalTime(), refreshRate = 150, blinkRate = null, showSeconds, showMilliseconds }: DigitalDisplayProps) => {
	const { hours, minutes, seconds, milliseconds } = useDecimalTime(decimalTime, refreshRate, false);
	const visible = useBlink(blinkRate);
	const sepChar = ":";
	return (
		<div className="center">
			<div className="digital-display">
				<TimeDigits value={hours} padAmount={2} />
				<Separator char={sepChar} visible={visible} />
				<TimeDigits value={minutes} padAmount={2} />
				{showSeconds && <Separator char={sepChar} visible={visible} />}
				{showSeconds && <TimeDigits value={seconds} padAmount={2} />}
				{showMilliseconds && <Separator char={"."} visible={visible} />}
				{showMilliseconds && <TimeDigits value={milliseconds} padAmount={3} />}
			</div>
		</div>
	);
};

// Clock Hand Types ------------------------------------ //

// Enum for types of clock hands
enum ClockHandType {
	Hour = "Hour",
	Minute = "Minute",
	Second = "Second",
}

/**
 * Gets a CSS class name for each clock hand type
 *
 * @param {ClockHandType} type
 * @returns {string}
 */
const getClockHandClass = (type: ClockHandType): string => {
	switch (type) {
		case ClockHandType.Hour: return "hour-hand";
		case ClockHandType.Minute: return "minute-hand";
		case ClockHandType.Second: return "second-hand";
		default: return "";
	}
};

// Clock Hands ------------------------------------ //

interface ClockHandProps {
	type: ClockHandType;
	rotation: number;
}

// Component to draw an analog clock hand
const ClockHand: FunctionalComponent<ClockHandProps> = ({ rotation = 0, type = ClockHandType.Hour }: ClockHandProps) => {
	const handClass = getClockHandClass(type);
	const className = `clock-hand ${handClass}`;
	const transform = { transform: `rotate(${rotation}deg)` };
	return (
		<div className={className} style={transform} />
	);
};
		
// Clock Numbers ------------------------------------ //
				 
interface ClockNumberProps {
	number?: number;
	id?: string;
}

// Component to draw an analog clock number
const ClockNumber: FunctionalComponent<ClockNumberProps> = ({ number = 0, id }) => (
	<div className="clock-number" id={id}>{number}</div>
);

interface ClockNumbersProps {
	count?: number;
}

// Component to position clock numbers evenly around the clock
const ClockNumbers: FunctionalComponent<ClockNumbersProps> = ({ count = 10 }: ClockNumbersProps) => {
	const numbers = useMemo(() => {
		const numberList = [];
		for (let i = 0; i < count; i += 1) {
			numberList.push(i);
		}
		return numberList.map((number) => {
			const padded = number.toString().padStart(2, "0");
			const id = `clock-number-position${padded}`;
			const subId = `clock-number${padded}`;
			return (
				<div key={id} className="clock-numbers" id={id}>
					<ClockNumber number={number} id={subId} />
				</div>
			)
		});
	}, [count]);
	console.log(numbers);
	return (
		<div className="clock-numbers">
			{numbers}
		</div>
	);
};

// Analog Clock ------------------------------------ //

interface AnalogClockProps {
	decimalTime?: DecimalTime;
	refreshRate?: number;
	showSeconds?: boolean;
}

// Component for an analog clock display for a decimal time
const AnalogClock: FunctionalComponent<AnalogClockProps> = ({ decimalTime = new DecimalTime(), refreshRate = DecimalTime.decimalSecond, showSeconds }: AnalogClockProps) => {
	const numberCount = useRef(10);
	const { hours, minutes, seconds } = useDecimalTime(decimalTime, refreshRate, true);
	const clockNumbers = useMemo(() => (
		<ClockNumbers count={numberCount.current} />
	), [numberCount.current]);
	return (
		<div className="analog-clock-face">
			{clockNumbers}
			<div className="clock-pivot" />
			<ClockHand rotation={hours} type={ClockHandType.Hour} />
			<ClockHand rotation={minutes} type={ClockHandType.Minute} />
			{showSeconds && <ClockHand rotation={seconds} type={ClockHandType.Second} />}
		</div>
	);
};

// App ------------------------------------ //

interface AppProps {
	title?: string;
	refreshRate?: number;
}

// Decimal time to use for the app
const decimalTime = new DecimalTime();

// Defines the React app
const App: FunctionalComponent<AppProps> = ({ title, refreshRate = DecimalTime.decimalSecond }) => (
	<div>
		{title && (
			<h1>{title}</h1> 
		)}
		<DigitalDecimalDisplay decimalTime={decimalTime} refreshRate={refreshRate} blinkRate={1000} showSeconds />
		<AnalogClock decimalTime={decimalTime} refreshRate={refreshRate} showSeconds />
	</div>
);

ReactDOM.render(
  <App title="Current decimal time:" refreshRate={DecimalTime.decimalSecond} />,
  document.getElementById('root')
);