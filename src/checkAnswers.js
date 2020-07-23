async function checkAnswers(answers, page) {
  const ansEls = await page.$$('.QuestionItem.Correct .QuestionItem-text');
  const correnctAns = await page.$$eval(
    '.QuestionItem.Correct .QuestionItem-text',
    (correctAnswers) =>
      correctAnswers.map((answer) => {
        answer = answer.textContent || answer.querySelector('p').textContent;
        return answer.trim();
      })
  );
  console.log(correnctAns);
  correnctAns.forEach((answer) => {
    try {
      const ans = answers[answer];

      answers[answer] = {
        ...ans,
        correct: ans.current,
      };
    } catch (error) {}
  });

  console.log(`You had ${ansEls ? ansEls.length : 0} correct answers`);
  return answers;
}

exports.checkAnswers = checkAnswers;
