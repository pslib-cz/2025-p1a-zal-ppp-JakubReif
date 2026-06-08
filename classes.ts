class Time {
    nowTime: number
    getTime:  () => number
    plusPin: DigitalPin = touchPin3
    minusPin: DigitalPin = touchPin2
    timer: number = 0
    maxTime: number
    oldTime: number

    constructor(getTime: () => number, maxTime: number) {
        this.getTime = getTime
        this.nowTime = this.getTime()
        this.maxTime = maxTime
    }

    changeTime() {
        if (pins.digitalReadPin(this.plusPin)) {
            this.oldTime = this.nowTime
            this.nowTime += 1
            if (this.nowTime >= this.maxTime) this.nowTime = 0
            this.updateTime(-1)
            this.timer += 10
        } else if (pins.digitalReadPin(this.minusPin)) {
            this.oldTime = this.nowTime
            this.nowTime -= 1
            if (this.nowTime < 0) this.nowTime = this.maxTime - 1
            this.updateTime(-1)
            this.timer += 10
        } else {this.timer = 0}
    }

    updateTime(time: number): void {}
    // abstract checkTime(): number
}

class Ring extends Time {
    strip: neopixel.Strip
    color: number
    offset: number

    constructor(getTime: () => number, pin: DigitalPin, ledCount: number, color: number, offset: number) {
        super(getTime, ledCount)

        this.strip = neopixel.create(pin, this.maxTime, NeoPixelMode.RGB)
        this.color = color
        this.offset = offset

        this.strip.setBrightness(20)
        this.updateTime(-1)
    }

    updateTime(time: number = -1) {
        // this.nowTime = this.getTime()
        let pixel: number = this.nowTime + this.offset
        if (pixel >= this.maxTime) pixel -= this.maxTime
        if (this.maxTime === 24) {
            if (pixel >= 12) {
                pixel -= 12
            } else { pixel = pixel * 2 + 1}
        }
        this.strip.clear()
        this.strip.setPixelColor(pixel, this.color)
        this.strip.show()
    }

    checkTime() {
        let time: number = this.getTime()
        if (time !== this.nowTime) {
            this.nowTime = time
            this.updateTime(-1)
        }
        return time
    }
}

class Motor extends Time {
    pins: Array<DigitalPin>
    stepsPerRevolution: number
    position: number
    currentStep: number
    constructor(getTime: () => number, pins: Array<DigitalPin>, setpsPerRevolution: number) {
        super(getTime, 60)

        this.pins = pins
        this.stepsPerRevolution = setpsPerRevolution
        this.position = 0
        this.currentStep = 0
        this.oldTime = 0
    }

    updateTime(time: number = -1) {
        // this.nowTime = this.getTime()
        let steps: number = this.calcSteps()
        this.makeSteps(steps)
    }

    checkTime() {
        let time: number = this.getTime()
        if (time !== this.nowTime) {
            this.oldTime = this.nowTime
            this.nowTime = time
            this.updateTime(-1)
        }
        return time
    }

    calcSteps(): number {
        let delta: number = this.nowTime - this.oldTime
        if (delta < 0) delta += 60
        let steps: number = Math.round(delta * this.stepsPerRevolution / 60)
        if (steps < 0) steps += this.stepsPerRevolution
        return steps
    }

    makeSteps(stepCount: number) {
        for (let i: number = 0; i < stepCount; i += 1) this.makeStep()
        for (let i: number = 0; i < 4; i += 1) pins.digitalWritePin(this.pins[i], 0)
    }

    makeStep() {
        if (this.currentStep == 0) {
            pins.digitalWritePin(this.pins[1], 0)
            pins.digitalWritePin(this.pins[3], 0)
            pins.digitalWritePin(this.pins[0], 1)
            pins.digitalWritePin(this.pins[2], 1)
        } else if (this.currentStep == 1) {
            pins.digitalWritePin(this.pins[0], 0)
            pins.digitalWritePin(this.pins[3], 0)
            pins.digitalWritePin(this.pins[1], 1)
            pins.digitalWritePin(this.pins[2], 1)
        } else if (this.currentStep == 2) {
            pins.digitalWritePin(this.pins[0], 0)
            pins.digitalWritePin(this.pins[2], 0)
            pins.digitalWritePin(this.pins[1], 1)
            pins.digitalWritePin(this.pins[3], 1)
        } else if (this.currentStep == 3) {
            pins.digitalWritePin(this.pins[1], 0)
            pins.digitalWritePin(this.pins[2], 0)
            pins.digitalWritePin(this.pins[0], 1)
            pins.digitalWritePin(this.pins[3], 1)
        }
        this.currentStep += 1
        if (this.currentStep === 4) this.currentStep = 0
        basic.pause(10)
    }

    calibrate() {

    }
}
