"use strict";
var FunctionalComponent = React.FunctionalComponent, useRef = React.useRef, useEffect = React.useEffect, useState = React.useState, useMemo = React.useMemo;
// Globals ------------------------------------ //
// Degrees for a full circle
var fullCircle = 360;
/**
 * Class to convert and hold decimal time
 */
var DecimalTime = /** @class */ (function () {
    /**
     * @param {Date} date - JavaScript `Date` instance
     * @param {boolean} start - Start the clock updating on init
     * @param {number} refreshRate - Refresh rate for clock updates
     */
    function DecimalTime(date, start, refreshRate) {
        if (date === void 0) { date = new Date(); }
        if (start === void 0) { start = false; }
        this.hours = 0;
        this.minutes = 0;
        this.seconds = 0;
        this.milliseconds = 0;
        this.run = false;
        this.refreshRate = 100;
        this.setTime(date);
        if (start)
            this.start(refreshRate);
    }
    /**
     * Starts the clock updating with given refresh rate
     *
     * @param {number} refreshRate - Refresh rate for clock updates
     */
    DecimalTime.prototype.start = function (refreshRate) {
        this.run = true;
        this.refreshTime(refreshRate);
    };
    /**
     * Stops the clock updating
     */
    DecimalTime.prototype.stop = function () {
        this.run = false;
    };
    /**
     * Calls for clock to update to current time
     */
    DecimalTime.prototype.update = function () {
        this.setTime(new Date());
    };
    Object.defineProperty(DecimalTime.prototype, "isRunning", {
        /**
         * Checks if clock is running
         *
         * @returns {boolean}
         */
        get: function () {
            return this.run;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DecimalTime.prototype, "rotation", {
        /**
         * Gets clock rotations in degrees for each time component
         *
         * @returns {DecimalTimeRotationComponents}
         */
        get: function () {
            var _a = this, h = _a.hours, m = _a.minutes, s = _a.seconds, ms = _a.milliseconds;
            var msDec = ms / 1000;
            var sDec = (s + msDec) / 100;
            var mDec = (m + sDec) / 100;
            var hDec = (h + mDec) / 10;
            var milliseconds = msDec * fullCircle;
            var seconds = sDec * fullCircle;
            var minutes = mDec * fullCircle;
            var hours = hDec * fullCircle;
            return { hours: hours, minutes: minutes, seconds: seconds, milliseconds: milliseconds };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DecimalTime.prototype, "description", {
        /**
         * Makes a descriptive time string of the decimal time instance
         *
         * @returns {string}
         */
        get: function () {
            var _a = this, hours = _a.hours, minutes = _a.minutes, seconds = _a.seconds, milliseconds = _a.milliseconds;
            var paddedHours = hours.toString().padStart(2, "0");
            var paddedMinutes = minutes.toString().padStart(2, "0");
            var paddedSeconds = seconds.toString().padStart(2, "0");
            var paddedMilliseconds = milliseconds.toString().padStart(3, "0");
            return paddedHours + " : " + paddedMinutes + " : " + paddedSeconds + "." + paddedMilliseconds;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @overrride
     * String representation
     *
     * @returns {string}
     */
    DecimalTime.prototype.toString = function () {
        return this.description;
    };
    // Private ------------------------------------ //
    /**
     * @private
     * Gets the current time
     *
     * @param {number} refreshRate - Refresh rate for clock updates
     */
    DecimalTime.prototype.refreshTime = function (refreshRate) {
        var _this = this;
        if (refreshRate)
            this.refreshRate = refreshRate;
        setTimeout(function () {
            _this.update();
            if (_this.run)
                _this.refreshTime(refreshRate);
        }, this.refreshRate);
    };
    /**
     * @private
     * Sets the time from a JavaScript `Date` instance
     *
     * @param {Date} date - JavaScript `Date` instance
     */
    DecimalTime.prototype.setTime = function (date) {
        if (date === void 0) { date = new Date(); }
        var _a = DecimalTime.getDecimalTime(date), hours = _a.hours, minutes = _a.minutes, seconds = _a.seconds, milliseconds = _a.milliseconds;
        this.hours = hours;
        this.minutes = minutes;
        this.seconds = seconds;
        this.milliseconds = milliseconds;
    };
    // Static ------------------------------------ //
    /**
     * @static
     * Static utility function to convert a JavaScript `Date` instance to the time components for a decimal time
     *
     * @param {Date} date - JavaScript `Date` instance
     * @returns {DecimalTimeComponents}
     */
    DecimalTime.getDecimalTime = function (date) {
        if (date === void 0) { date = new Date(); }
        var msInDay = date.getTime() - new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
        var totalDecimalMS = msInDay / DecimalTime.conversion;
        var decimalHours = totalDecimalMS / 1000 / 100 / 100;
        var hours = Math.floor(decimalHours);
        var decimalMinutes = (hours === 0 ? decimalHours : (decimalHours % hours)) * 100;
        var minutes = Math.floor(decimalMinutes);
        var decimalSeconds = (minutes === 0 ? decimalMinutes : (decimalMinutes % minutes)) * 100;
        var seconds = Math.floor(decimalSeconds);
        var decimalMS = (seconds === 0 ? decimalSeconds : (decimalSeconds % seconds)) * 1000;
        var milliseconds = Math.floor(decimalMS);
        return { hours: hours, minutes: minutes, seconds: seconds, milliseconds: milliseconds };
    };
    DecimalTime.conversion = 0.864;
    DecimalTime.decimalSecond = 1000 * DecimalTime.conversion;
    return DecimalTime;
}());
// React Hooks ------------------------------------ //
/**
 * Uses a `DecimalTime` instance to get updated time components in a functional component
 *
 * @param {DecimalTime} decimalTime
 * @param {number} refreshRate - Refresh rate for clock updates
 * @param {boolean} getRotation - If `false` (default), gets standard clock components, if `true` gets rotations for clock hands
 * @returns {DecimalTimeComponents}
 */
var useDecimalTime = function (decimalTime, refreshRate, getRotation) {
    if (decimalTime === void 0) { decimalTime = new DecimalTime(); }
    if (refreshRate === void 0) { refreshRate = 1000; }
    if (getRotation === void 0) { getRotation = false; }
    var time = useRef(decimalTime);
    var _a = useState(0), hours = _a[0], setHours = _a[1];
    var _b = useState(0), minutes = _b[0], setMinutes = _b[1];
    var _c = useState(0), seconds = _c[0], setSeconds = _c[1];
    var _d = useState(0), milliseconds = _d[0], setMilliseconds = _d[1];
    var tick = "tick";
    var tock = "tock";
    var _e = useState(tick), tickTock = _e[0], setTickTock = _e[1];
    useEffect(function () {
        if (!time.current.isRunning)
            decimalTime.start();
        return function () {
            time.current.stop();
        };
    }, [refreshRate]);
    var getTime = function () {
        var _a = getRotation ? time.current.rotation : time.current, hours = _a.hours, minutes = _a.minutes, seconds = _a.seconds, milliseconds = _a.milliseconds;
        setHours(hours);
        setMinutes(minutes);
        setSeconds(getRotation && refreshRate >= 1000 ? Math.floor(seconds) : seconds);
        setMilliseconds(milliseconds);
        setTickTock(tickTock === tick ? tock : tick);
    };
    var timeout = useRef(null);
    useEffect(function () {
        timeout.current = setTimeout(function () {
            getTime();
        }, refreshRate);
        return function () {
            clearTimeout(timeout.current);
        };
    }, [tickTock]);
    return { hours: hours, minutes: minutes, seconds: seconds, milliseconds: milliseconds };
};
/**
 * Uses gets boolean visibility toggled at a given interval to apply to visual item
 *
 * @param {number} blinkRate - Blink rate for item
 * @returns {boolean}
 */
var useBlink = function (blinkRate) {
    if (blinkRate === void 0) { blinkRate = 1000; }
    var _a = useState(true), visible = _a[0], setVisible = _a[1];
    var timeout = useRef(null);
    useEffect(function () {
        if (blinkRate) {
            timeout.current = setTimeout(function () {
                setVisible(!visible);
            }, blinkRate);
        }
        return function () {
            clearTimeout(timeout.current);
        };
    }, [visible]);
    return visible;
};
// Component for separator element beteween time components on a digital display
var Separator = function (_a) {
    var _b = _a.char, char = _b === void 0 ? ":" : _b, _c = _a.visible, visible = _c === void 0 ? true : _c;
    return (React.createElement("div", { className: "display-component display-chars separator" }, visible ? char : null));
};
// Component for numeric digits representing the time components on a digital display
var TimeDigits = function (_a) {
    var _b = _a.value, value = _b === void 0 ? 0 : _b, _c = _a.padAmount, padAmount = _c === void 0 ? 2 : _c;
    var padded = value.toString().padStart(padAmount, "0");
    return (React.createElement("div", { className: "display-component time-digits display-chars" }, padded));
};
// Component for a digital display of a decimal time
var DigitalDecimalDisplay = function (_a) {
    var _b = _a.decimalTime, decimalTime = _b === void 0 ? new DecimalTime() : _b, _c = _a.refreshRate, refreshRate = _c === void 0 ? 150 : _c, _d = _a.blinkRate, blinkRate = _d === void 0 ? null : _d, showSeconds = _a.showSeconds, showMilliseconds = _a.showMilliseconds;
    var _e = useDecimalTime(decimalTime, refreshRate, false), hours = _e.hours, minutes = _e.minutes, seconds = _e.seconds, milliseconds = _e.milliseconds;
    var visible = useBlink(blinkRate);
    var sepChar = ":";
    return (React.createElement("div", { className: "center" },
        React.createElement("div", { className: "digital-display" },
            React.createElement(TimeDigits, { value: hours, padAmount: 2 }),
            React.createElement(Separator, { char: sepChar, visible: visible }),
            React.createElement(TimeDigits, { value: minutes, padAmount: 2 }),
            showSeconds && React.createElement(Separator, { char: sepChar, visible: visible }),
            showSeconds && React.createElement(TimeDigits, { value: seconds, padAmount: 2 }),
            showMilliseconds && React.createElement(Separator, { char: ".", visible: visible }),
            showMilliseconds && React.createElement(TimeDigits, { value: milliseconds, padAmount: 3 }))));
};
// Clock Hand Types ------------------------------------ //
// Enum for types of clock hands
var ClockHandType;
(function (ClockHandType) {
    ClockHandType["Hour"] = "Hour";
    ClockHandType["Minute"] = "Minute";
    ClockHandType["Second"] = "Second";
})(ClockHandType || (ClockHandType = {}));
/**
 * Gets a CSS class name for each clock hand type
 *
 * @param {ClockHandType} type
 * @returns {string}
 */
var getClockHandClass = function (type) {
    switch (type) {
        case ClockHandType.Hour: return "hour-hand";
        case ClockHandType.Minute: return "minute-hand";
        case ClockHandType.Second: return "second-hand";
        default: return "";
    }
};
// Component to draw an analog clock hand
var ClockHand = function (_a) {
    var _b = _a.rotation, rotation = _b === void 0 ? 0 : _b, _c = _a.type, type = _c === void 0 ? ClockHandType.Hour : _c;
    var handClass = getClockHandClass(type);
    var className = "clock-hand " + handClass;
    var transform = { transform: "rotate(" + rotation + "deg)" };
    return (React.createElement("div", { className: className, style: transform }));
};
// Component to draw an analog clock number
var ClockNumber = function (_a) {
    var _b = _a.number, number = _b === void 0 ? 0 : _b, id = _a.id;
    return (React.createElement("div", { className: "clock-number", id: id }, number));
};
// Component to position clock numbers evenly around the clock
var ClockNumbers = function (_a) {
    var _b = _a.count, count = _b === void 0 ? 10 : _b;
    var numbers = useMemo(function () {
        var numberList = [];
        for (var i = 0; i < count; i += 1) {
            numberList.push(i);
        }
        return numberList.map(function (number) {
            var padded = number.toString().padStart(2, "0");
            var id = "clock-number-position" + padded;
            var subId = "clock-number" + padded;
            return (React.createElement("div", { key: id, className: "clock-numbers", id: id },
                React.createElement(ClockNumber, { number: number, id: subId })));
        });
    }, [count]);
    console.log(numbers);
    return (React.createElement("div", { className: "clock-numbers" }, numbers));
};
// Component for an analog clock display for a decimal time
var AnalogClock = function (_a) {
    var _b = _a.decimalTime, decimalTime = _b === void 0 ? new DecimalTime() : _b, _c = _a.refreshRate, refreshRate = _c === void 0 ? DecimalTime.decimalSecond : _c, showSeconds = _a.showSeconds;
    var numberCount = useRef(10);
    var _d = useDecimalTime(decimalTime, refreshRate, true), hours = _d.hours, minutes = _d.minutes, seconds = _d.seconds;
    var clockNumbers = useMemo(function () { return (React.createElement(ClockNumbers, { count: numberCount.current })); }, [numberCount.current]);
    return (React.createElement("div", { className: "analog-clock-face" },
        clockNumbers,
        React.createElement("div", { className: "clock-pivot" }),
        React.createElement(ClockHand, { rotation: hours, type: ClockHandType.Hour }),
        React.createElement(ClockHand, { rotation: minutes, type: ClockHandType.Minute }),
        showSeconds && React.createElement(ClockHand, { rotation: seconds, type: ClockHandType.Second })));
};
// Decimal time to use for the app
var decimalTime = new DecimalTime();
// Defines the React app
var App = function (_a) {
    var title = _a.title, _b = _a.refreshRate, refreshRate = _b === void 0 ? DecimalTime.decimalSecond : _b;
    return (React.createElement("div", null,
        title && (React.createElement("h1", null, title)),
        React.createElement(DigitalDecimalDisplay, { decimalTime: decimalTime, refreshRate: refreshRate, blinkRate: 1000, showSeconds: true }),
        React.createElement(AnalogClock, { decimalTime: decimalTime, refreshRate: refreshRate, showSeconds: true })));
};
ReactDOM.render(React.createElement(App, { title: "Current decimal time:", refreshRate: DecimalTime.decimalSecond }), document.getElementById('root'));