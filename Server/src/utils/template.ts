export function generateResetPasswordEmailTemplate(resetPasswordUrl: number | string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif;
    background: #ffffff;
    color: #1a1a1a;
    line-height: 1.6;
    min-height: 100vh;
  }
  .wrapper {
    width: 100%;
    background: #ffffff;
    padding: 20px;
  }
  .container {
    max-width: 580px;
    margin: 40px auto;
    background: #ffffff;
    border: 1px solid #e5e5e5;
    border-radius: 12px;
    overflow: hidden;
  }
  .header {
    padding: 40px 30px;
    text-align: center;
    background: #ffffff;
    border-bottom: 1px solid #e5e5e5;
  }
  .logo {
    font-size: 26px;
    font-weight: 700;
    letter-spacing: -0.8px;
    color: #000000;
    text-transform: uppercase;
    margin-bottom: 12px;
  }
  .logo span {
    color: #000000;
    font-weight: 900;
  }
  .tagline {
    font-size: 12px;
    color: #666666;
    letter-spacing: 1px;
    text-transform: uppercase;
    font-weight: 500;
  }
  .content {
    padding: 40px 30px;
    font-size: 15px;
  }
  .greeting {
    font-size: 18px;
    font-weight: 600;
    color: #000000;
    margin-bottom: 16px;
  }
  .text {
    color: #333333;
    margin-bottom: 24px;
    line-height: 1.7;
  }
  .button-wrap {
    text-align: center;
    margin: 32px 0;
  }
  .reset-btn {
    display: inline-block;
    padding: 14px 40px;
    border-radius: 6px;
    background: #000000;
    color: #ffffff !important;
    text-decoration: none;
    font-weight: 600;
    font-size: 14px;
    border: none;
    transition: all 0.2s ease;
  }
  .reset-btn:hover {
    opacity: 0.85;
  }
  .info-box {
    background: #f5f5f5;
    border-left: 2px solid #000000;
    padding: 14px 16px;
    border-radius: 4px;
    margin: 24px 0;
    font-size: 14px;
    color: #333333;
  }
  .expiry {
    color: #000000;
    font-weight: 600;
  }
  .link-section {
    margin: 24px 0;
  }
  .link-label {
    font-size: 11px;
    color: #666666;
    margin-bottom: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
  }
  .link-box {
    background: #f5f5f5;
    border: 1px solid #d0d0d0;
    padding: 12px 14px;
    border-radius: 4px;
    font-size: 12px;
    word-break: break-all;
    color: #333333;
    font-family: 'Monaco', 'Courier New', monospace;
    line-height: 1.5;
  }
  .footer {
    padding: 24px 30px;
    text-align: center;
    font-size: 11px;
    color: #888888;
    border-top: 1px solid #e5e5e5;
    background: #ffffff;
  }
  .divider {
    height: 1px;
    background: #e5e5e5;
    margin: 20px 0;
  }
  @media (max-width: 600px) {
    .container {
      margin: 20px 0;
      border-radius: 8px;
    }
    .header {
      padding: 30px 20px;
    }
    .content {
      padding: 24px 20px;
      font-size: 14px;
    }
    .greeting {
      font-size: 16px;
    }
    .reset-btn {
      padding: 12px 36px;
      font-size: 13px;
    }
    .logo {
      font-size: 22px;
    }
  }
</style>
</head>

<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo">Quiz<span>Sprint</span></div>
        <div class="tagline">Password Reset</div>
      </div>

      <div class="content">
        <p class="greeting">Hello 👋</p>
        <p class="text">You requested to reset your password. Click the button below to proceed:</p>

        <div class="button-wrap">
          <a href="${resetPasswordUrl}" class="reset-btn">
            Reset Password →
          </a>
        </div>

        <div class="info-box">
          ⏱ This link expires in <span class="expiry">15 minutes</span>
        </div>

        <div class="link-section">
          <div class="link-label">Can't click the button?</div>
          <div class="link-box">${resetPasswordUrl}</div>
        </div>

        <div class="divider"></div>

        <p class="text" style="font-size: 13px; color: #666666;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>

      <div class="footer">
        © ${new Date().getFullYear()} QuizSprint. Designed to win.
      </div>
    </div>
  </div>
