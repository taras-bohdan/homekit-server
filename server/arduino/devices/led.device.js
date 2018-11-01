import five from 'johnny-five';

export class LedDevice {
  constructor(pin) {
    return new five.Led(pin);
  }
}
