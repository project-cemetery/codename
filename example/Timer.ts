import { Service } from '&codename/di/Service';
import { BackgroundService } from '&codename/core/BackgroundService';

@Service()
export class Timer implements BackgroundService {
  async onStart() {
    setInterval(() => {
      console.log(Date.now());
    }, 10000);
  }
}
