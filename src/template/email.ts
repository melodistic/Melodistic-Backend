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
  
  renderSuccessfulVerifyTemplate = (email: string): string => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Successfully Verify Email</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
    </head>
    <body style="height: 100vh; width: 100vw;font-family: 'Poppins', sans-serif;font-size:14px; text-align: center;">
      <div style="display: flex; flex-direction: column; width: 440px; height: 100vh; margin: auto auto; align-items:center; justify-content: center;">
        <div>
          <svg
            width="302"
            height="319"
            viewBox="0 0 302 319"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M257.751 166.028C257.751 227.858 207.625 277.987 145.792 277.987C83.9595 277.987 33.8335 227.858 33.8335 166.028C33.8335 104.195 83.9595 54.0694 145.792 54.0694C207.625 54.0694 257.751 104.195 257.751 166.028Z"
              fill="#F5F5F5"
            />
            <path
              d="M60.2539 185.272C60.2539 189.186 63.4268 192.359 67.3411 192.359C71.2547 192.359 74.4284 189.186 74.4284 185.272C74.4284 181.359 71.2547 178.185 67.3411 178.185C63.4268 178.185 60.2539 181.359 60.2539 185.272Z"
              fill="#858D93"
            />
            <path
              d="M196 258.088C196 262.002 199.173 265.175 203.087 265.175C207.001 265.175 210.174 262.002 210.174 258.088C210.174 254.174 207.001 251 203.087 251C199.173 251 196 254.174 196 258.088Z"
              fill="#E0E0E0"
            />
            <path
              d="M90.9237 154.945C90.5204 154.959 90.2048 155.297 90.2187 155.7C90.5993 166.813 92.4719 176.748 95.2542 185.554C100.338 201.644 108.457 213.981 116.062 222.933C119.865 227.409 123.542 231.045 126.648 233.883C129.751 236.716 132.292 238.762 133.797 240.04C134.103 240.299 134.563 240.259 134.825 239.952C135.086 239.646 135.048 239.184 134.741 238.924C133.211 237.627 130.705 235.611 127.633 232.804C118.42 224.388 104.165 208.912 96.6466 185.115C93.9029 176.428 92.0541 166.628 91.6786 155.648C91.6642 155.246 91.3262 154.931 90.9237 154.945Z"
              fill="#ADA6A6"
            />
            <path
              d="M86.1297 162.111C85.6442 168.052 83.2395 178.243 86.9405 177.94C90.6421 177.637 89.9944 172.693 94.179 171.732C98.3642 170.771 97.0076 175.041 101.447 174.041C105.887 173.039 103.642 166.618 109.182 166.669C114.721 166.72 107.505 160.323 99.6642 156.921L86.1297 162.111Z"
              fill="#FA8B44"
            />
            <ellipse
              cx="74.2333"
              cy="102.394"
              rx="57.7564"
              ry="61.4279"
              transform="rotate(-17.5333 74.2333 102.394)"
              fill="url(#paint0_linear_1338_7469)"
            />
            <path
              d="M255.975 206.426C230.917 224.469 198.541 222.343 183.661 201.679C168.782 181.014 177.033 149.636 202.091 131.593C227.149 113.55 259.525 115.675 274.404 136.339C289.284 157.004 281.032 188.382 255.975 206.426Z"
              fill="url(#paint1_linear_1338_7469)"
            />
            <path
              d="M234.742 128.78C227.454 131.699 224.832 136.919 226.764 141.695C228.212 145.276 241.312 156.668 248.6 153.748C255.889 150.829 260.695 146.35 254.934 136.528C250.973 129.776 242.03 125.86 234.742 128.78Z"
              fill="white"
              fill-opacity="0.5"
            />
            <ellipse
              cx="195.884"
              cy="49.544"
              rx="42.497"
              ry="48.1534"
              transform="rotate(-1.91158 195.884 49.544)"
              fill="url(#paint2_linear_1338_7469)"
            />
            <path
              d="M164.444 24.9529C158.678 31.8762 159.685 43.7036 163.718 48.0793C167.75 52.4561 173.282 47.7232 179.048 40.8C184.813 33.8768 186.04 20.5823 182.008 16.2076C177.975 11.8309 170.209 18.0297 164.444 24.9529Z"
              fill="white"
              fill-opacity="0.5"
            />
            <path
              d="M32.7269 85.9755C30.4432 98.1035 39.4026 110.007 47.0529 111.439C54.7024 112.871 58.1467 103.29 60.4304 91.1615C62.7141 79.0335 55.4374 63.7388 47.7871 62.3066C40.1375 60.8743 35.01 73.8477 32.7269 85.9755Z"
              fill="white"
              fill-opacity="0.5"
            />
            <path
              d="M184.756 202.274C176.354 207.329 164.49 213.563 153.249 224.729C142.001 235.904 131.387 252.018 125.409 276.767C125.293 277.251 125.589 277.734 126.07 277.857C126.551 277.972 127.036 277.677 127.153 277.193C133.067 252.739 143.484 236.969 154.513 226.007C165.546 215.038 177.206 208.902 185.68 203.814C186.104 203.56 186.242 203.011 185.986 202.585C185.731 202.159 185.18 202.02 184.756 202.274Z"
              fill="#ADA6A6"
            />
            <path
              d="M68.6522 227.678C54.8349 231.643 46.851 246.062 50.8198 259.882C54.789 273.703 69.2093 281.682 83.0266 277.717C96.8439 273.744 104.828 259.325 100.858 245.505C96.8898 231.692 82.4704 223.705 68.6522 227.678Z"
              fill="#D8D8D8"
            />
            <path
              d="M178.659 211.347C180.332 213.649 183.681 210.266 184.982 213.559C186.283 216.853 188.423 210.528 188.598 204.801L182.2 198.461C178.486 200.083 171.735 201.918 172.809 204.015C173.882 206.104 176.72 204.138 178.31 206.309C179.897 208.472 176.986 209.037 178.659 211.347Z"
              fill="#FA8B44"
            />
            <path
              d="M43.3029 205.533C39.0641 206.75 36.6149 211.174 37.8324 215.41C39.0506 219.652 43.4738 222.1 47.7124 220.883C51.9511 219.665 54.4 215.24 53.183 211.003C51.9655 206.765 47.5416 204.315 43.3029 205.533Z"
              fill="#101010"
            />
            <path
              d="M184.825 134.661C188.283 127.355 191.166 120.592 193.168 114.453C195.168 108.313 196.293 102.797 196.196 97.9582C196.187 97.4633 195.777 97.0693 195.281 97.0799C194.786 97.0898 194.393 97.4994 194.403 97.9942C194.496 102.525 193.428 107.872 191.462 113.897C188.025 124.445 181.859 137.057 174.606 151.152C163.726 172.298 150.401 196.793 140.175 222.869C129.95 248.945 122.815 276.619 124.367 304.145C124.632 308.84 125.149 313.526 125.948 318.203C126.032 318.687 126.495 319.023 126.984 318.933C127.473 318.851 127.8 318.392 127.718 317.9C126.93 313.296 126.419 308.676 126.157 304.039C123.813 262.684 141.424 220.643 159.603 184.25C168.69 166.053 177.908 149.27 184.825 134.661Z"
              fill="#ADA6A6"
            />
            <path
              d="M189.035 105.136C190.827 105.876 191.487 103.051 193.634 103.554C195.78 104.056 194.312 106.029 196.585 106.571C198.858 107.115 199.059 103.104 201.643 104.483C204.225 105.861 202.095 100.652 199.089 96.9042L191.743 96.4027C190.357 99.4883 187.245 104.396 189.035 105.136Z"
              fill="#FA8B44"
            />
            <defs>
              <linearGradient
                id="paint0_linear_1338_7469"
                x1="74.2333"
                y1="40.9662"
                x2="74.2333"
                y2="163.822"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#D06212" />
                <stop offset="1" stop-color="#FA8B44" />
              </linearGradient>
              <linearGradient
                id="paint1_linear_1338_7469"
                x1="274.404"
                y1="136.339"
                x2="183.661"
                y2="201.679"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#D06212" />
                <stop offset="1" stop-color="#FA8B44" />
              </linearGradient>
              <linearGradient
                id="paint2_linear_1338_7469"
                x1="195.884"
                y1="1.39059"
                x2="195.884"
                y2="97.6973"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#D06212" />
                <stop offset="1" stop-color="#FA8B44" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h1 style="font-size: 28px; color:#FA8B44; font-weight:bold; margin: 16px 0;">Welcome to Melodistic</h1>
        <h3 style="font-weight: 600;font-size: 16px; margin-bottom: 16px;">Congratulations, ${email} has been verified!</h3>
        <div>
          Today is a great day! By signing up for Melodistic, you're getting a
          tool that will help you build your exercise track with your favorite
          song better than ever.
        </div>
      </div>
    </body>
  </html>`;
}
