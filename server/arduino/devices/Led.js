import five from 'johnny-five';

export class Led {
  constructor(pin) {
    return new five.Led(pin);
  }
}
