const puppeteer = require('puppeteer');
const { getOptions, getQuestion } = require('./src/utils');
const { mailAuth } = require('./src/auth');
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

const preparedData = {};

async function crackTheCode(courseURL) {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.goto(courseURL);
  await page.waitForSelector('.pptr-sidebar-item');
  console.log('hey');
  const elements = await page.$$('.pptr-sidebar-item');
  await page.click('menu-button');
  await sleep(1000);
  elements[4].click();
  console.log(elements.length);
}

const courseURL =
  'https://pptr.dev/#?product=Puppeteer&version=v5.0.0&show=api-pageselector';

crackTheCode(courseURL);
