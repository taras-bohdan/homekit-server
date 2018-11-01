import hapNode from 'hap-nodejs';
import { OutletAccessory, ThermometerAccessory, thermostat, ThermostatAccessory } from './accessories';
import { Arduino } from './arduino';
import { LoggerService } from './services';

Arduino.connectToBoard().then(() => {
  hapNode.init();

  new OutletAccessory().publish(51826);
  new ThermometerAccessory().publish(51827);
  new ThermostatAccessory().publish(51828);
});

hapNode.init();

LoggerService.info('started');
