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
 * @fileoverview A dropdown whose options depend on another field on the same block.
 * @author Cubester@NitroBolt
 */
'use strict';

goog.provide('Blockly.FieldDependentDropdown');

goog.require('Blockly.FieldDropdown');


/**
 * A dropdown field whose options are selected using another field's value.
 *
 * The parent field must already be attached to the block when this field is
 * attached. This is normally achieved by placing the parent field before the
 * dependent field in a block definition.
 *
 * @param {string} parentName The name of the field this dropdown depends on.
 * @param {!Object.<string, !Array.<!Array>>} optionMapping A map from parent
 *     values to dropdown option tuples.
 * @param {Array.<!Array>=} opt_defaultOptions Options used when the parent
 *     value has no entry in optionMapping.
 * @param {Function=} opt_validator A validator for this dropdown.
 * @extends {Blockly.FieldDropdown}
 * @constructor
 */
Blockly.FieldDependentDropdown = function(parentName, optionMapping,
    opt_defaultOptions, opt_validator) {
  this.parentName_ = parentName;
  this.optionMapping_ = optionMapping || {};
  this.defaultOptions_ = opt_defaultOptions || [];
  this.parentField_ = null;
  this.parentValue_ = undefined;
  this.options_ = this.getOptionsForParentValue_(undefined);

  // FieldDropdown needs an option while its base constructor initializes the
  // field. If no default was supplied, use the first mapped option for that
  // initialization; the real parent value is applied in insertedInto.
  if (!this.options_.length) {
    for (var key in this.optionMapping_) {
      if (Object.prototype.hasOwnProperty.call(this.optionMapping_, key) &&
          this.optionMapping_[key] && this.optionMapping_[key].length) {
        this.options_ = this.optionMapping_[key];
        break;
      }
    }
  }
  var hasSelectableOption = false;
  for (var i = 0; i < this.options_.length; i++) {
    if (this.options_[i] != Blockly.FieldDropdown.SEPARATOR) {
      hasSelectableOption = true;
      break;
    }
  }
  if (!hasSelectableOption) {
    // FieldDropdown historically assumes that a menu has at least one item.
    // Keep construction safe even when a block is configured with an empty
    // mapping; callers can replace the mapping before using the field.
    this.options_ = [['', '']];
  }

  Blockly.FieldDependentDropdown.superClass_.constructor.call(
      this, this.options_, opt_validator);
};
goog.inherits(Blockly.FieldDependentDropdown, Blockly.FieldDropdown);

/**
 * Construct a dependent dropdown from a JSON field definition.
 * @param {!Object} element A JSON object with parentName, optionMapping, and
 *     optionally defaultOptions.
 * @returns {!Blockly.FieldDependentDropdown} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldDependentDropdown.fromJson = function(element) {
  return new Blockly.FieldDependentDropdown(
      element['parentName'], element['optionMapping'],
      element['defaultOptions']);
};

/**
 * Return the options associated with a parent value.
 * @param {*} parentValue The current or proposed parent value.
 * @return {!Array.<!Array>} Dropdown option tuples.
 * @private
 */
Blockly.FieldDependentDropdown.prototype.getOptionsForParentValue_ = function(
    parentValue) {
  if (parentValue !== undefined &&
      Object.prototype.hasOwnProperty.call(this.optionMapping_, parentValue) &&
      this.optionMapping_[parentValue] &&
      this.optionMapping_[parentValue].length) {
    return this.optionMapping_[parentValue];
  }
  return this.defaultOptions_;
};

/**
 * Refresh this field for a parent value. The parent validator calls this with
 * the proposed value before the parent itself has stored it.
 * @param {*} parentValue The current or proposed parent value.
 * @private
 */
