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

goog.provide('Blockly.Blocks.comments');

goog.require('Blockly.Blocks');
goog.require('Blockly.Colours');
goog.require('Blockly.constants');
goog.require('Blockly.ScratchBlocks.VerticalExtensions');


Blockly.Blocks['comments_hat'] = {
  /**
   * Comment Hat
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.COMMENTS_DEFAULT,
      "args0": [
        {
          "type": "input_value",
          "name": "COMMENT"
        }
      ],
      "category": Blockly.Categories.comments,
      "extensions": ["colours_comments", "shape_hat"]
    });
  }
};

Blockly.Blocks['comments_command'] = {
  /**
   * Comment Command
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.COMMENTS_DEFAULT,
      "args0": [
        {
          "type": "input_value",
          "name": "COMMENT"
        }
      ],
      "category": Blockly.Categories.comments,
      "extensions": ["colours_comments", "shape_statement"]
    });
  }
};

Blockly.Blocks['comments_loop'] = {
  /**
   * Comment Loop
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.COMMENTS_DEFAULT,
      "message1": "%1",
      "args0": [
        {
          "type": "input_value",
          "name": "COMMENT"
        }
      ],
      "args1": [
        {
          "type": "input_statement",
          "name": "SUBSTACK"
        }
      ],
      "category": Blockly.Categories.comments,
      "extensions": ["colours_comments", "shape_statement"]
    });
  }
};

Blockly.Blocks['comments_reporter'] = {
  /**
   * Comment Reporter
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.COMMENTS_ALTERNATE,
      "args0": [
        {
          "type": "input_value",
          "name": "VALUE"
        },
        {
          "type": "input_value",
          "name": "COMMENT"
        }
      ],
      "category": Blockly.Categories.comments,
      "extensions": ["colours_comments", "output_number"]
    });
  }
};

Blockly.Blocks['comments_boolean'] = {
  /**
   * Comment Boolean
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.COMMENTS_ALTERNATE,
      "args0": [
        {
          "type": "input_value",
          "name": "VALUE",
          "check": "Boolean"
        },
        {
          "type": "input_value",
          "name": "COMMENT"
        }
      ],
      "category": Blockly.Categories.comments,
      "extensions": ["colours_comments", "output_boolean"]
    });
  }
};

Blockly.Blocks['comments_object'] = {
  /**
   * Comment Object
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.COMMENTS_ALTERNATE,
      "args0": [
        {
          "type": "input_value",
          "name": "VALUE",
          "check": "Object"
        },
        {
          "type": "input_value",
          "name": "COMMENT"
        }
      ],
      "category": Blockly.Categories.comments,
      "extensions": ["colours_comments", "output_object"]
    });
  }
};

Blockly.Blocks['comments_array'] = {
  /**
   * Comment Array
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.COMMENTS_ALTERNATE,
      "args0": [
        {
          "type": "input_value",
          "name": "VALUE",
          "check": "Array"
        },
        {
          "type": "input_value",
          "name": "COMMENT"
        }
      ],
      "category": Blockly.Categories.comments,
      "extensions": ["colours_comments", "output_array"]
    });
  }
};
