import hapNode from 'hap-nodejs';
import { Outlet } from './accessories/outlet';
import { Arduino } from './arduino';

Arduino.connectToBoard().then(() => {
  hapNode.init();

  new Outlet().publish(51826);
});
