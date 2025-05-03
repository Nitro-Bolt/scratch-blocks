/**
 * @fileoverview Field that contains other inputs and can be extended.
 * @author CST1229
 */
'use strict';

goog.provide('Blockly.FieldExtendable');

goog.require('Blockly.Field');


/**
 * Class for an extendable field.
 * @param {!Array} elements Array of arguments to use for each extendable input, in the jsonInit format.
 * @param {!number} defaultInputs Default number of inputs
 * @param {!number} minInputs Minimum inputs
 * @param {!number} maxInputs Maximum inputs
 * @param {!Array} separator Array of arguments to use as a separator
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldExtendable = function(elements, defaultInputs, minInputs, maxInputs, separator) {
  Blockly.FieldExtendable.superClass_.constructor.call(this, '', undefined);

  this.size_ = new goog.math.Size(Blockly.FieldExtendable.ARROW_HEIGHT, Blockly.FieldExtendable.ARROW_WIDTH * 2);

  this.elements = elements;
  this.minInputs = minInputs;
  this.maxInputs = maxInputs;
  this.separator = separator;

  this.inputs = undefined;
  this.setValue(defaultInputs, false, true);
  this.addArgType('extendable');
};
goog.inherits(Blockly.FieldExtendable, Blockly.Field);

/**
 * Construct a FieldExtendable from a JSON arg object.
 * @param {!Object} options A JSON object with options (checked).
 * @returns {!Blockly.FieldExtendable} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldExtendable.fromJson = function(options) {
  var args = options.args;
  if (args === undefined) args = [];
  var defaultInputs = options.defaultInputs;
  if (defaultInputs === undefined) defaultInputs = 0;
  var minInputs = options.minInputs;
  if (minInputs === undefined) minInputs = 0;
  var maxInputs = options.maxInputs;
  if (maxInputs === undefined) maxInputs = Infinity;
  var separator = options.separator;
  if (separator === undefined) separator = [];
  if (!Array.isArray(separator)) separator = [separator];
  return new Blockly.FieldExtendable(args, defaultInputs, minInputs, maxInputs, separator);
};

/**
 * Mouse cursor style when over the hotspot that initiates editability.
 */
Blockly.FieldExtendable.prototype.CURSOR = 'default';
Blockly.FieldExtendable.prototype.EDITABLE = false;

Blockly.FieldExtendable.ARROW_WIDTH = 16;
Blockly.FieldExtendable.ARROW_HEIGHT = 32;
Blockly.FieldExtendable.ARROW_LEFT_PATH = 'icons/extendable_arrow_left.svg';
Blockly.FieldExtendable.ARROW_RIGHT_PATH = 'icons/extendable_arrow_right.svg';

/**
 * Install this field on a block.
 */
Blockly.FieldExtendable.prototype.init = function() {
  if (this.fieldGroup_) {
    // Field has already been initialized once.
    return;
  }
  /** @type {SVGElement} */
  this.fieldGroup_ = Blockly.utils.createSvgElement('g', {}, null);
  this.arrowLeft = Blockly.utils.createSvgElement('image',
      {
        'height': Blockly.FieldExtendable.ARROW_HEIGHT + 'px',
        'width': Blockly.FieldExtendable.ARROW_WIDTH + 'px'
      },
      this.fieldGroup_
  );
  this.arrowRight = Blockly.utils.createSvgElement('image',
      {
        'height': Blockly.FieldExtendable.ARROW_HEIGHT + 'px',
        'width': Blockly.FieldExtendable.ARROW_WIDTH + 'px',
        'x': Blockly.FieldExtendable.ARROW_WIDTH
      },
      this.fieldGroup_
  );
  this.arrowLeft.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
      Blockly.mainWorkspace.options.pathToMedia + Blockly.FieldExtendable.ARROW_LEFT_PATH
  );
  this.arrowRight.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
      Blockly.mainWorkspace.options.pathToMedia + Blockly.FieldExtendable.ARROW_RIGHT_PATH
  );
  this.arrowLeft.style.cursor = 'pointer';
  this.arrowRight.style.cursor = 'pointer';

  this.mouseDownWrapperLeft_ = Blockly.bindEventWithChecks_(
      this.arrowLeft, 'mousedown', this, this.addInputs.bind(this, -1)
  );
  this.mouseDownWrapperRight_ = Blockly.bindEventWithChecks_(
      this.arrowRight, 'mousedown', this, this.addInputs.bind(this, 1)
  );

  this.sourceBlock_.getSvgRoot().appendChild(this.fieldGroup_);

  this.render_();
};

/**
 * @return {number} Number of inputs, as a string.
 */
Blockly.FieldExtendable.prototype.getValue = function() {
  return String(this.inputs);
};

/**
 * Get the prefix used for inputs.
 * @return {string} The prefix.
 */
Blockly.FieldExtendable.prototype.getPrefix = function() {
  return String(this.name || "") + "_";
};

/**
 * Get the prefix used for input separators.
 * @return {string} The prefix.
 */
Blockly.FieldExtendable.prototype.getSepPrefix = function() {
  return this.getPrefix() + "SEP";
};

