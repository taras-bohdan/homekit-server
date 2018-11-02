import { Accessory, Characteristic, Service, uuid } from 'hap-nodejs';

export class GenericAccessory extends Accessory {
  constructor(name) {
    super(name, uuid.generate(name));
  }

  /**
   * Add publish properties
   * @param {string} mac - must be unique mac-address - like identifier
   * @param {string} pin - 8 digit pin in string format xxx-xx-xxx
   * @example 123-45-678
   */
  addPropertiesForPublishing(mac, pin) {
    // username must be unique mac
    this.username = mac;
    this.pincode = pin;
  }

  /**
   * Set accessory information
   * @param {string} manufacturer - accessory manufacturer
   * @param {string} model - model name
   * @param {string} serial - serial number
   */
  setAccessoryInformation(manufacturer, model, serial) {
    this.getService(Service.AccessoryInformation)
      .setCharacteristic(Characteristic.Manufacturer, manufacturer)
      .setCharacteristic(Characteristic.Model, model)
      .setCharacteristic(Characteristic.SerialNumber, serial);
  }

  /**
   * Publish accessory
   * @param {number} port - port to publish on
   */
  publish(port) {
    super.publish({
      port,
      username: this.username,
      pincode: this.pincode,
    });
  }
}

export const eventCharacteristic = {
  GET: 'get',
  SET: 'set',
};
