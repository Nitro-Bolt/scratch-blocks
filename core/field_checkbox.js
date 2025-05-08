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

goog.require('Blockly.Colours');

goog.require('Blockly.Field');

goog.require('Blockly.Xml');

goog.require('Blockly.Events');

/**
 * Class for a checkbox field.
 *   Internally repurposed as a display.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldCheckbox = function() {
  Blockly.FieldCheckbox.superClass_.constructor.call(this, ' ');
  this.addArgType('checkbox');
};
goog.inherits(Blockly.FieldCheckbox, Blockly.Field);

/**
 * Connect's a checkbox shadow to the specified input.
 * @param {Blockly.Input} input The boolean input to connect too.
 * This is used by block_svg_render_vertical to add swap the checkbox state on boolean values.
 */
Blockly.FieldCheckbox.connectBoolean = function(input) {
  Blockly.Events.setGroup(true);
  var block = Blockly.Xml.domToBlock(
    Blockly.Xml.textToDom(`<xml><block type="checkbox"><field name="CHECKBOX"> </field></block></xml>`).querySelector('block'),
    input.sourceBlock_.workspace,
  );
  block.setShadow(true);
  block.render();
  block.outputConnection.connect(input.connection);
  Blockly.Events.setGroup(false);
};

/**
 * Construct a FieldCheckbox from a JSON arg object.
 * @returns {!Blockly.FieldCheckbox} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldCheckbox.fromJson = function() {
  return new Blockly.FieldCheckbox();
};

/**
 * Icon for the checkmark.
 */
Blockly.FieldCheckbox.CHECKMARK = 'M -4.5 1.5 A 1 1 90 0 1 -2.5 -0.5 L -1.5 0.5 L 2.5 -3.5 A 1 1 0 0 1 4.5 -1.5 L -0.5 3.5 Q -1.5 4.5 -2.5 3.5 Z';

/**
 * Icon for the cross mark.
 */
Blockly.FieldCheckbox.CROSS = 'M -2.5 -4.5 A 1 1 0 0 0 -4.5 -2.5 L -2 0 L -4.5 2.5 A 1 1 0 0 0 -2.5 4.5 L 0 2 L 2.5 4.5 A 1 1 0 0 0 4.5 2.5 L 2 0 L 4.5 -2.5 A 1 1 0 0 0 2.5 -4.5 L 0 -2 Z';

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
  this.render_(); // Rerender
  this.checkElement_ = Blockly.utils.createSvgElement('path', {
    'class': 'blocklyText',
    'transform': `translate(${this.textElement_.getAttribute('x')},${this.textElement_.getAttribute('y') - 2}) scale(1.5)`,
    'd': Blockly.FieldCheckbox.CHECKMARK
  }, this.fieldGroup_);
  this.textElement_.after(this.checkElement_);
};

/**
 * Toggle the state of the checkbox.
 * @private
 */
Blockly.FieldCheckbox.prototype.showEditor_ = function() {
  /**
   * Handle's the actual showEditor_ action.
   * @this {Blockly.Block}
   */
  var reload = (function() {
    // Disable binding the click event (prevent's instant regeneration)
    this.getParent().getInputWithBlock(this)._skipBooleanCheckboxBind = true;
    // Remove the block
    this.dispose(false, false);
  }).bind(this.sourceBlock_);
  if (window.queueMicrotask) {
    queueMicrotask(reload);
  } else {
    Promise.resolve().then(reload);
  }
};

Blockly.FieldCheckbox.prototype.updateWidth = function() {
  Blockly.FieldCheckbox.superClass_.updateWidth.call(this);
  this.size_.width = 8 * Blockly.BlockSvg.GRID_UNIT;
};

Blockly.Field.register('field_checkbox', Blockly.FieldCheckbox);
