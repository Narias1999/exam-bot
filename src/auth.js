async function mailAuth(page, username, password) {
  await page.focus('input[name="email"]');
  await page.keyboard.type(username);
  await page.focus('input[name="password"]');
  await page.keyboard.type(password);
  await page.click('.btn-Green.btn--md');
  return Promise.race([
    page.waitForSelector('.WarningHeader').then(() => false),
    page.waitForSelector('.exam-question.Question').then(() => true),
  ]);
}

exports.mailAuth = mailAuth;
