import { Accessory, Characteristic, Service, uuid } from 'hap-nodejs';
import { ThermometerDevice } from '../arduino/devices/thermometer.device';
import { LoggerService } from '../services';

export class ThermometerAccessory extends Accessory {
  constructor() {
    super('Temperature Sensor', uuid.generate('hap-nodejs:accessories:temperature-sensor'));
    this.currentTemperature = 0;

    this.thermometerDevice = new ThermometerDevice(2);

    this.thermometerDevice.on('change', temperature => {
     LoggerService.info(temperature.celsius + '°C');
     this.currentTemperature = temperature.celsius;

     // update the characteristic value so interested iOS devices can get notified
     this
     .getService(Service.TemperatureSensor)
     .setCharacteristic(Characteristic.CurrentTemperature, this.currentTemperature);
     });

    this.setBasicProperties();
    this.addPropertiesForPublishing();
  }


  getTemperature() {
    console.log('Getting the current temperature!');
    return this.currentTemperature;
  }

  addPropertiesForPublishing() {
    // Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
    this.username = '0F-E4-AC-25-9E-54';
    this.pincode = '031-45-154';
  }

  /**
   * Add the actual TemperatureSensor Service.
   * We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
   */
  setBasicProperties() {
    this
      .addService(Service.TemperatureSensor)
      .getCharacteristic(Characteristic.CurrentTemperature)
      .on('get', (callback) => {
        // return our current value
        callback(null, this.getTemperature());
      });
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
