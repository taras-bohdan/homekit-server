import five from 'johnny-five';
import { LoggerService } from '../services';

export class Arduino {
  static connectToBoard() {
    return new Promise((resolve, reject) => {
      LoggerService.info('Connecting to arduino board');
      const board = new five.Board();
      board.on('ready', function () {
        LoggerService.info('Connected to arduino');
        resolve();
      });
    });
  }
}
