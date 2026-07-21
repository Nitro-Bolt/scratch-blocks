/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2013 Google Inc.
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
 * @fileoverview A dropdown editor used for editing the options of a dropdown menu.
 * Most notably used in the procedure modal.
 * @author LordCat0
 */
'use strict';

goog.provide('Blockly.FieldDropdownEditor');

goog.require('Blockly.FieldTextDropdown');
goog.require('Blockly.DropDownDiv');
goog.require('goog.style');
goog.require('goog.events');
goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuItem');

/**
 * Class for a dropdown editor field.
 * @param {string} text The initial content of the text field.
 * @param {(!Array.<!Array.<string>>|!Function)} menuGenerator An array of
 *     options for a dropdown list, or a function which generates these options.
 * @extends {Blockly.FieldTextDropdown}
 * @constructor
 */
Blockly.FieldDropdownEditor = function(text, menuGenerator) {
  Blockly.FieldDropdownEditor.superClass_.constructor.call(this, text, menuGenerator);
};
goog.inherits(Blockly.FieldDropdownEditor, Blockly.FieldTextDropdown);

Blockly.FieldDropdownEditor.prototype.init = function() {
  Blockly.FieldDropdownEditor.superClass_.init.call(this);
  
  this.arrow_.setAttributeNS('http://www.w3.org/1999/xlink',
    'xlink:href',
    Blockly.mainWorkspace.options.pathToMedia + 'dropdown-arrow.svg');

  this.textElement_.classList.add('blocklyEditableLabel');
}

/**
 * Construct a FieldDropdownEditor from a JSON arg object,
 * dereferencing any string table references.
 * @param {!Object} element A JSON object with options.
 * @returns {!Blockly.FieldTextDropdown} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldDropdownEditor.fromJson = function(element) {
  return new Blockly.FieldDropdownEditor(element['text'], element['options']);
};

/**
 * Create the dropdown editor menu.
 * @private
 */
Blockly.FieldDropdownEditor.prototype.showDropdown_ = function() {
  var contentDiv = Blockly.DropDownDiv.getContentDiv();
  var options = this.getOptions();
  var menu = new goog.ui.Menu();
  var thisField = this;

  this.dropDownOpen_ = true;
  // If there is an existing drop-down someone else owns, hide it immediately and clear it.
  Blockly.DropDownDiv.hideWithoutAnimation();
  Blockly.DropDownDiv.clearContent();

  function addOption(value, index) {
    var container = document.createElement('div');
    container.style.display = 'flex';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';

    var input = document.createElement('input');
    input.style.background = 'none';
    input.style.border = '2px solid rgba(0,0,0,.15)';
    input.style.padding = '3px';
    input.style.borderRadius = '2px';
    input.value = value;
    container.append(input);

    var image = new Image(25, 25);
    image.style.cursor = 'pointer';
    image.src =
      Blockly.mainWorkspace.options.pathToMedia + 'delete-x-light.svg';
    container.append(image);

    var menuItem = new goog.ui.MenuItem(container);

    // Prevent menu item clicks from affecting the input
    Blockly.bindEvent_(input, 'mousedown', null, function(e) {
      e.stopPropagation();
    });
    Blockly.bindEvent_(input, 'input', null, function(e) {
      var opt = thisField.menuGenerator_[index];
      opt[0] = input.value;
      opt[1] = input.value;
    });
    Blockly.bindEvent_(image, 'click', null, function(e) {
      // Only set option to null to not break indexes.
      thisField.menuGenerator_[index] = null;
      menu.removeChild(menuItem, true);
    });
    
    menu.addChildAt(menuItem, index, true);

    // Fix the dropdown div's right side being huge
    menuItem.getElement().style.paddingRight = '28px';
  }

  for (var i = 0; i < options.length; i++) {
    addOption(options[i][0], i);
  }

  var addItem = new goog.ui.MenuItem('Add Option');
  menu.addChild(addItem, true);

  // Listen for mouse/keyboard events.
  function callback(e) {
    var menuItem = e.target;
    if (menuItem.content_ === 'Add Option') {
      thisField.menuGenerator_.push(['Option', 'Option']);

      addOption('Option', menu.getChildCount() - 1);
    }
  }
  goog.events.listen(menu, goog.ui.Component.EventType.ACTION, callback);

  menu.render(contentDiv);
  var menuDom = menu.getElement();
  Blockly.utils.addClass(menuDom, 'blocklyDropdownMenu');
  // Record menuSize after adding menu.
  var menuSize = goog.style.getSize(menuDom);
  // Recalculate height for the total content, not only box height.
  menuSize.height = menuDom.scrollHeight;

  var primaryColour = (this.sourceBlock_.isShadow()) ?
    this.sourceBlock_.parentBlock_.getColour() : this.sourceBlock_.getColour();

  Blockly.DropDownDiv.setColour(primaryColour, this.sourceBlock_.getColourTertiary());

  // Calculate positioning based on the field position.
  var scale = this.sourceBlock_.workspace.scale;
  var bBox = {width: this.size_.width, height: this.size_.height};
  bBox.width *= scale;
  bBox.height *= scale;
  var position = this.fieldGroup_.getBoundingClientRect();
  var primaryX = position.left + bBox.width / 2;
  var primaryY = position.top + bBox.height;
  var secondaryX = primaryX;
  var secondaryY = position.top;
  // Set bounds to workspace; show the drop-down.
  Blockly.DropDownDiv.setBoundsElement(this.sourceBlock_.workspace.getParentSvg().parentNode);
  Blockly.DropDownDiv.show(
      this, primaryX, primaryY, secondaryX, secondaryY, this.onHide.bind(this));

  menu.setAllowAutoFocus(true);
  menuDom.focus();
};

/**
 * Callback for when the drop-down is hidden.
 */
Blockly.FieldDropdownEditor.prototype.onHide = function() {
  this.dropDownOpen_ = false;
  // Clear out any deleted options
  this.menuGenerator_ = this.menuGenerator_.filter(Boolean);
}

Blockly.Field.register('field_dropdowneditor', Blockly.FieldDropdownEditor);