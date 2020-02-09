import 'reflect-metadata';

import { UserController } from './UserController';
import { createApp } from '../src/core/Application';
import { Timer } from './Timer';

const app = createApp({
  controllers: [UserController],
  backgroundServices: [Timer],
});

app.start().then(console.log);
