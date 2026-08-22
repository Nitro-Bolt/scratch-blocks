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
 * @fileoverview Number slider input field.
 * @author Cubester@NitroBolt
 */
'use strict';

goog.provide('Blockly.FieldSlider');

goog.require('Blockly.DropDownDiv');
goog.require('Blockly.FieldNumber');
goog.require('Blockly.FieldTextInput');

/**
 * Class for a number slider field.
 * @param {(string|number)=} opt_value Initial value. Defaults to 0.
 * @param {(string|number)=} opt_min Minimum value. Defaults to 0.
 * @param {(string|number)=} opt_max Maximum value. Defaults to 100.
 * @param {(string|number)=} opt_precision Precision for the value. Defaults to 1.
 * @param {Function=} opt_validator An optional value validator.
 * @extends {Blockly.FieldNumber}
 * @constructor
 */
Blockly.FieldSlider = function(opt_value, opt_min, opt_max, opt_precision,
    opt_validator) {
  Blockly.FieldSlider.superClass_.constructor.call(this, opt_value, opt_min,
      opt_max, opt_precision, opt_validator);

  /** @type {?HTMLInputElement} @private */
  this.sliderInput_ = null;
  /** @type {Array.<!Array>} @private */
  this.sliderEventWrappers_ = [];

  this.setConstraints(opt_min, opt_max, opt_precision);
};
goog.inherits(Blockly.FieldSlider, Blockly.FieldNumber);

/**
 * Parse a slider constraint.
 * @param {(string|number|undefined)} value Proposed constraint.
 * @param {number} fallback Value used for an invalid constraint.
 * @return {number} A finite number.
 * @private
 */
Blockly.FieldSlider.parseConstraint_ = function(value, fallback) {
  var number = Number(value);
  return value !== '' && isFinite(number) ? number : fallback;
};

/**
 * Construct a FieldSlider from a JSON argument object.
 * @param {!Object} options A JSON object with value, min, max, and precision.
 * @return {!Blockly.FieldSlider} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldSlider.fromJson = function(options) {
  return new Blockly.FieldSlider(options['value'], options['min'],
      options['max'], options['precision']);
};

/**
 * Set the slider bounds and step, and normalize its current value.
 * @param {(string|number)=} opt_min Minimum value. Defaults to 0.
 * @param {(string|number)=} opt_max Maximum value. Defaults to 100.
 * @param {(string|number)=} opt_precision Step size. Defaults to 1.
 */
Blockly.FieldSlider.prototype.setConstraints = function(opt_min, opt_max,
    opt_precision) {
  this.min_ = Blockly.FieldSlider.parseConstraint_(opt_min, 0);
  this.max_ = Blockly.FieldSlider.parseConstraint_(opt_max, 100);
  if (this.max_ < this.min_) {
    this.max_ = this.min_;
  }
  this.precision_ = Blockly.FieldSlider.parseConstraint_(opt_precision, 1);
  if (this.precision_ <= 0) {
    this.precision_ = 1;
  }

  this.setRestrictor(this.getNumRestrictor(
      this.min_, this.max_, this.precision_));
  this.setText(this.classValidator(this.getValue()));

  if (this.sliderInput_) {
    this.sliderInput_.min = String(this.min_);
    this.sliderInput_.max = String(this.max_);
    this.sliderInput_.step = String(this.precision_);
    this.sliderInput_.value = this.getValue();
  }
};

/**
 * Ensure a value is numeric, within the slider bounds, and on a valid step.
 * @param {*} value Proposed value.
 * @return {?string} The normalized value, or null if it is not numeric.
 */
Blockly.FieldSlider.prototype.classValidator = function(value) {
  var number = Number(value);
  if (!isFinite(number)) {
    return null;
  }
  number = Math.min(this.max_, Math.max(this.min_, number));
  number = Math.round((number - this.min_) / this.precision_) *
      this.precision_ + this.min_;
  number = Math.min(this.max_, Math.max(this.min_, number));

  // Avoid floating-point noise such as 0.30000000000000004.
  var precisionText = String(this.precision_);
  var decimalPlaces = precisionText.indexOf('.') === -1 ? 0 :
      precisionText.length - precisionText.indexOf('.') - 1;
  return String(Number(number.toFixed(decimalPlaces)));
};

/**
 * Show the inline number editor and its slider dropdown.
 * @private
 */
Blockly.FieldSlider.prototype.showEditor_ = function() {
  Blockly.DropDownDiv.hideWithoutAnimation();
  Blockly.DropDownDiv.clearContent();

  // Bypass FieldNumber's optional touch numpad. The range control replaces it,
  // while the normal text editor remains available for precise entry.
  Blockly.FieldTextInput.prototype.showEditor_.call(this, true, false);

  var contentDiv = Blockly.DropDownDiv.getContentDiv();
  var container = document.createElement('div');
  container.className = 'blocklyFieldSliderContainer';
  var slider = document.createElement('input');
  slider.type = 'range';
  slider.min = String(this.min_);
  slider.max = String(this.max_);
  slider.step = String(this.precision_);
  slider.value = this.getValue();
  slider.tabIndex = 0;
  slider.className = 'blocklyFieldSlider';
  slider.setAttribute('aria-label', this.name || 'Slider');
  var parentBlock = this.sourceBlock_.parentBlock_ || this.sourceBlock_;
  slider.style.setProperty('--blockly-slider-track-colour',
      parentBlock.getColourSecondary());
  container.appendChild(slider);
  contentDiv.appendChild(container);
  this.sliderInput_ = slider;
  this.sliderEventWrappers_.push(
      Blockly.bindEvent_(slider, 'input', this, this.onSliderChange_));

  Blockly.DropDownDiv.setColour(parentBlock.getColour(),
      this.sourceBlock_.getColourTertiary());
  Blockly.DropDownDiv.setCategory(parentBlock.getCategory());
  Blockly.DropDownDiv.showPositionedByBlock(this, this.sourceBlock_,
      this.dropdownDispose_.bind(this));
  slider.focus();
};

/**
 * Synchronize the text editor with a slider movement.
 * @private
 */
Blockly.FieldSlider.prototype.onSliderChange_ = function() {
  if (!this.sliderInput_ || !Blockly.FieldTextInput.htmlInput_) {
    return;
  }
  Blockly.FieldTextInput.htmlInput_.value = this.sliderInput_.value;
  this.onHtmlInputChange_({type: 'input'});
  this.sliderInput_.value = this.getValue();
};

/**
 * Keep an open slider synchronized when the field rerenders.
 * @private
 */
Blockly.FieldSlider.prototype.render_ = function() {
  Blockly.FieldSlider.superClass_.render_.call(this);
  if (this.sliderInput_) {
    this.sliderInput_.value = this.getValue();
  }
};

/**
 * Dispose of slider DOM event bindings when its dropdown closes.
 * @private
 */
Blockly.FieldSlider.prototype.dropdownDispose_ = function() {
  for (var i = 0; i < this.sliderEventWrappers_.length; i++) {
    Blockly.unbindEvent_(this.sliderEventWrappers_[i]);
  }
  this.sliderEventWrappers_.length = 0;
  this.sliderInput_ = null;
};

/** Dispose of this field. */
Blockly.FieldSlider.prototype.dispose = function() {
  Blockly.DropDownDiv.hideIfOwner(this);
  Blockly.FieldSlider.superClass_.dispose.call(this);
};

Blockly.Field.register('field_slider', Blockly.FieldSlider);
