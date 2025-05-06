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
 * @fileoverview Checkbox field.  Checked or not checked.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.FieldCheckbox');

goog.require('Blockly.Field');


/**
 * Class for a checkbox field.
 * @param {string} state The initial state of the field ('TRUE' or 'FALSE').
 * @param {Function=} opt_validator A function that is executed when a new
 *     option is selected.  Its sole argument is the new checkbox state.  If
 *     it returns a value, this becomes the new checkbox state, unless the
 *     value is null, in which case the change is aborted.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldCheckbox = function(state, opt_validator) {
  Blockly.FieldCheckbox.superClass_.constructor.call(this, '', opt_validator);
  // Set the initial state.
  this.setValue(state);
  this.addArgType('checkbox');
};
goog.inherits(Blockly.FieldCheckbox, Blockly.Field);

/**
 * Construct a FieldCheckbox from a JSON arg object.
 * @param {!Object} options A JSON object with options (checked).
 * @returns {!Blockly.FieldCheckbox} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldCheckbox.fromJson = function(options) {
  return new Blockly.FieldCheckbox(options['checked'] ? 'TRUE' : 'FALSE');
};

/**
 * Character for the checkmark.
 */
Blockly.FieldCheckbox.CHECK_CHAR = '\u2713';

Blockly.FieldCheckbox.SYMBOL_FALSE = 'M -2.5 -4.5 A 1 1 0 0 0 -4.5 -2.5 L -2 0 L -4.5 2.5 A 1 1 0 0 0 -2.5 4.5 L 0 2 L 2.5 4.5 A 1 1 0 0 0 4.5 2.5 L 2 0 L 4.5 -2.5 A 1 1 0 0 0 2.5 -4.5 L 0 -2 Z'

Blockly.FieldCheckbox.SYMBOL_TRUE = 'M -4.5 1.5 A 1 1 90 0 1 -2.5 -0.5 L -1.5 0.5 L 2.5 -3.5 A 1 1 0 0 1 4.5 -1.5 L -0.5 3.5 Q -1.5 4.5 -2.5 3.5 Z'

/**
 * Mouse cursor style when over the hotspot that initiates editability.
 */
Blockly.FieldCheckbox.prototype.CURSOR = 'pointer';

/**
 * Install this checkbox on a block.
 */
Blockly.FieldCheckbox.prototype.init = function() {
  if (this.fieldGroup_) {
    // Checkbox has already been initialized once.
    return;
  }
  Blockly.FieldCheckbox.superClass_.init.call(this);
  // The checkbox doesn't use the inherited text element.
  // Instead it uses a custom checkmark element that is either visible or not.
  this.checkElement_ = Blockly.utils.createSvgElement('path',
    {
      'class': 'blocklyText blocklyCheckbox',
      'transform': `translate(${this.textElement_.getAttribute('x')},${this.textElement_.getAttribute('y')-2}) scale(1.5)`
    },
    this.fieldGroup_
  );
  this.checkElement_.setAttribute('d', this.state_ ? Blockly.FieldCheckbox.SYMBOL_TRUE : Blockly.FieldCheckbox.SYMBOL_FALSE);
};

/**
 * Return 'TRUE' if the checkbox is checked, 'FALSE' otherwise.
 * @return {string} Current state.
 */
Blockly.FieldCheckbox.prototype.getValue = function() {
  return String(this.state_).toUpperCase();
};

/**
 * Set the checkbox to be checked if newBool is 'TRUE' or true,
 * unchecks otherwise.
 * @param {string|boolean} newBool New state.
 */
Blockly.FieldCheckbox.prototype.setValue = function(newBool) {
  var newState = (typeof newBool == 'string') ?
      (newBool.toUpperCase() == 'TRUE') : !!newBool;
  if (this.state_ !== newState) {
    if (this.sourceBlock_ && Blockly.Events.isEnabled()) {
      Blockly.Events.fire(new Blockly.Events.BlockChange(
          this.sourceBlock_, 'field', this.name, this.state_, newState));
    }
    this.state_ = newState;
    if (this.checkElement_) {
      this.checkElement_.setAttribute('d', newState ? Blockly.FieldCheckbox.SYMBOL_TRUE : Blockly.FieldCheckbox.SYMBOL_FALSE);
    }
  }
};

/**
 * Toggle the state of the checkbox.
 * @private
 */
Blockly.FieldCheckbox.prototype.showEditor_ = function() {
  var newState = !this.state_;
  if (this.sourceBlock_) {
    // Call any validation function, and allow it to override.
    newState = this.callValidator(newState);
  }
  if (newState !== null) {
    this.setValue(String(newState).toUpperCase());
  }
};

Blockly.FieldCheckbox.prototype.updateWidth = function() {
  Blockly.FieldCheckbox.superClass_.updateWidth.call(this)
  this.size_.width = 8 * Blockly.BlockSvg.GRID_UNIT
}

Blockly.Field.register('field_checkbox', Blockly.FieldCheckbox);