</body>
</html>
`;
}

export function generateVerificationCodeEmailTemplate(verificationCode: number | string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif;
    background: #ffffff;
    color: #1a1a1a;
    line-height: 1.6;
    min-height: 100vh;
  }
  .wrapper {
    width: 100%;
    background: #ffffff;
    padding: 20px;
  }
  .container {
    max-width: 580px;
    margin: 40px auto;
    background: #ffffff;
    border: 1px solid #e5e5e5;
    border-radius: 12px;
    overflow: hidden;
  }
  .header {
    padding: 40px 30px;
    text-align: center;
    background: #ffffff;
    border-bottom: 1px solid #e5e5e5;
  }
  .logo {
    font-size: 26px;
    font-weight: 700;
    letter-spacing: -0.8px;
    color: #000000;
    text-transform: uppercase;
    margin-bottom: 12px;
  }
  .logo span {
    color: #000000;
    font-weight: 900;
  }
  .subtitle {
    font-size: 12px;
    color: #666666;
    letter-spacing: 1px;
    text-transform: uppercase;
    font-weight: 500;
  }
  .content {
    padding: 40px 30px;
    font-size: 15px;
  }
  .greeting {
    font-size: 18px;
    font-weight: 600;
    color: #000000;
    margin-bottom: 16px;
  }
  .text {
    color: #333333;
    margin-bottom: 24px;
    line-height: 1.7;
  }
  .code-label {
    text-align: center;
    font-size: 11px;
    color: #666666;
    margin-bottom: 16px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
  }
  .code-box {
    text-align: center;
    font-size: 48px;
    font-weight: 900;
    letter-spacing: 10px;
    padding: 28px 20px;
    border-radius: 8px;
    background: #f5f5f5;
    border: 1px solid #d0d0d0;
    color: #000000;
    margin-bottom: 28px;
    font-family: 'Monaco', 'Courier New', monospace;
    line-height: 1.2;
  }
  .info {
    background: #f5f5f5;
    border-left: 2px solid #000000;
    padding: 14px 16px;
    border-radius: 4px;
    font-size: 14px;
    color: #333333;
  }
  .highlight {
    color: #000000;
    font-weight: 600;
  }
  .security-note {
    background: #f5f5f5;
    border-left: 2px solid #1a1a1a;
    padding: 12px 14px;
    border-radius: 4px;
    margin-top: 24px;
    font-size: 13px;
    color: #333333;
  }
  .signature {
    margin-top: 24px;
    color: #333333;
    font-size: 14px;
  }
  .signature strong {
    color: #000000;
    display: block;
    margin-top: 8px;
    font-weight: 600;
  }
  .footer {
    padding: 24px 30px;
    text-align: center;
    font-size: 11px;
    color: #888888;
    border-top: 1px solid #e5e5e5;
    background: #ffffff;
  }
  .divider {
    height: 1px;
    background: #e5e5e5;
    margin: 20px 0;
  }
  @media (max-width: 600px) {
    .container {
      margin: 20px 0;
      border-radius: 8px;
    }
    .header {
      padding: 30px 20px;
    }
    .content {
      padding: 24px 20px;
      font-size: 14px;
    }
    .greeting {
      font-size: 16px;
    }
    .code-box {
      font-size: 40px;
      letter-spacing: 8px;
      padding: 24px 16px;
    }
    .logo {
      font-size: 22px;
    }
  }
</style>
</head>

<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo">Quiz<span>Sprint</span></div>
        <div class="subtitle">Email Verification</div>
      </div>

      <div class="content">
        <p class="greeting">Welcome! 🎯</p>
        <p class="text">Confirm your email by entering the verification code below:</p>

        <div class="code-label">Your verification code</div>
        <div class="code-box">${verificationCode}</div>

        <div class="info">
          ⏱ Code expires in <span class="highlight">10 minutes</span>
        </div>

        <div class="security-note">
          🔒 Never share this code with anyone.
        </div>

        <div class="divider"></div>

        <p class="text" style="font-size: 13px; color: #666666;">
          If you didn't request this code, you can safely ignore this email.
        </p>

        <div class="signature">
          Ready to sprint? 🚀<br/>
          <strong>The QuizSprint Team</strong>
        </div>
      </div>

      <div class="footer">
        © ${new Date().getFullYear()} QuizSprint. Built for speed.
      </div>
    </div>
  </div>
</body>
</html>
`;
}