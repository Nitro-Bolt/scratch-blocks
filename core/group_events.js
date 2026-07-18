/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2018 Google Inc.
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
 * @fileoverview Classes for all group events.
 * @author CubesterYT@Nitro-Bolt
 */
'use strict';

goog.provide('Blockly.Events.GroupChange');

goog.require('Blockly.Events');
goog.require('Blockly.Events.Abstract');

/**
 * @param {Blockly.Group=} group Group affected by this event.
 * @constructor
 */
Blockly.Events.GroupChange = function(group) {
  Blockly.Events.GroupChange.superClass_.constructor.call(this);
  if (!group) return;
  this.workspaceId = group.workspace.id;
  this['groupId'] = group.id;
  this['oldState'] = null;
  this['newState'] = group.toJSON();
};
goog.inherits(Blockly.Events.GroupChange, Blockly.Events.Abstract);

Blockly.Events.GroupChange.prototype.type = 'group_change';

/**
 * @override
 */
Blockly.Events.GroupChange.prototype.toJson = function() {
  var json = Blockly.Events.GroupChange.superClass_.toJson.call(this);
  json['groupId'] = this['groupId'];
  json['oldState'] = this['oldState'];
  json['newState'] = this['newState'];
  return json;
};

/**
 * @override
 */
Blockly.Events.GroupChange.prototype.fromJson = function(json) {
  Blockly.Events.GroupChange.superClass_.fromJson.call(this, json);
  this['groupId'] = json['groupId'];
  this['oldState'] = json['oldState'];
  this['newState'] = json['newState'];
};

/**
 * @param {Blockly.Group} group Group before the change.
 */
Blockly.Events.GroupChange.prototype.recordOld = function(group) {
  this['oldState'] = group ? group.toJSON() : null;
};

/**
 * @param {Blockly.Group} group Group after the change.
 */
Blockly.Events.GroupChange.prototype.recordNew = function(group) {
  this['newState'] = group ? group.toJSON() : null;
};

/**
 * @override
 */
Blockly.Events.GroupChange.prototype.run = function(forward) {
  var workspace = this.getEventWorkspace_();
  var state = forward ? this['newState'] : this['oldState'];
  var group = workspace.getGroupById(this['groupId']);
  Blockly.Events.disable();
  try {
    if (!state) {
      if (group) group.dispose(false);
    } else if (group) {
      group.applyState(state);
    } else {
      Blockly.Group.fromJSON(workspace, state, false);
    }
  } finally {
    Blockly.Events.enable();
  }
};
