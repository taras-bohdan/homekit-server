import five from 'johnny-five';

export class Relay {
  constructor(pin) {
    this.relay = new five.Relay(pin);

    return this.relay;
  }
}
