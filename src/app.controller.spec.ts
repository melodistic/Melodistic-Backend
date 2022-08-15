import { Test } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('App Controller', () => {
  let appController: AppController;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();
    appController = moduleRef.get(AppController);
  });
  it('GET / should return ping and timestamp', async () => {
    const result = appController.healthcheck();
    expect(result).toHaveProperty('message');
    expect(result).toHaveProperty('timestamp');
  });
});
