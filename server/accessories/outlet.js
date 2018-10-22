import {
  Accessory,
  Service,
  Characteristic,
  uuid,
} from 'hap-nodejs';
import { Relay } from '../arduino/devices/Relay';

import { LoggerService } from '../services';

const err = null; // in case there were any problems

/**
 * here's a fake hardware device that we'll expose to HomeKit
 */
export class Outlet extends Accessory {
  constructor() {
    // Generate a consistent UUID for our outlet Accessory that will remain the same even when;;;
    // restarting our server. We use the `uuid.generate` helper function to create a deterministic
    // UUID based on an arbitrary "namespace" and the accessory name.
    super('Outlet', uuid.generate('hap-nodejs:accessories:Outlet'));

    this.setBasicProperties();
    this.addPropertiesForPublishing();
    this.subscribeToEvents();

    // associated relay on pin 7
    this.relay = new Relay(7);
  }


  subscribeToEvents() {
    // listen for the "identify" event for this Accessory
    this.on('identify', (paired, callback) => {
      this.identify();
      callback(); // success
    });

    // Add the actual outlet Service and listen for change events from iOS.
    // We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
    this
      .addService(Service.Outlet, 'Fake Outlet') // services exposed to the user should have "names" like "Fake Light"
      // for
      // us
      .getCharacteristic(Characteristic.On)
      .on('set', (value, callback) => {
        this.setPowerOn(value);
        callback(); // Our fake Outlet is synchronous - this value has been successfully set
      });


    // We want to intercept requests for our current power state so we can query the hardware itself instead of
    // allowing HAP-NodeJS to return the cached Characteristic.value.
    this
      .getService(Service.Outlet)
      .getCharacteristic(Characteristic.On)
      .on('get', (callback) => {

        // this event is emitted when you ask Siri directly whether your light is on or not. you might query
        // the light hardware itself to find this out, then call the callback. But if you take longer than a
        // few seconds to respond, Siri will give up.

        const err = null; // in case there were any problems

        if (this.powerOn) {
          LoggerService.info('Are we on? Yes.');
          callback(err, true);
        }
        else {
          LoggerService.info('Are we on? No.');
          callback(err, false);
        }
      });
  }

  get powerOn() {
    return this.relay.isOn;
  }

  // Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
  addPropertiesForPublishing() {
    this.username = '1A:2B:3C:4D:5D:FF';
    this.pincode = '031-45-154';
  }

  // set some basic properties (these values are arbitrary and setting them is optional)
  setBasicProperties() {
    this
      .getService(Service.AccessoryInformation)
      .setCharacteristic(Characteristic.Manufacturer, 'xdr')
      .setCharacteristic(Characteristic.Model, 'Rev-1')
      .setCharacteristic(Characteristic.SerialNumber, 'A1S2NASF88EW');
  }

  /**
   * Toggle power on/off
   * @param {boolean} on - toggle state
   * @returns {*|winston.Logger|void}
   */
  setPowerOn(on) {
    if (on) {
      this.relay.on();
      if (err) {
        return LoggerService.error(err);
      }
      LoggerService.info('outlet is now on.');
    } else {
      this.relay.off();
      if (err) {
        return LoggerService.error(err);
      }
      LoggerService.info('outlet is now off.');
    }
  }

  identify() {
    LoggerService.info('Identify the outlet.');
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
