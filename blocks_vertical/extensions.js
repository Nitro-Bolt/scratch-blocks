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

goog.provide('Blockly.Blocks.extensions');

goog.require('Blockly.Blocks');
goog.require('Blockly.Colours');
goog.require('Blockly.constants');
goog.require('Blockly.ScratchBlocks.VerticalExtensions');

Blockly.Blocks['extension_extendable_test'] = {
  /**
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "extendable test %1 more text",
      "args0": [
        {
          "type": "extendable",
          "name": "EXTENDABLE",
          "args": [
            {
              "type": "field_image",
              "src": Blockly.mainWorkspace.options.pathToMedia + "extensions/pen-block-icon.svg",
              "width": 40,
              "height": 40
            },
            {
              "type": "input_value",
              "name": "INPUT",
              "shadowOpcode": "text",
              "shadowFieldName": "TEXT",
              "shadowFieldValue": "apple"
            },
          ],
          "separator": ["sep text"],
          "minInputs": 0,
          "maxInputs": 10,
        },
      ],
      "category": Blockly.Categories.more,
      "extensions": ["colours_more", "shape_statement"]
    });
  }
};

Blockly.Blocks['extension_extendable_broken_test'] = {
  /**
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "extendable broken test %1",
      "args0": [
        {
          "type": "extendable",
          "name": "CASES",
          "args": [
            "case",
            {
              "type": "extendable",
              "name": "CASE_VALUES",
              "args": [
                {
                  "type": "input_value",
                  "name": "CONDITION",
                  "shadowOpcode": "text",
                  "shadowFieldName": "TEXT",
                  "shadowFieldValue": "apple"
                },
              ],
              "minInputs": 1,
              "defaultInputs": 1
            },
            {
              "type": "input_statement",
              "name": "SUBSTACK",
            },
          ],
        },
      ],
      "category": Blockly.Categories.more,
      "extensions": ["colours_more", "shape_statement"]
    });
  }
};

Blockly.Blocks['extension_nested_extendable_test'] = {
  /**
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "nested extendable test: %1 asd",
      "args0": [
        {
          "type": "extendable",
          "name": "EXTENDABLE",
          "args": [
            {
              "type": "extendable",
              "name": "EXTENDABLE",
              "args": [
                {
                  "type": "field_image",
                  "src": Blockly.mainWorkspace.options.pathToMedia + "extensions/pen-block-icon.svg",
                  "width": 40,
                  "height": 40
                },
              ],
              "separator": [""],
              "minInputs": 0,
              "maxInputs": 100,
            },
          ],
          "separator": ["|"],
          "collapser": "EMPTY",
          "minInputs": 0,
          "maxInputs": 100,
        },
      ],
      "category": Blockly.Categories.more,
      "extensions": ["colours_more", "shape_statement"]
    });
  }
};

Blockly.Blocks['extension_nested_extendable_inputs_test'] = {
  /**
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "nested extendable with inputs %1 asd",
      "args0": [
        {
          "type": "extendable",
          "name": "EXTENDABLE",
          "args": [
            {
              "type": "extendable",
              "name": "EXTENDABLE",
              "args": [
                {
                  "type": "input_value",
                  "name": "INPUT",
                },
              ],
              "separator": [""],
              "minInputs": 0,
              "maxInputs": 100,
            },
          ],
          "separator": ["|"],
          "minInputs": 0,
          "maxInputs": 100,
        },
      ],
      "category": Blockly.Categories.more,
      "extensions": ["colours_more", "shape_statement"]
    });
  }
};

Blockly.Blocks['extension_recursive_extendable_test'] = {
  /**
   * @this Blockly.Block
   */
  init: function() {
    var extendable = {
      "type": "extendable",
      "name": "EXTENDABLE",
      "args": [],
      "separator": ["|"],
    };
    extendable.args = [extendable];
    this.jsonInit({
      "message0": "recursive extendable!? %1",
      "args0": [
        extendable
      ],
      "category": Blockly.Categories.more,
      "extensions": ["colours_more", "shape_statement"]
    });
  }
};