Blockly.FieldDependentDropdown.prototype.updateOptions_ = function(
    parentValue) {
  if (this.parentValue_ === parentValue && this.options_) {
    return;
  }

  var options = this.getOptionsForParentValue_(parentValue);
  if (!options.length) {
    options = [['', '']];
  }
  this.parentValue_ = parentValue;
  this.options_ = options;

  var currentValue = this.getValue();
  var currentValueIsValid = false;
  var firstOption = null;
  for (var i = 0; i < options.length; i++) {
    if (options[i] == Blockly.FieldDropdown.SEPARATOR) {
      continue;
    }
    if (!firstOption) {
      firstOption = options[i];
    }
    if (options[i][1] == currentValue) {
      currentValueIsValid = true;
      break;
    }
  }
  if (!firstOption) {
    firstOption = ['', ''];
    this.options_ = [firstOption];
  }
  if (!currentValueIsValid) {
    // Use this field's setter so any dependent dropdowns chained after this
    // field are refreshed too. The setter wrapper uses the new options list.
    this.setValue(firstOption[1]);
  }
};

/**
 * Return the currently active option list. This also makes direct calls to a
 * parent's setValue work, in addition to changes made through its validator.
 * @return {!Array.<!Array>} Dropdown option tuples.
 */
Blockly.FieldDependentDropdown.prototype.getOptions = function() {
  if (this.parentField_) {
    var parentValue = this.parentField_.getValue();
    this.updateOptions_(parentValue);
  }
  return this.options_;
};

/**
 * A dependent menu is dynamic even though its internal option lists are
 * arrays.
 * @return {boolean} True.
 */
Blockly.FieldDependentDropdown.prototype.isOptionListDynamic = function() {
  return true;
};

/**
 * Attach this field to its parent and arrange for both validated and direct
 * parent changes to refresh the child.
 * @param {!Blockly.Input} _input The input the field was added into.
 * @param {!Blockly.Block} block The block the field was added into.
 */
Blockly.FieldDependentDropdown.prototype.insertedInto = function(_input, block) {
  var parentField = block.getField(this.parentName_);
  if (!parentField) {
    throw new Error('FieldDependentDropdown parent field "' +
        this.parentName_ + '" was not found on block "' + block.type + '". ' +
        'The parent field must be added before the dependent field.');
  }

  this.parentField_ = parentField;
  var state = parentField.dependentDropdownState_;
  if (!state) {
    state = {
      children: [],
      originalValidator: parentField.getValidator(),
      originalSetValue: parentField.setValue
    };
    state.validator = function(newValue) {
      var validatedValue = state.originalValidator ?
          state.originalValidator.call(this, newValue) : newValue;
      if (validatedValue === undefined) {
        validatedValue = newValue;
      }
      if (validatedValue === null) {
        return null;
      }
      var children = state.children.slice();
      for (var i = 0; i < children.length; i++) {
        children[i].updateOptions_(validatedValue);
      }
      return validatedValue;
    };
    state.setValue = function(newValue) {
      var oldValue = this.getValue();
      state.originalSetValue.call(this, newValue);
      if (oldValue != this.getValue()) {
        var children = state.children.slice();
        for (var i = 0; i < children.length; i++) {
          children[i].updateOptions_(this.getValue());
        }
      }
    };
    parentField.dependentDropdownState_ = state;
    parentField.setValidator(state.validator);
    parentField.setValue = state.setValue;
  }
  state.children.push(this);

  this.updateOptions_(parentField.getValue());
};

/**
 * Remove this field from its parent's dependent field list.
 * @private
 */
Blockly.FieldDependentDropdown.prototype.detachFromParent_ = function() {
  var parentField = this.parentField_;
  var state = parentField && parentField.dependentDropdownState_;
  if (!state) {
    return;
  }

  var index = state.children.indexOf(this);
  if (index !== -1) {
    state.children.splice(index, 1);
  }
  if (!state.children.length) {
    if (parentField.getValidator() === state.validator) {
      parentField.setValidator(state.originalValidator);
    }
    if (parentField.setValue === state.setValue) {
      parentField.setValue = state.originalSetValue;
    }
    delete parentField.dependentDropdownState_;
  }
};

/**
 * Dispose of this field.
 */
Blockly.FieldDependentDropdown.prototype.dispose = function() {
  this.detachFromParent_();
  this.parentField_ = null;
  Blockly.FieldDependentDropdown.superClass_.dispose.call(this);
};

Blockly.Field.register('field_dependent_dropdown',
    Blockly.FieldDependentDropdown);
