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
goog.provide('Blockly.Events.GroupDragOutside');
goog.provide('Blockly.Events.GroupEndDrag');

goog.require('Blockly.Events');
goog.require('Blockly.Events.Abstract');
goog.require('Blockly.Xml');

/**
 * @param {Blockly.Group=} group Group being dragged.
 * @param {boolean=} isOutside Whether it is outside the blocks area.
 * @constructor
 */
Blockly.Events.GroupDragOutside = function(group, isOutside) {
  Blockly.Events.GroupDragOutside.superClass_.constructor.call(this);
  if (!group) return;
  this.workspaceId = group.workspace.id;
  this['groupId'] = group.id;
  this['isOutside'] = !!isOutside;
  this.recordUndo = false;
};
goog.inherits(Blockly.Events.GroupDragOutside, Blockly.Events.Abstract);
Blockly.Events.GroupDragOutside.prototype.type =
    Blockly.Events.GROUP_DRAG_OUTSIDE;

/**
 * @override
 */
Blockly.Events.GroupDragOutside.prototype.toJson = function() {
  var json = Blockly.Events.GroupDragOutside.superClass_.toJson.call(this);
  json['groupId'] = this['groupId'];
  json['isOutside'] = this['isOutside'];
  return json;
};

/**
 * @override
 */
Blockly.Events.GroupDragOutside.prototype.fromJson = function(json) {
  Blockly.Events.GroupDragOutside.superClass_.fromJson.call(this, json);
  this['groupId'] = json['groupId'];
  this['isOutside'] = !!json['isOutside'];
};

/**
 * @param {Blockly.Group=} group Group whose drag ended.
 * @param {boolean=} isOutside Whether it ended outside the blocks area.
 * @constructor
 */
Blockly.Events.GroupEndDrag = function(group, isOutside) {
  Blockly.Events.GroupEndDrag.superClass_.constructor.call(this);
  if (!group) return;
  this.workspaceId = group.workspace.id;
  this['groupId'] = group.id;
  this['isOutside'] = !!isOutside;
  this['groupState'] = group.toJSON();
  this['xmls'] = isOutside ? group.getOwnedTopBlocks_().map(function(block) {
    return Blockly.Xml.blockToDomWithXY(block, true);
  }) : [];
  this.recordUndo = false;
};
goog.inherits(Blockly.Events.GroupEndDrag, Blockly.Events.Abstract);
Blockly.Events.GroupEndDrag.prototype.type = Blockly.Events.GROUP_END_DRAG;

/**
 * @override
 */
Blockly.Events.GroupEndDrag.prototype.toJson = function() {
  var json = Blockly.Events.GroupEndDrag.superClass_.toJson.call(this);
  json['groupId'] = this['groupId'];
  json['isOutside'] = this['isOutside'];
  json['groupState'] = this['groupState'];
  json['xmls'] = this['xmls'];
  return json;
};

/**
 * @override
 */
Blockly.Events.GroupEndDrag.prototype.fromJson = function(json) {
  Blockly.Events.GroupEndDrag.superClass_.fromJson.call(this, json);
  this['groupId'] = json['groupId'];
  this['isOutside'] = !!json['isOutside'];
  this['groupState'] = json['groupState'];
  this['xmls'] = json['xmls'] || [];
};

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

Blockly.Events.GroupChange.prototype.type = Blockly.Events.GROUP_CHANGE;

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

  // applyState is intentionally silent, but the VM still needs the restored
  // state after undo/redo so a later workspace reload does not revive the
  // temporary drag geometry.
  var syncEvent = new Blockly.Events.GroupChange();
  syncEvent.workspaceId = this.workspaceId;
  syncEvent['groupId'] = this['groupId'];
  syncEvent['oldState'] = state;
  syncEvent['newState'] = state;
  syncEvent.recordUndo = false;
  Blockly.Events.fire(syncEvent);
};