Blockly.Blocks['extension_extendable_if_test'] = {
  /**
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1",
      "args0": [
        {
          "type": "extendable",
          "name": "SUBSTACKS",
          "args": [
            "if",
            {
              "type": "input_value",
              "name": "CONDITION",
              "check": "Boolean"
            },
            "then",
            {
              "type": "input_statement",
              "name": "SUBSTACK",
            },
          ],
          "separator": "else",
          "minInputs": 1,
        }
      ],
      "category": Blockly.Categories.more,
      "extensions": ["colours_more", "shape_statement"]
    });
  }
};

Blockly.Blocks['extension_extendable_switch_test'] = {
  /**
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "switch %1 %2 %3",
      "args0": [
        {
          "type": "input_value",
          "name": "VALUE"
        },
        {
          "type": "extendable",
          "name": "CASES",
          "args": [
            "case",
            {
              "type": "extendable",
              "name": "CASE_VALUES",
              "args": [
                {
                  "type": "input_value",
                  "name": "CONDITION",
                  "shadowOpcode": "text",
                  "shadowFieldName": "TEXT",
                  "shadowFieldValue": "apple"
                },
              ],
              "minInputs": 1,
              "defaultInputs": 1
            },
            {
              "type": "input_statement",
              "name": "SUBSTACK",
            },
            {
              "type": "extendable",
              "name": "CONTINUE_TO",
              "args": [
                "continue to"
              ],
              "minInputs": 0,
              "maxInputs": 1,
              "defaultInputs": 0
            },
          ],
          "minInputs": 0,
          "defaultInputs": 1
        },
        {
          "type": "extendable",
          "name": "DEFAULT_CASE",
          "args": [
            "default",
            {
              "type": "input_statement",
              "name": "SUBSTACK",
            },
          ],
          "minInputs": 0,
          "maxInputs": 1,
          "defaultInputs": 1
        }
      ],
      "category": Blockly.Categories.more,
      "extensions": ["colours_more", "shape_statement"]
    });
  }
};

Blockly.Blocks['extension_extendable_reporter_test'] = {
  /**
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "hot dog %1",
      "args0": [
        {
          "type": "extendable",
          "name": "EXTENDABLE",
          "args": [
            {
              "type": "field_image",
              "src": Blockly.mainWorkspace.options.pathToMedia + "extensions/pen-block-icon.svg",
              "width": 40,
              "height": 40
            },
            {
              "type": "input_value",
              "name": "INPUT",
              "shadowOpcode": "text",
              "shadowFieldName": "TEXT",
              "shadowFieldValue": "apple"
            },
          ],
          "separator": ["sep text"],
          "minInputs": 0,
          "maxInputs": 10,
        },
      ],
      "category": Blockly.Categories.more,
      "extensions": ["colours_more", "output_string"]
    });
  }
};

Blockly.Blocks['extension_checkbox_test'] = {
  /**
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "checkbox test %1",
      "args0": [
        {
          "name": "CHECKBOX",
          "type": "input_value",
          "check": "Boolean"
        }
      ],
      "category": Blockly.Categories.more,
      "extensions": ["colours_more", "shape_statement"]
    });
  }
};

Blockly.Blocks['extension_checkbox_test_legacy'] = {
  /**
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "checkbox test %1 (legacy)",
      "args0": [
        {
          "name": "CHECKBOX",
          "type": "input_value",
          "check": "Boolean"
        }
      ],
      "category": Blockly.Categories.more,
      "extensions": ["colours_more", "shape_statement"]
    });
  }
};

Blockly.Blocks['extension_checkbox_test_legacy_json'] = {
  /**
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "(legacy jsonInit) %1 FALSE",
      "args0": [
        {
          "name": "CHECKBOX",
          "type": "field_checkbox",
          "checked": "FALSE",
          "check": "Boolean"
        }
      ],
      "category": Blockly.Categories.more,
      "extensions": ["colours_more", "output_boolean"]
    });
  }
};

Blockly.Blocks['extension_checkbox_test_legacy_json2'] = {
  /**
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "(legacy jsonInit) %1 TRUE",
      "args0": [
        {
          "name": "CHECKBOX",
          "type": "field_checkbox",
          "checked": "TRUE",
          "check": "Boolean"
        }
      ],
      "category": Blockly.Categories.more,
      "extensions": ["colours_more", "output_boolean"]
    });
  }
};


Blockly.Blocks['extension_pen_down'] = {
  /**
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1 %2 pen down",
      "args0": [
        {
          "type": "field_image",
          "src": Blockly.mainWorkspace.options.pathToMedia + "extensions/pen-block-icon.svg",
          "width": 40,
          "height": 40
        },
        {
          "type": "field_vertical_separator"
        }
      ],
      "category": Blockly.Categories.more,
      "extensions": ["colours_more", "shape_statement", "scratch_extension"]
    });
  }
};

Blockly.Blocks['extension_music_drum'] = {
  /**
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1 %2 play drum %3",
      "args0": [
        {
          "type": "field_image",
          "src": Blockly.mainWorkspace.options.pathToMedia + "extensions/music-block-icon.svg",
          "width": 40,
          "height": 40
        },
        {
          "type": "field_vertical_separator"
        },
        {
          "type": "input_value",
          "name": "NUMBER"
        }
      ],
      "category": Blockly.Categories.more,
      "extensions": ["colours_more", "shape_statement", "scratch_extension"]
    });
  }
};

Blockly.Blocks['extension_wedo_motor'] = {
  /**
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1 %2 turn a motor %3",
      "args0": [
        {
          "type": "field_image",
          "src": Blockly.mainWorkspace.options.pathToMedia + "extensions/wedo2-block-icon.svg",
          "width": 40,
          "height": 40
        },
        {
          "type": "field_vertical_separator"
        },
        {
          "type": "field_image",
          "src": Blockly.mainWorkspace.options.pathToMedia + "rotate-right.svg",
          "width": 24,
          "height": 24
        }
      ],
      "category": Blockly.Categories.more,
      "extensions": ["colours_more", "shape_statement", "scratch_extension"]
    });
  }
};

Blockly.Blocks['extension_wedo_hat'] = {
  /**
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1 %2 when I am wearing a hat",
      "args0": [
        {
          "type": "field_image",
          "src": Blockly.mainWorkspace.options.pathToMedia + "extensions/wedo2-block-icon.svg",
          "width": 40,
          "height": 40
        },
        {
          "type": "field_vertical_separator"
        }
      ],
      "category": Blockly.Categories.more,
      "extensions": ["colours_more", "shape_hat", "scratch_extension"]
    });
  }
};

Blockly.Blocks['extension_wedo_boolean'] = {
  /**
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1 %2 O RLY?",
      "args0": [
        {
          "type": "field_image",
          "src": Blockly.mainWorkspace.options.pathToMedia + "extensions/wedo2-block-icon.svg",
          "width": 40,
          "height": 40
        },
        {
          "type": "field_vertical_separator"
        }
      ],
      "category": Blockly.Categories.more,
      "extensions": ["colours_more", "output_boolean", "scratch_extension"]
    });
  }
};

Blockly.Blocks['extension_wedo_tilt_reporter'] = {
  /**
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1 %2 tilt angle %3",
      "args0": [
        {
          "type": "field_image",
          "src": Blockly.mainWorkspace.options.pathToMedia + "extensions/wedo2-block-icon.svg",
          "width": 40,
          "height": 40
        },
        {
          "type": "field_vertical_separator"
        },
        {
          "type": "input_value",
          "name": "TILT"
        }
      ],
      "category": Blockly.Categories.more,
      "extensions": ["colours_more", "output_number", "scratch_extension"]
    });
  }
};

Blockly.Blocks['extension_wedo_tilt_menu'] = {
  /**
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "TILT",
          "options": [
            ['Any', 'Any'],
            ['Whirl', 'Whirl'],
            ['South', 'South'],
            ['Back in time', 'Back in time']
          ]
        }
      ],
      "extensions": ["colours_more", "output_string"]
    });
  }
};

Blockly.Blocks['extension_music_reporter'] = {
  /**
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1 %2 hey now, you're an all-star",
      "args0": [
        {
          "type": "field_image",
          "src": Blockly.mainWorkspace.options.pathToMedia + "extensions/music-block-icon.svg",
          "width": 40,
          "height": 40
        },
        {
          "type": "field_vertical_separator"
        }
      ],
      "category": Blockly.Categories.more,
      "extensions": ["colours_more", "output_number", "scratch_extension"]
    });
  }
};

Blockly.Blocks['extension_microbit_display'] = {
  /**
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1 %2 display %3",
      "args0": [
        {
          "type": "field_image",
          "src": Blockly.mainWorkspace.options.pathToMedia + "extensions/microbit-block-icon.svg",
          "width": 40,
          "height": 40
        },
        {
          "type": "field_vertical_separator"
        },
        {
          "type": "input_value",
          "name": "MATRIX"
        },
      ],
      "category": Blockly.Categories.pen,
      "extensions": ["colours_pen", "shape_statement", "scratch_extension"]
    });
  }
};

Blockly.Blocks['extension_music_play_note'] = {
  /**
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1 %2 play note %3 for %4 beats",
      "args0": [
        {
          "type": "field_image",
          "src": Blockly.mainWorkspace.options.pathToMedia + "extensions/music-block-icon.svg",
          "width": 40,
          "height": 40
        },
        {
          "type": "field_vertical_separator"
        },
        {
          "type": "input_value",
          "name": "NOTE"
        },
        {
          "type": "input_value",
          "name": "BEATS"
        }
      ],
      "category": Blockly.Categories.pen,
      "extensions": ["colours_pen", "shape_statement", "scratch_extension"]
    });
  }
};
