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
 * @fileoverview A dropdown that transforms its source block when its value changes.
 * @author Cubester@NitroBolt
 */
'use strict';

goog.provide('Blockly.FieldMutatorDropdown');

goog.require('Blockly.Events');
goog.require('Blockly.Events.BlockCreate');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.Xml');


/**
 * A dropdown field with a transformation for each option value.
 *
 * A transformation may be a callback with the signature
 * `(block, newValue, oldValue, field)`, or a declarative object accepted by
 * applyTransformationToBlock.
 *
 * @param {(!Array.<!Array>|Function)} menuGenerator Dropdown options.
 * @param {!Object.<string, (Function|!Object)>} transformations
 *     Transformations keyed by option value.
 * @param {Function=} opt_validator An optional value validator.
 * @extends {Blockly.FieldDropdown}
 * @constructor
 */
Blockly.FieldMutatorDropdown = function(menuGenerator, transformations,
    opt_validator) {
  this.transformations_ = transformations || {};
  Blockly.FieldMutatorDropdown.superClass_.constructor.call(
      this, menuGenerator, opt_validator);
};
goog.inherits(Blockly.FieldMutatorDropdown, Blockly.FieldDropdown);

/**
 * Construct a mutator dropdown from a JSON field definition.
 * @param {!Object} element A JSON field definition.
 * @returns {!Blockly.FieldMutatorDropdown} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldMutatorDropdown.fromJson = function(element) {
  return new Blockly.FieldMutatorDropdown(
      element['options'], element['transformations']);
};

/**
 * Apply a declarative transformation to a block.
 *
 * Supported properties are outputShape, outputCheck, previousStatement,
 * nextStatement, inputsInline, disconnectInputs, inputChecks, and inputShadows.
 * inputChecks is keyed by input name. inputShadows values are null to remove a
 * shadow, or an object with an opcode and optional fields object to create a
 * default shadow.
 *
 * @param {!Blockly.Block} block The block to transform.
 * @param {!Object} transformation The declarative transformation.
 * @param {boolean=} opt_isValueChange Whether the selected value just changed.
 */
Blockly.FieldMutatorDropdown.applyTransformationToBlock = function(
    block, transformation, opt_isValueChange) {
  if (Object.prototype.hasOwnProperty.call(transformation, 'outputShape')) {
    block.setOutputShape(transformation['outputShape']);
  }
  if (Object.prototype.hasOwnProperty.call(transformation, 'outputCheck')) {
    block.setOutput(true, transformation['outputCheck']);
  }
  if (Object.prototype.hasOwnProperty.call(
      transformation, 'previousStatement')) {
    block.setPreviousStatement(!!transformation['previousStatement']);
  }
  if (Object.prototype.hasOwnProperty.call(transformation, 'nextStatement')) {
    block.setNextStatement(!!transformation['nextStatement']);
  }
  if (Object.prototype.hasOwnProperty.call(transformation, 'inputsInline')) {
    block.setInputsInline(!!transformation['inputsInline']);
  }

  if (opt_isValueChange && transformation['disconnectInputs']) {
    var disconnectInputs = transformation['disconnectInputs'];
    for (var i = 0; i < disconnectInputs.length; i++) {
      var disconnectInput = block.getInput(disconnectInputs[i]);
      var disconnectConnection = disconnectInput && disconnectInput.connection;
      var disconnectBlock = disconnectConnection &&
          disconnectConnection.targetBlock();
      if (disconnectConnection) {
        disconnectConnection.setShadowDom(null);
      }
      if (disconnectBlock) {
        disconnectConnection.disconnect();
        if (disconnectBlock.isShadow()) {
          disconnectBlock.dispose(false);
        }
      }
    }
  }

  var inputChecks = transformation['inputChecks'];
  if (inputChecks) {
    for (var inputName in inputChecks) {
      if (Object.prototype.hasOwnProperty.call(inputChecks, inputName)) {
        var input = block.getInput(inputName);
        if (input) {
          input.setCheck(inputChecks[inputName]);
        }
      }
    }
  }

  var inputShadows = transformation['inputShadows'];
  if (inputShadows) {
    for (var shadowInputName in inputShadows) {
      if (!Object.prototype.hasOwnProperty.call(
          inputShadows, shadowInputName)) {
        continue;
      }
      var shadowInput = block.getInput(shadowInputName);
      if (!shadowInput || !shadowInput.connection) {
        continue;
      }
      var connection = shadowInput.connection;
      var target = connection.targetBlock();
      var shadowDefinition = inputShadows[shadowInputName];
      if (!shadowDefinition) {
        connection.setShadowDom(null);
        if (target && target.isShadow()) {
          connection.disconnect();
          target.dispose(false);
        }
        continue;
      }
      if (target) {
        continue;
      }

      var shadow;
      Blockly.Events.disable();
      try {
        shadow = block.workspace.newBlock(shadowDefinition['opcode']);
        var fields = shadowDefinition['fields'] || {};
        for (var fieldName in fields) {
          if (Object.prototype.hasOwnProperty.call(fields, fieldName)) {
            shadow.setFieldValue(fields[fieldName], fieldName);
          }
        }
        shadow.setShadow(true);
        if (shadow.initSvg) {
          shadow.initSvg();
          shadow.render(false);
        }
      } finally {
        Blockly.Events.enable();
      }
      if (Blockly.Events.isEnabled()) {
        Blockly.Events.fire(new Blockly.Events.BlockCreate(shadow));
      }
      shadow.outputConnection.connect(connection);
      var shadowDom = Blockly.Xml.blockToDom(shadow);
      shadowDom.removeAttribute('id');
      connection.setShadowDom(shadowDom);
    }
  }
};

