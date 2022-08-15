import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { MailService } from './mail.service';
import * as sendgrid from '@sendgrid/mail';

jest.mock('@sendgrid/mail', () => {
  return {
    MailService: {
      setApiKey: jest.fn(),
      send: jest.fn(),
    },
    setApiKey: jest.fn(),
    send: jest.fn(),
  };
});

describe('Mail Service', () => {
  let mailService: MailService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'SENDGRID_API_KEY') {
                return 'SG.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
              }
              return 'mockENVValue';
            }),
          },
        },
      ],
    }).compile();
    mailService = moduleRef.get(MailService);
  });
  it('sendEmail should call sendgrid service', async () => {
    await mailService.sendEmail('to', 'subject', 'html');
    expect(sendgrid.setApiKey).toHaveBeenCalledWith(
      'SG.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    );
    expect(sendgrid.send).toHaveBeenCalledWith({
      from: 'mockENVValue',
      to: 'to',
      subject: 'subject',
      html: 'html',
    });
  });
});
