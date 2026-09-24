const fs = require("fs");
const path = require("path");
const assert = require("assert");

const english = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../msg/json/en.json"), "utf8")
);
const englishKeys = Object.keys(english);
const inputPath = path.resolve(__dirname, "../msg/scratch_msgs.js");

let locale = "";
let keys = [];

const validateKeys = () => {
  if (!keys.length) return;
  assert.strictEqual(
    keys.length,
    englishKeys.length,
    `scratch_msgs-${locale}: number of keys doesn't match`
  );
  for (const key of keys) {
    assert(
      englishKeys.includes(key),
      `scratch_msgs-${locale}: has key ${key} not in en`
    );
  }
  for (const key of englishKeys) {
    assert(keys.includes(key), `scratch_msgs-${locale}: is missing key ${key}`);
  }
};

for (const line of fs.readFileSync(inputPath, "utf8").split(/\r?\n/)) {
  const localeMatch = line.match(/locales\["(.+)"\]/);
  if (localeMatch) {
    validateKeys();
    locale = localeMatch[1];
    keys = [];
    continue;
  }
  const messageMatch = line.match(/^\s*"(.*)": ".*",?$/);
  if (messageMatch) keys.push(messageMatch[1]);
}
validateKeys();
