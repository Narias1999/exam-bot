const puppeteer = require('puppeteer');
const fs = require('fs');

const { mailAuth } = require('./src/auth');
const { getOptions, getQuestion } = require('./src/utils');
const { checkAnswers } = require('./src/checkAnswers');
const sleep = (time) =>
  new Promise((resolve) => setTimeout(() => resolve('awake'), time));

/**
 * Answers data structure
 "question text": {
    "correct": "",
    "selected": {
      "option text": 0 // index
    }
  }
 */

function getPreviousData(path) {
  try {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch (error) {
    console.log('seems like is the first time you are doing this exam :)');
    return {};
  }
}

async function crackTheCode(courseURL) {
  const courseId = courseURL.split('/')[5];
  const dataPath = `./${courseId}.json`;
  const preparedData = getPreviousData(dataPath);
  console.log(preparedData);
  const browser = await puppeteer.launch({
    headless: false,
  });

  const page = await browser.newPage();
  await page.goto(courseURL);
  const inQuetions = await mailAuth(
    page,
    'mail',
    'pass'
  );
  if (!inQuetions) {
    await page.click('.Buttons-btn.btn.btn-green');
  }

  while (true) {
    const res = await Promise.race([
      page.waitForSelector('.exam-question.Question', {
        visible: true,
      }),
      sleep(15000),
    ]);

    if (res === 'awake') break;

    const question = await getQuestion(page);
    console.log(`Question: `, question);
    const { options, elOptions } = await getOptions(page);
    console.log('Options:', options);
    let index = 0;

    const q = preparedData[question];
    if (q) {
      if (q.hasOwnProperty('correct')) {
        await elOptions[q.correct].click();
        console.log('Option already correct: ', options[q.correct]);
        await page.click('.btn-Sky.questionNext');
        await sleep(3000);
        continue;
      }

      index = q.current + 1;
    }

    console.log('selected option', options[index]);

    if (q) {
      preparedData[question] = {
        selected: {
          ...preparedData[question].selected,
          [options[index]]: index,
        },
        current: index,
      };
    } else {
      preparedData[question] = {
        selected: {
          [options[index]]: index,
        },
        current: index,
      };
    }
    await elOptions[index].click();
    await page.click('.btn-Sky.questionNext');
    await sleep(3000);
  }

  console.log('now we have to find out what answers are correct');
  const answerData = await checkAnswers(preparedData, page);

  fs.writeFileSync(dataPath, JSON.stringify(answerData, null, 2));
  console.log('seems like everything ends up well!');
  await sleep(3000);
}

const courseURL =
  'https://platzi.com/clases/examen/694c36c6-6e2b-4317-a33d-cd9d5290e2d6/examen_usuario/';

crackTheCode(courseURL);
