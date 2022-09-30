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
                <td style="font-weight: bold;">Melodistic</td></tr>
            <tr><td style="font-size: 14px;">To reset your password, please use the following One Time Password (OTP):</td></tr>
            <tr>
                <td style="background: black;color: white;padding: 44px 0; margin: 24px 0;">
                    <div style="font-weight: 600; text-align: center;">One Time password (OTP):</div>
                    <div style="font-size:28px; font-weight: bold; color: #FA8B44; text-align: center;">${token}</div>
                    <div style="font-size: 14px; text-align: center;">(This OTP is valid for only 5 minutes)</div>
                </td>
            </tr>
            <tr><td style="font-size: 14px;">Thank you for using Melodistic</td></tr>
        </table>
    </body>
    </html>`;
}
