import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('Prisma Service', () => {
  let prismaService: PrismaService;
  let app: INestApplication;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();
    prismaService = moduleRef.get(PrismaService);
    app = moduleRef.createNestApplication();
    jest.spyOn(prismaService, '$connect').mockImplementation(async () => {});
    await app.init();
  });
  it('onModuleInit should connect to prisma', async () => {
    await prismaService.onModuleInit();
    expect(prismaService.$connect).toBeCalled();
  });
  it('enableShutdownHooks should close prisma', async () => {
    const onSpy = jest.spyOn(prismaService, '$on');
    jest.spyOn(app, 'close').mockImplementation(async () => {});

    await prismaService.enableShutdownHooks(app);
    expect(prismaService.$on).toBeCalledWith(
      'beforeExit',
      expect.any(Function),
    );
    onSpy.mock.calls[0][1](jest.fn());
    expect(app.close).toHaveBeenCalled();
  });
});
