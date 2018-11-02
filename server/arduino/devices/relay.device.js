import five from 'johnny-five';

export class RelayDevice extends five.Relay {
  constructor(pin) {
    return super(pin);
  }
}
