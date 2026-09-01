/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
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

/**
 * @fileoverview Registry for block output or input shapes.
 * @author Nitro-Bolt
 */
"use strict";

goog.provide("Blockly.BlockShapes");

/**
 * Registry of shape definitions.
 * @type {!Object.<(number|string), Object>}
 * @private
 */
Blockly.BlockShapes.shapes_ = {};

/**
 * Register a shape definition under a name or a numeric enum.
 * @param {(number|string)} name The shape ID or built-in enum.
 * @param {!Object} definition The shape definition.
 */
Blockly.BlockShapes.register = function (name, definition) {
  Blockly.BlockShapes.shapes_[name] = definition;
};

/**
 * Look up a shape definition by name or numeric enum.
 * @param {(number|string)} name The shape ID or built-in enum.
 * @return {?Object} The shape definition, or null if unknown.
 */
Blockly.BlockShapes.get = function (name) {
  return Blockly.BlockShapes.shapes_[name] || null;
};

/**
 * Check whether a shape definition is registered.
 * @param {(number|string)} name The shape ID or built-in enum.
 * @return {boolean} True if registered.
 */
Blockly.BlockShapes.has = function (name) {
  return Blockly.BlockShapes.shapes_.hasOwnProperty(name);
};

/**
 * Resolve a shape value to its definition.
 * @param {(number|string|undefined|null)} shape The shape value.
 * @return {?Object} The shape definition, or null if unknown.
 */
Blockly.BlockShapes.resolve = function (shape) {
  if (shape === null || typeof shape === "undefined") {
    return null;
  }
  return Blockly.BlockShapes.get(shape) || null;
};
