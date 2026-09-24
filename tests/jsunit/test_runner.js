const path = require("path");
const { pathToFileURL } = require("url");
const webdriver = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const options = new chrome.Options().addArguments("--headless=new");

if (process.env.CI) {
  if (process.platform === "linux") {
    options.addArguments("--no-sandbox");
  }
}

// Parse jsunit html report, exit(1) if there are any failures.
const testHtml = function (htmlString) {
  const regex = /[\d]+\spassed,\s([\d]+)\sfailed./i;
  const numOfFailures = Number.parseInt(regex.exec(htmlString)[1], 10);
  const regex2 = /Unit Tests for .*]/;
  const testStatus = regex2.exec(htmlString)[0];
  console.log("============Unit Test Summary=================");
  console.log(testStatus);
  const regex3 = /\d+ passed,\s\d+ failed/;
  const detail = regex3.exec(htmlString)[0];
  console.log(detail);
  console.log("============Unit Test Summary=================");
  if (numOfFailures !== 0) throw new Error(htmlString);
};

const runTests = async function () {
  const browser = await new webdriver.Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();
  try {
    const url = pathToFileURL(
      path.resolve(__dirname, "vertical_tests.html")
    ).href;
    await browser.get(url);
    const element = await browser.wait(
      webdriver.until.elementLocated({ id: "closureTestRunnerLog" }),
      30000
    );
    await browser.wait(
      async () => /\d+ passed,\s\d+ failed/.test(await element.getText()),
      30000
    );
    testHtml(await browser.executeScript("return G_testRunner.getReport();"));
  } finally {
    await browser.quit();
  }
};

runTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
