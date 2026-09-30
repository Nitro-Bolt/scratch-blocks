const fs = require("fs");
const path = require("path");
const glob = require("glob");

// Globals
const PATH_INPUT = path.resolve(__dirname, "../msg/json/en.json");
// If you want to generate js files for other languages, comment out the line above,
// and use the one below instead.
// const PATH_INPUT = path.resolve(__dirname, '../msg/json/*.json');
const PATH_OUTPUT = path.resolve(__dirname, "../msg/js");

// Processing task
const work = function (uri) {
  let body = fs.readFileSync(uri);
  const name = path.parse(uri).name;

  // Convert file body into an object (let this throw if invalid JSON)
  body = JSON.parse(body);

  // File storage object and preamble
  let file = "";
  file += "// This file was automatically generated.  Do not modify.\n";
  file += "\n";
  file += "'use strict';\n";
  file += "\n";
  file += `goog.provide(\'Blockly.Msg.${name}\');\n`;
  file += "goog.require('Blockly.Msg');\n";
  file += "\n";

  // Iterate over object and build up file
  for (const i in body) {
    file += `Blockly.Msg["${i}"] = "${body[i].replace(/"/g, '\\"')}";\n`;
  }

  // Write file to disk
  fs.writeFileSync(`${PATH_OUTPUT}/${name}.js`, file);
};

// Get all JSON files in input directory and convert them.
glob.sync(PATH_INPUT).forEach(work);
