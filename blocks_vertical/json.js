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

goog.provide('Blockly.Blocks.json');

goog.require('Blockly.Blocks');
goog.require('Blockly.Colours');
goog.require('Blockly.constants');
goog.require('Blockly.ScratchBlocks.VerticalExtensions');


Blockly.Blocks['json_new_object'] = {
  /**
   * Returns a new Object
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.JSON_NEW_OBJECT,
      "category": Blockly.Categories.json,
      "extensions": ["colours_json", "output_object"]
    });
  }
};

Blockly.Blocks['json_to_object'] = {
  /**
   * Converts a string to an Object
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.JSON_TO_OBJECT,
      "args0": [
        {
          "type": "input_value",
          "name": "STR"
        },
      ],
      "category": Blockly.Categories.json,
      "extensions": ["colours_json", "output_object"]
    });
  }
};

Blockly.Blocks['json_to_string'] = {
  /**
   * Converts an Object to a string
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.JSON_TO_STRING,
      "args0": [
        {
          "type": "input_value",
          "name": "OBJ",
          "check": "Object"
        },
      ],
      "category": Blockly.Categories.json,
      "extensions": ["colours_json", "output_number"]
    });
  }
};

Blockly.Blocks['json_keys'] = {
  /**
   * Fetches the keys of the object
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.JSON_KEYS,
      "args0": [
        {
          "type": "input_value",
          "name": "OBJ",
          "check": "Object"
        },
      ],
      "category": Blockly.Categories.json,
      "extensions": ["colours_json", "output_array"]
    });
  }
};

Blockly.Blocks['json_values'] = {
  /**
   * Fetches the values of the object
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.JSON_VALUES,
      "args0": [
        {
          "type": "input_value",
          "name": "OBJ",
          "check": "Object"
        },
      ],
      "category": Blockly.Categories.json,
      "extensions": ["colours_json", "output_array"]
    });
  }
};

Blockly.Blocks['json_value_of_key'] = {
  /**
   * Fetches the value of the target key
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.JSON_VALUE_OF_KEY,
      "args0": [
        {
          "type": "input_value",
          "name": "KEY"
        },
        {
          "type": "input_value",
          "name": "OBJ",
          "check": "Object"
        }
      ],
      "category": Blockly.Categories.json,
      "extensions": ["colours_json", "output_number"]
    });
  }
};

Blockly.Blocks['json_set_key'] = {
  /**
   * Sets the value of the target key
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.JSON_SET_KEY,
      "args0": [
        {
          "type": "input_value",
          "name": "KEY"
        },
        {
          "type": "input_value",
          "name": "OBJ",
          "check": "Object"
        },
        {
          "type": "input_value",
          "name": "VALUE"
        }
      ],
      "category": Blockly.Categories.json,
      "extensions": ["colours_json", "output_object"]
    });
  }
};

Blockly.Blocks['json_delete_key'] = {
  /**
   * Deletes the target key
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.JSON_DELETE_KEY,
      "args0": [
        {
          "type": "input_value",
          "name": "KEY"
        },
        {
          "type": "input_value",
          "name": "OBJ",
          "check": "Object"
        }
      ],
      "category": Blockly.Categories.json,
      "extensions": ["colours_json", "output_object"]
    });
  }
};

Blockly.Blocks['json_join_object'] = {
  /**
   * Merges two Objects
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_JOIN,
      "args0": [
        {
          "type": "input_value",
          "name": "OBJ1",
          "check": "Object"
        },
        {
          "type": "input_value",
          "name": "OBJ2",
          "check": "Object"
        }
      ],
      "category": Blockly.Categories.json,
      "extensions": ["colours_json", "output_object"]
    });
  }
};

Blockly.Blocks['json_has_key'] = {
  /**
   * Checks if object has target key
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.JSON_HAS_KEY,
      "args0": [
        {
          "type": "input_value",
          "name": "OBJ",
          "check": "Object"
        },
        {
          "type": "input_value",
          "name": "KEY"
        }
      ],
      "category": Blockly.Categories.json,
      "extensions": ["colours_json", "output_boolean"]
    });
  }
};

Blockly.Blocks['json_new_array'] = {
  /**
   * Returns a new Array
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.JSON_NEW_ARRAY,
      "category": Blockly.Categories.json,
      "extensions": ["colours_json", "output_array"]
    });
  }
};

Blockly.Blocks['json_to_array'] = {
  /**
   * Converts a string to an Array
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.JSON_TO_ARRAY,
      "args0": [
        {
          "type": "input_value",
          "name": "STR"
        },
      ],
      "category": Blockly.Categories.json,
      "extensions": ["colours_json", "output_array"]
    });
  }
};

Blockly.Blocks['json_value_of_index'] = {
  /**
   * Fetches the value of the given index
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.JSON_VALUE_OF_INDEX,
      "args0": [
        {
          "type": "input_value",
          "name": "INDEX"
        },
        {
          "type": "input_value",
          "name": "ARR",
          "check": "Array"
        }
      ],
      "category": Blockly.Categories.json,
      "extensions": ["colours_json", "output_number"]
    });
  }
};

Blockly.Blocks['json_index_of_value'] = {
  /**
   * Fetches the index of the given value
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.JSON_INDEX_OF_VALUE,
      "args0": [
        {
          "type": "input_value",
          "name": "VALUE"
        },
        {
          "type": "input_value",
          "name": "ARR",
          "check": "Array"
        }
      ],
      "category": Blockly.Categories.json,
      "extensions": ["colours_json", "output_number"]
    });
  }
};

Blockly.Blocks['json_add_item'] = {
  /**
   * Adds a new item to the Array
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.JSON_ADD_ITEM,
      "args0": [
        {
          "type": "input_value",
          "name": "ITEM"
        },
        {
          "type": "input_value",
          "name": "ARR",
          "check": "Array"
        }
      ],
      "category": Blockly.Categories.json,
      "extensions": ["colours_json", "output_array"]
    });
  }
};

Blockly.Blocks['json_replace_index'] = {
  /**
   * Replaces an item indexed with another item in an Array
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.JSON_REPLACE_INDEX,
      "args0": [
        {
          "type": "input_value",
          "name": "INDEX"
        },
        {
          "type": "input_value",
          "name": "ARR",
          "check": "Array"
        },
        {
          "type": "input_value",
          "name": "ITEM"
        }
      ],
      "category": Blockly.Categories.json,
      "extensions": ["colours_json", "output_array"]
    });
  }
};

Blockly.Blocks['json_delete_index'] = {
  /**
   * Deletes the value of the given index
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.JSON_DELETE_INDEX,
      "args0": [
        {
          "type": "input_value",
          "name": "INDEX"
        },
        {
          "type": "input_value",
          "name": "ARR",
          "check": "Array"
        }
      ],
      "category": Blockly.Categories.json,
      "extensions": ["colours_json", "output_array"]
    });
  }
};

Blockly.Blocks['json_delete_all_occurrences'] = {
  /**
   * Deletes all occurrences of a item from the Array
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.JSON_DELETE_ALL_OCCURRENCES,
      "args0": [
        {
          "type": "input_value",
          "name": "ITEM"
        },
        {
          "type": "input_value",
          "name": "ARR",
          "check": "Array"
        }
      ],
      "category": Blockly.Categories.json,
      "extensions": ["colours_json", "output_array"]
    });
  }
};

Blockly.Blocks['json_join_array'] = {
  /**
   * Merges two Arrays
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.OPERATORS_JOIN,
      "args0": [
        {
          "type": "input_value",
          "name": "ARR1",
          "check": "Array"
        },
        {
          "type": "input_value",
          "name": "ARR2",
          "check": "Array"
        }
      ],
      "category": Blockly.Categories.json,
      "extensions": ["colours_json", "output_array"]
    });
  }
};

Blockly.Blocks['json_has_item'] = {
  /**
   * Checks if Array has target item
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.JSON_HAS_ITEM,
      "args0": [
        {
          "type": "input_value",
          "name": "ARR",
          "check": "Array"
        },
        {
          "type": "input_value",
          "name": "ITEM"
        }
      ],
      "category": Blockly.Categories.json,
      "extensions": ["colours_json", "output_boolean"]
    });
  }
};
