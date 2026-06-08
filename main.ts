const hourPin: DigitalPin = DigitalPin.P8
const secondPin: DigitalPin = DigitalPin.P9

const motorPin1: DigitalPin = DigitalPin.P12
const motorPin2: DigitalPin = DigitalPin.P13
const motorPin3: DigitalPin = DigitalPin.P14
const motorPin4: DigitalPin = DigitalPin.P15

const touchPin1: DigitalPin = DigitalPin.P0
const touchPin2: DigitalPin = DigitalPin.P1
const touchPin3: DigitalPin = DigitalPin.P16
const touchPin4: DigitalPin = DigitalPin.P11 

// DS3231.dateTime(2026, 5, 27, 3, 18, 58, 40)

enum State {
    startUp = 0,
    clock = 1,
    hour = 2,
    minute = 3,
    second = 4
}
let state: State = State.startUp

let secondRing: Ring = new Ring(DS3231.second, secondPin, 60, neopixel.rgb(255, 0, 0), 26)
let hourRing: Ring = new Ring(DS3231.hour, hourPin, 24, neopixel.rgb(0, 255, 0), 0)
let motor: Motor = new Motor(DS3231.minute, [motorPin1, motorPin2, motorPin3, motorPin4], 2048)

function main() {
    if (state === State.startUp) {
        if (input.buttonIsPressed(Button.B)) {
            motor.nowTime = motor.getTime()
            motor.oldTime = 0
            motor.updateTime(-1)
            state = State.clock
        } else {
            motor.makeStep()
        }
    }

    else if (state === State.clock) {
        secondRing.checkTime()
        hourRing.checkTime()
        motor.checkTime()
        basic.pause(100)
    } else {
        if (pins.digitalReadPin(touchPin4)) {
            DS3231.dateTime(2026, 5, 27, 3, hourRing.nowTime, motor.nowTime, secondRing.nowTime)
            state = State.clock
        }
    }

    if (state === State.hour) {
        hourRing.changeTime()
        for (hourRing.timer; hourRing.timer >= 0; hourRing.timer -= 1) basic.pause(10)
    }

    else if (state === State.minute) {
        motor.changeTime()
        for (motor.timer; motor.timer >= 0; motor.timer -= 1) basic.pause(10)
    }

    else if (state === State.second) {
        secondRing.changeTime()
        for (secondRing.timer; secondRing.timer >= 0; secondRing.timer -= 1) basic.pause(10)
    }

    if (pins.digitalReadPin(touchPin1)) {
        state += 1
        if (state > 4) state = State.hour
        basic.pause(500)
    }
}

function test() {
    hourRing.nowTime = 0
    secondRing.nowTime = 0
    hourRing.updateTime(-1)
    secondRing.updateTime(-1)
}

// test()
basic.forever(main)
