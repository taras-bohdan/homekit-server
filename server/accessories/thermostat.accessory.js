import { Accessory, Characteristic, Service, uuid } from 'hap-nodejs';

export class ThermostatAccessory extends Accessory {
  constructor() {
    super('Thermostat', uuid.generate('Thermostat'));

    this.addService(Service.Thermostat)
      .getCharacteristic(Characteristic.CurrentTemperature)
      .on('get', (callback) => {
        // return our current value
        callback(null, 10);
      });

    this.addPropertiesForPublishing();
  }

  addPropertiesForPublishing() {
    // Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
    // username must be unique mac
    this.username = 'FC-2F-5C-5E-02-18';
    this.pincode = '031-45-154';
  }

  /**
   * publish accessory
   * @param {number} port
   */
  publish(port) {
    super.publish({
      port,
      username: this.username,
      pincode: this.pincode,
    });
  }
}
