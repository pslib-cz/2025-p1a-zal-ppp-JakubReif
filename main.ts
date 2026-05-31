const hourPin: DigitalPin = DigitalPin.P8
const secondPin: DigitalPin = DigitalPin.P9

const motorPin1: DigitalPin = DigitalPin.P12
const motorPin2: DigitalPin = DigitalPin.P13
const motorPin3: DigitalPin = DigitalPin.P14
const motorPin4: DigitalPin = DigitalPin.P15

DS3231.dateTime(2026, 5, 27, 3, 18, 46, 0)

const stepDelay: number = 5
const clockDelay: number = 500
const stepsPerRotation: number = 64
const minuteStep: number = Math.floor(stepsPerRotation / 60)
const minuteCompensationSteps: number = stepsPerRotation % 64

type ring = {
    strip: neopixel.Strip
    color: number
    nowTime: number
}

const hourRing: ring = {
    strip: neopixel.create(hourPin, 24, NeoPixelMode.RGB),
    color: neopixel.rgb(0, 128, 0),
    nowTime: DS3231.hour()
}
hourRing.strip.setBrightness(10)

const secondRing: ring = {
    strip: neopixel.create(secondPin, 60, NeoPixelMode.RGB),
    color: neopixel.rgb(128, 0, 0),
    nowTime: DS3231.second()
}
secondRing.strip.setBrightness(15)

function updateTime(ring: ring, time: number) {
    ring.nowTime = time
    ring.strip.clear()
    ring.strip.setPixelColor(time, ring.color)
    ring.strip.show()
}

function makeTinyStep() {
    pins.digitalWritePin(motorPin1, 1)
    pins.digitalWritePin(motorPin2, 0)
    pins.digitalWritePin(motorPin3, 1)
    pins.digitalWritePin(motorPin4, 0)
    basic.pause(stepDelay)

    pins.digitalWritePin(motorPin1, 0)
    pins.digitalWritePin(motorPin2, 1)
    pins.digitalWritePin(motorPin3, 1)
    pins.digitalWritePin(motorPin4, 0)
    basic.pause(stepDelay)

    pins.digitalWritePin(motorPin1, 0)
    pins.digitalWritePin(motorPin2, 1)
    pins.digitalWritePin(motorPin3, 0)
    pins.digitalWritePin(motorPin4, 1)
    basic.pause(stepDelay)

    pins.digitalWritePin(motorPin1, 1)
    pins.digitalWritePin(motorPin2, 0)
    pins.digitalWritePin(motorPin3, 0)
    pins.digitalWritePin(motorPin4, 1)
    basic.pause(stepDelay)
}

function makeSteps(steps: number) {
    for (let i: number = 0; i < steps; i += 1) {
        makeTinyStep()
    }
}

let nowMinute: number = DS3231.minute()
function rotate(minute: number) {
    let steps: number = minute - nowMinute
    if (steps < 0) {
        steps += 60
        makeSteps(minuteCompensationSteps)
    }
    makeSteps(steps * minuteStep)
}

updateTime(hourRing, DS3231.hour())

let second: number
let hour: number
let minute: number
function main() {
    basic.pause(clockDelay)
    second = DS3231.second()
    hour = DS3231.hour()
    minute = DS3231.minute()

    if (secondRing.nowTime != second) {
        updateTime(secondRing, second)
    }

    if (hourRing.nowTime != hour) {
        updateTime(hourRing, hour)
    }

    if (nowMinute != minute) {
        rotate(minute)
    }
}

basic.forever(main)