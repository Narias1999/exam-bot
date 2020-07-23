async function getQuestion(page) {
  const element = await page.$('.exam-question.Question');
  const question = await page.evaluate((element) => {
    const text = element.textContent || element.querySelector('p').textContent;
    return text.trim();
  }, element);
  return question.trim();
}

async function getOptions(page) {
  const elOptions = await page.$$('.Answer-content');
  const options = await page.$$eval('.Answer-content', (options) =>
    options.map((option) => {
      const text = option.textContent || options.querySelector('p').textContent;
      return text.trim();
    })
  );
  return { elOptions, options };
}

exports.getQuestion = getQuestion;
exports.getOptions = getOptions;
