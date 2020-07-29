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
    console.log(question);
    const { options, elOptions } = await getOptions(page);
    console.log(options);
    let index = 0;

    const q = preparedData[question];
    if (q) {
      if (q.hasOwnProperty('correct')) {
        await elOptions[q.correct].click();
        await page.click('.btn-Sky.questionNext');
        await sleep(3000);
        continue;
      }

      index = q.current + 1;
    }

    console.log('index to select', index, options[index]);

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
    console.log(preparedData);
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
  'https://platzi.com/clases/examen/0f4df2bb-eea0-4ba4-83d2-a5aa3f0d5d27/examen_usuario/';

crackTheCode(courseURL);