/**
 * Apply the transformation associated with a value.
 * @param {*} newValue The selected value.
 * @param {*=} opt_oldValue The previous value.
 */
Blockly.FieldMutatorDropdown.prototype.applyTransformation = function(
    newValue, opt_oldValue) {
  if (!this.sourceBlock_ ||
      !Object.prototype.hasOwnProperty.call(this.transformations_, newValue)) {
    return;
  }
  var transformation = this.transformations_[newValue];
  if (typeof transformation === 'function') {
    transformation(this.sourceBlock_, newValue, opt_oldValue, this);
  } else if (transformation) {
    Blockly.FieldMutatorDropdown.applyTransformationToBlock(
        this.sourceBlock_, transformation, newValue !== opt_oldValue);
  }
  if (this.sourceBlock_.rendered) {
    this.sourceBlock_.render();
    this.sourceBlock_.bumpNeighbours_();
  }
};

/**
 * Reapply the selected transformation after XML has restored all child blocks.
 * This normalizes option-specific inputs which occur after fields in the XML.
 */
Blockly.FieldMutatorDropdown.prototype.reapplyTransformation = function() {
  this.applyTransformation(this.getValue(), this.getValue());
};

/**
 * Set the selected value and transform the source block. Because XML loading,
 * undo, and redo all use setValue, the block layout is always derived from the
 * serialized field value.
 * @param {*} newValue The new value.
 */
Blockly.FieldMutatorDropdown.prototype.setValue = function(newValue) {
  var oldValue = this.getValue();
  if (newValue === null || newValue === oldValue) {
    return;
  }

  var startedEventGroup = !!this.sourceBlock_ && Blockly.Events.isEnabled() &&
      !Blockly.Events.getGroup();
  if (startedEventGroup) {
    Blockly.Events.setGroup(true);
  }
  try {
    Blockly.FieldMutatorDropdown.superClass_.setValue.call(this, newValue);
    this.applyTransformation(newValue, oldValue);
  } finally {
    if (startedEventGroup) {
      Blockly.Events.setGroup(false);
    }
  }
};

Blockly.Field.register('field_mutator_dropdown',
    Blockly.FieldMutatorDropdown);
