/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2016 Massachusetts Institute of Technology
 * All rights reserved.
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

'use strict';

goog.provide('Blockly.Blocks.assets');

goog.require('Blockly.Blocks');
goog.require('Blockly.Colours');
goog.require('Blockly.constants');
goog.require('Blockly.ScratchBlocks.VerticalExtensions');


Blockly.Blocks['assets_menu'] = {
  /**
   * Assets drop-down menu.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "ASSET_MENU",
          "options": [
            ['horse.jpeg', 'horse.jpeg'],
            ["jeffery's files.pdf", "jeffery's files.pdf"],
            ['monkey.glb', 'monkey.glb']
          ]
        }
      ],
      "colour": Blockly.Colours.assets.secondary,
      "colourSecondary": Blockly.Colours.assets.secondary,
      "colourTertiary": Blockly.Colours.assets.tertiary,
      "colourQuaternary": Blockly.Colours.assets.quaternary,
      "extensions": ["output_string"]
    });
  }
};

Blockly.Blocks['assets_test'] = {
  /**
   * Test block to report the data of an asset
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.ASSETS_TEST,
      "args0": [
        {
          "type": "input_value",
          "name": "ASSET_MENU"
        }
      ],
      "category": Blockly.Categories.assets,
      "extensions": ["colours_assets", "output_string"]
    });
  }
};