/**
 * Get the absolute name of an extendable input from its index.
 * @param {number} id The index of the input.
 * @param {boolean} opt_sep If true, this is a separator.
 * @param {Blockly.Input=} opt_forInput The input object this name is for.
 * @return {string} The final name of the input.
 */
Blockly.FieldExtendable.prototype.getInputName = function(id, opt_sep, opt_forInput) {
  var suffix = "";
  if (opt_forInput && opt_forInput.name) {
    suffix += "_" + opt_forInput.name;
  }
  if (opt_sep) {
    return this.getSepPrefix() + String(id) + suffix;
  }
  return this.getPrefix() + String(id) + suffix;
};

/**
 * Set the amount of inputs.
 * @param {number | string} newValue Number of inputs.
 * @param {boolean=} opt_force If true, ignores the set min/max values.
 * @param {boolean=} opt_noRender If true, skips rerendering.
 */
Blockly.FieldExtendable.prototype.setValue = function(newValue, opt_force, opt_noRender) {
  var newInputs = +newValue;
  if (!opt_force) {
    if (newInputs < this.minInputs) newInputs = this.minInputs;
    else if (newInputs > this.maxInputs) newInputs = this.maxInputs;
  }
  
  if (this.inputs !== newInputs) {
    if (this.sourceBlock_ && Blockly.Events.isEnabled()) {
      Blockly.Events.fire(new Blockly.Events.BlockChange(
          this.sourceBlock_, 'field', this.name, this.inputs, newInputs));
    }

    if (this.sourceBlock_) {
      // If we decreased the number of inputs, remove some
      if (newInputs < this.inputs) {
        for (var i = this.sourceBlock_.inputList.length - 1; i >= 0; i--) {
          var input = this.sourceBlock_.inputList[i];
          if (input.extendableName == this.name && input.extendableIndex >= newInputs) {
            this.sourceBlock_.removeNumberedInput(i);
          }
        }
      }
      // If we increased the number of inputs, add some
      var thisIndex = this.sourceBlock_.inputList.indexOf(this.sourceInput_);
      for (var i = this.inputs; i < newInputs; i++) {
        // Add separator for inputs after the first
        if (i > 0) {
          var addedSeps = this.sourceBlock_.appendArgsList(this.separator, undefined, thisIndex, true);
          for (var j = 0; j < addedSeps.length; j++) {
            var sep = addedSeps[j];
            sep.extendableName = this.name;
            sep.extendableIndex = this.inputs + j;
            sep.name = this.getInputName(sep.extendableIndex, true, sep);
          }
          thisIndex += addedSeps.length;
        }

        var addedInputs = this.sourceBlock_.appendArgsList(this.elements, undefined, thisIndex, true);
        for (var j = 0; j < addedInputs.length; j++) {
          var input = addedInputs[j];
          input.extendableName = this.name;
          input.extendableIndex = this.inputs + j;
          input.name = this.getInputName(input.extendableIndex, false, input);
        }
        thisIndex += addedInputs.length;
      }
    }

    this.inputs = newInputs;
    // TODO: this is a debug thing until inputs are implemented
    console.log('Extendable field ' + this.name + ' now has ' + this.inputs + ' input(s)');
    if (!opt_noRender) {
      this.render_();
      if (this.sourceBlock_) {
        this.sourceBlock_.render(false);
      }
    }
  }
};

/**
 * @param {number} inputs Number of inputs to add.
 */
Blockly.FieldExtendable.prototype.addInputs = function(inputs) {
  this.setValue(this.inputs + inputs);
};

Blockly.FieldExtendable.prototype.render_ = function() {
  this.updateWidth();
  if (!this.arrowLeft) return;
  this.arrowLeft.style.display = this.inputs <= this.minInputs ? 'none' : '';
  this.arrowRight.style.display = this.inputs >= this.maxInputs ? 'none' : '';
  this.arrowRight.setAttribute('x', this.inputs <= this.minInputs ? '0px' : Blockly.FieldExtendable.ARROW_WIDTH + 'px');
};

Blockly.FieldExtendable.prototype.updateWidth = function() {
  if (this.inputs <= this.minInputs || this.inputs >= this.maxInputs) {
    this.size_.width = Blockly.FieldExtendable.ARROW_WIDTH;
  } else {
    this.size_.width = Blockly.FieldExtendable.ARROW_WIDTH * 2;
  }
};

/**
 * Clean up this FieldExtendable, as well as the inherited Field.
 * @return {!Function} Closure to call on destruction of the WidgetDiv.
 * @private
 */
Blockly.FieldExtendable.prototype.dispose_ = function() {
  var thisField = this;
  return function() {
    Blockly.FieldExtendable.superClass_.dispose_.call(thisField)();
    if (thisField.mouseDownWrapperLeft_) {
      Blockly.unbindEvent_(thisField.mouseDownWrapperLeft_);
    }
    if (thisField.mouseDownWrapperRight_) {
      Blockly.unbindEvent_(thisField.mouseDownWrapperRight_);
    }
    // Dispose of any inputs added by this field
    Blockly.Events.disable();
    thisField.setValue(0, true, true);
    Blockly.Events.enable();
  };
};

Blockly.Field.register('extendable', Blockly.FieldExtendable);
