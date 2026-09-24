const fs = require("fs");
const path = require("path");
const assert = require("assert");

const storage = {};
const inputPath = path.resolve(__dirname, "../msg/messages.js");
const outputPath = path.resolve(__dirname, "../msg/json/en.json");

const matchesMessage = (line) => {
  if (!line.startsWith("Blockly.Msg.")) return false;
  assert.notStrictEqual(
    line.indexOf('";'),
    line.length - 2,
    `[${line}] uses double quoted string, should use single quotes.`
  );
  return line.endsWith("';");
};

const extractMessage = (line) => {
  const parts = line.slice("Blockly.Msg.".length).split(" ");
  return {
    key: parts[0],
    value: parts.slice(2).join(" ").slice(1, -2).replace(/\\'/g, "'"),
  };
};

for (const line of fs.readFileSync(inputPath, "utf8").split(/\r?\n/)) {
  if (!matchesMessage(line)) continue;
  const message = extractMessage(line);
  storage[message.key] = message.value;
}

fs.writeFileSync(outputPath, JSON.stringify(storage, null, 4));
