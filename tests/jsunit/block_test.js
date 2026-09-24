/**
 * @license
 * Blockly Tests
 *
 * Copyright 2016 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
"use strict";

function test_jsonInit_colors() {
  const workspace = new Blockly.Workspace();
  const block_name = "test_jsonInit_FieldDropdown_colors";
  const field_name = "TEST_FIELD";
  const dropdown_options = [["value", "VALUE"]];

  Blockly.Blocks[block_name] = {
    init: function () {
      this.jsonInit({
        message0: "%1",
        args0: [
          {
            type: "field_dropdown",
            name: field_name,
            options: dropdown_options,
          },
        ],
        output: null,
        colour: "#111111",
        colourSecondary: "#222222",
        colourTertiary: "#333333",
        colourQuaternary: "#444444",
      });
    },
  };

  const block = workspace.newBlock(block_name);
  const field = block.getField(field_name);

  assertEquals("Block primary colour not set", block.getColour(), "#111111");
  assertEquals(
    "Block secondary colour not set",
    block.getColourSecondary(),
    "#222222"
  );
  assertEquals(
    "Block tertiary colour not set",
    block.getColourTertiary(),
    "#333333"
  );
  assertEquals(
    "Block quaternary colour not set",
    block.getColourQuaternary(),
    "#444444"
  );

  assertEquals("Source block is not correct", field.sourceBlock_, block);
}
