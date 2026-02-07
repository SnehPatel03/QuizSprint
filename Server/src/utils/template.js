export function generateResetPasswordEmailTemplate(resetPasswordUrl) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>
  body {
    margin: 0;
    padding: 0;
    background: #020617;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, sans-serif;
    color: #e5e7eb;
  }
  .container {
    max-width: 480px;
    margin: 40px auto;
    background: #0b0f14;
    border-radius: 16px;
    border: 1px solid #1f2937;
    box-shadow: 0 20px 40px rgba(0,0,0,0.6);
    overflow: hidden;
  }
  .header {
    padding: 28px 20px;
    text-align: center;
    background: radial-gradient(circle at top, #2563eb 0%, transparent 60%);
  }
  .logo {
    font-size: 24px;
    font-weight: 800;
    color: #ffffff;
  }
  .logo span {
    color: #94a3b8;
  }
  .content {
    padding: 26px 22px;
    font-size: 14px;
    line-height: 1.6;
  }
  .button-wrap {
    text-align: center;
    margin: 26px 0;
  }
  .reset-btn {
    display: inline-block;
    padding: 14px 36px;
    border-radius: 12px;
    background: #2563eb;
    color: #ffffff !important;
    text-decoration: none;
    font-weight: 700;
    font-size: 15px;
  }
  .reset-btn:hover {
    opacity: 0.9;
  }
  .link-box {
    background: #020617;
    border: 1px solid #1f2937;
    padding: 12px;
    border-radius: 10px;
    font-size: 12px;
    word-break: break-all;
    color: #cbd5f5;
  }
  .footer {
    padding: 16px;
    text-align: center;
    font-size: 11px;
    color: #64748b;
    border-top: 1px solid #1f2937;
  }
</style>
</head>

<body>
  <div class="container">
    <div class="header">
      <div class="logo">Quiz<span>Sprint</span></div>
    </div>

    <div class="content">
      <p>Hello 👋</p>
      <p>You requested to reset your password. Click the button below to continue:</p>

      <div class="button-wrap">
        <a href="${resetPasswordUrl}" class="reset-btn">
          Reset Password →
        </a>
      </div>

      <p>This link expires in <strong>15 minutes</strong>.</p>

      <div class="link-box">
        If the button doesn’t work, copy & paste this link:<br /><br />
        ${resetPasswordUrl}
      </div>

      <p style="margin-top:18px">
        If you didn’t request this, you can safely ignore this email.
      </p>
    </div>

    <div class="footer">
      © ${new Date().getFullYear()} QuizSprint. Designed to win.
    </div>
  </div>
</body>
</html>
`;
}
export function generateVerificationCodeEmailTemplate(verificationCode) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>
  body {
    margin: 0;
    padding: 0;
    background: #020617;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, sans-serif;
    color: #e5e7eb;
  }
  .container {
    max-width: 480px;
    margin: 40px auto;
    background: #0b0f14;
    border-radius: 16px;
    border: 1px solid #1f2937;
    box-shadow: 0 20px 40px rgba(0,0,0,0.6);
    overflow: hidden;
  }
  .header {
    padding: 28px 20px;
    text-align: center;
    background: radial-gradient(circle at top, #2563eb 0%, transparent 60%);
  }
  .logo {
    font-size: 24px;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: -0.5px;
  }
  .logo span {
    color: #94a3b8;
  }
  .subtitle {
    font-size: 13px;
    color: #9ca3af;
    margin-top: 6px;
  }
  .content {
    padding: 28px 22px;
    font-size: 14px;
    line-height: 1.6;
  }
  .code-label {
    text-align: center;
    color: #9ca3af;
    margin-bottom: 12px;
  }
  .code-box {
    text-align: center;
    font-size: 34px;
    font-weight: 800;
    letter-spacing: 6px;
    padding: 18px;
    border-radius: 14px;
    background: #020617;
    border: 1px solid #2563eb;
    color: #60a5fa;
    margin-bottom: 18px;
  }
  .info {
    background: #020617;
    border-left: 3px solid #2563eb;
    padding: 12px 14px;
    border-radius: 8px;
    font-size: 13px;
    color: #cbd5f5;
  }
  .footer {
    padding: 16px;
    text-align: center;
    font-size: 11px;
    color: #64748b;
    border-top: 1px solid #1f2937;
  }
</style>
</head>

<body>
  <div class="container">
    <div class="header">
      <div class="logo">Quiz<span>Sprint</span></div>
      <div class="subtitle">Email Verification</div>
    </div>

    <div class="content">
      <p>Hey 👋</p>
      <p>Use the verification code below to confirm your email address:</p>

      <div class="code-label">Your verification code</div>
      <div class="code-box">${verificationCode}</div>

      <div class="info">
        ⏱ This code expires in <strong>10 minutes</strong>
      </div>

      <p style="margin-top:16px">
        If you didn’t request this, you can safely ignore this email.
      </p>

      <p style="margin-top:20px">
        Stay sharp,<br />
        <strong>QuizSprint Team</strong>
      </p>
    </div>

    <div class="footer">
      © ${new Date().getFullYear()} QuizSprint. Built for speed.
    </div>
  </div>
</body>
</html>
`;
}
