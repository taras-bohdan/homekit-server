import { Characteristic, Service } from 'hap-nodejs';
import { LoggerService } from '../services';
import { eventCharacteristic, GenericAccessory } from './generic.accessory';
import { ThermometerDevice } from '../arduino/devices/thermometer.device';
import { RelayDevice } from '../arduino/devices/relay.device';

/**
 * Thermostat modes
 * @type {{'0': string, '1': string, '2': string, '3': string}}
 */
const heatingCoolingStateName = {
  0: 'Off',
  1: 'Heat',
  2: 'Cool',
  3: 'Auto',
};

const heatingCoolingState = {
  Off: 0,
  Heat: 1,
  Cool: 2,
  Auto: 3,
};

const checkInterval = 5000; // 5sec

export class ThermostatAccessory extends GenericAccessory {
  constructor() {
    super('Thermostat');

    // set initial values
    this.currentTemperature = 10;
    this.targetTemperature = 20;
    this.currentHeatingCoolingState = 0;
    this.targetHeatingCoolingState = 0;

    this.addPropertiesForPublishing('FC-2F-5C-5E-02-18', '031-45-154');
    this.setAccessoryInformation('xdr', 'Rev-1', 'XDR0001');
    this.configureThermostat();

    this.addDevices();
  }

  addDevices() {
    // add relay
    this.heaterRelayDevice = new RelayDevice(7);
    this.coolerRelayDevice = new RelayDevice(8);

    // add temp sensor
    this.thermometerDevice = new ThermometerDevice(2);

    this.thermometerDevice.on('change', temperature => {
      this.currentTemperature = temperature.celsius;

      // update the characteristic value so interested iOS devices can get notified
      this
        .getService(Service.Thermostat)
        .setCharacteristic(Characteristic.CurrentTemperature, this.currentTemperature);
    });

    // TODO implement immediate reaction on mode switch, but interval on check
    setInterval(() => {
      // check if current temperature meets criteria
      switch (this.targetHeatingCoolingState) {
        case heatingCoolingState.Heat:
          this.coolerRelayDevice.off();
          if (this.currentTemperature < this.targetTemperature) {
            this.heaterRelayDevice.on();
          } else {
            this.heaterRelayDevice.off();
          }
          break;
        case heatingCoolingState.Cool:
          this.heaterRelayDevice.off();
          if (this.currentTemperature > this.targetTemperature) {
            this.coolerRelayDevice.on();
          } else {
            this.coolerRelayDevice.off();
          }
          break;
        case heatingCoolingState.Auto:
          if (this.currentTemperature > this.targetTemperature) {
            this.heaterRelayDevice.off();
            this.coolerRelayDevice.on();
          } else if (this.currentTemperature < this.targetTemperature) {
            this.heaterRelayDevice.on();
            this.coolerRelayDevice.off();
          }
          break;
        case heatingCoolingState.Off:
          this.heaterRelayDevice.off();
          this.coolerRelayDevice.off();
          break;
        default:
          return;
      }
    }, checkInterval);
  }

  configureThermostat() {
    // add thermostat service
    this.addService(Service.Thermostat)
      .getCharacteristic(Characteristic.CurrentTemperature)
      .on(eventCharacteristic.GET, (callback) => {
        LoggerService.info(`Thermostat: get current temperature - ${this.currentTemperature}`);
        callback(null, this.currentTemperature);
      })
      .on(eventCharacteristic.SET, (value, callback) => {
        LoggerService.info(`Thermostat: set current temperature - ${value}`);
        this.currentTemperature = value;
        callback();
      });

    this.getService(Service.Thermostat)
      .getCharacteristic(Characteristic.TargetTemperature)
      .on(eventCharacteristic.GET, callback => {
        LoggerService.info(`Thermostat: get target temperature`);
        callback(null, this.targetTemperature);
      })
      .on(eventCharacteristic.SET, (value, callback) => {
        LoggerService.info(`Thermostat: set target temperature - ${value}`);
        this.targetTemperature = value;
        callback();
      });

    this.getService(Service.Thermostat)
      .getCharacteristic(Characteristic.CurrentHeatingCoolingState)
      .on(eventCharacteristic.GET, (callback) => {
        LoggerService.info(`Thermostat: GET current cooling state`);
        callback(null, this.currentHeatingCoolingState);
      });

    this.getService(Service.Thermostat)
      .getCharacteristic(Characteristic.TargetHeatingCoolingState)
      .on(eventCharacteristic.GET, (callback) => {
        LoggerService.info(`Thermostat: get target cooling state - ${heatingCoolingStateName[this.targetHeatingCoolingState]}`);
        callback(null, this.targetHeatingCoolingState);
      })
      .on(eventCharacteristic.SET, (state, callback) => {
        LoggerService.info(`Thermostat: set target state: ${heatingCoolingStateName[state]}`);
        this.targetHeatingCoolingState = state;
        callback();
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
