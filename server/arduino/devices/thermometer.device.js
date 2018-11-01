import five from 'johnny-five';

export class ThermometerDevice {
  constructor(pin) {
    this.thermometer = new five.Thermometer({
      controller: 'DS18B20',
      pin,
    });

    return this.thermometer;
  }
}
