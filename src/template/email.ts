import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailTemplate {
  renderOTPVerifyEmailTemplate = (token: string): string =>
    `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
    </head>
    <body>
        <table style="width: 100%;font-family: 'Poppins', sans-serif;font-size:16px;">
            <tr>
                <td style="font-weight: bold; color: black;">Melodistic</td></tr>
            <tr><td style="font-size: 14px; color: black;">To reset your password, please use the following One Time Password (OTP):</td></tr>
            <tr>
                <td style="background: black;color: white;padding: 44px 0; margin: 24px 0;">
                    <div style="font-weight: 600; text-align: center; color: black;">One Time password (OTP):</div>
                    <div style="font-size: 28px; font-weight: bold; color: #FA8B44; text-align: center;">${token}</div>
                    <div style="font-size: 14px; text-align: center; color: white;">(This OTP is valid for only 5 minutes)</div>
                </td>
            </tr>
            <tr><td style="font-size: 14px;">Thank you for using Melodistic</td></tr>
        </table>
    </body>
    </html>`;
  
  renderVerifyEmailTemplate = (email: string, url: string): string =>
  `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap"
        rel="stylesheet"
      />
    </head>
    <body>
      <table
        style="width: 100%; font-family: 'Poppins', sans-serif; font-size: 14px"
      >
        <tr>
          <td>
            <div style="max-width: 440px; margin: 0 auto">
              <div
                style="font-size: 28px; font-weight: bold; margin-bottom: 16px; color: black;"
              >
                Hi <a href="mailto:${email}" target="_blank" style="color: black; text-decoration: none;">${email}</a>,
              </div>
              <div style="color: black;">
                Thanks for creating a Melodistic Account. Please verify your email
                address by clicking the button below.
              </div>
              <div style="margin: 16px 0">
                <a href="${url}" style="text-decoration: none">
                  <div
                    style="
                      background: black;
                      height: 24px;
                      width: 144px;
                      margin: 0 auto;
                      padding: 12px 24px;
                      color: white;
                      border-radius: 4px;
                      cursor: pointer;
                      text-align: center;
                    "
                  >
                    Verify Email Address
                  </div></a
                >
              </div>
              <div style="color: black;">Thank you for using Melodistic</div>
            </div>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
}
