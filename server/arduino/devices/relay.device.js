import five from 'johnny-five';

export class RelayDevice {
  constructor(pin) {
    this.relay = new five.Relay(pin);

    return this.relay;
  }
}
