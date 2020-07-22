const puppeteer = require('puppeteer');
const { promisify } = require('util');

/**
 * Answers data structure
 {
  "question text": {
    "correct": "",
    "selected": [""]
  }
}
 */

const { mailAuth } = require('./src/auth');
const sleep = promisify(setTimeout);

async function crackTheCode(courseURL) {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.goto(courseURL);
  await mailAuth(page, 'nicolasarias870@gmail.com', '');
}

const courseURL =
  'https://platzi.com/clases/examen/3747eca6-c6f9-42e2-a552-1cdceb383c76/examen_usuario/';

crackTheCode(courseURL);
