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
"use strict";

goog.provide("Blockly.Events.GroupBase");
goog.provide("Blockly.Events.GroupChange");
goog.provide("Blockly.Events.GroupDragOutside");
goog.provide("Blockly.Events.GroupEndDrag");

goog.require("Blockly.Events");
goog.require("Blockly.Events.Abstract");
goog.require("Blockly.Xml");

/**
 * Shared workspace and script-group identity for group events.
 * @param {Blockly.Group=} group Affected group, omitted for JSON decoding.
 * @extends {Blockly.Events.Abstract}
 * @constructor
 */
Blockly.Events.GroupBase = function (group) {
  Blockly.Events.GroupBase.superClass_.constructor.call(this);
  if (group) {
    this.workspaceId = group.workspace.id;
    this["groupId"] = group.id;
  }
};
goog.inherits(Blockly.Events.GroupBase, Blockly.Events.Abstract);

/** @override */
Blockly.Events.GroupBase.prototype.toJson = function () {
  const json = Blockly.Events.GroupBase.superClass_.toJson.call(this);
  json["groupId"] = this["groupId"];
  return json;
};

/** @override */
Blockly.Events.GroupBase.prototype.fromJson = function (json) {
  Blockly.Events.GroupBase.superClass_.fromJson.call(this, json);
  this["groupId"] = json["groupId"];
};

/**
 * @param {Blockly.Group=} group Group being dragged.
 * @param {boolean=} isOutside Whether it is outside the blocks area.
 * @constructor
 */
Blockly.Events.GroupDragOutside = function (group, isOutside) {
  Blockly.Events.GroupDragOutside.superClass_.constructor.call(this, group);
  this["isOutside"] = !!isOutside;
  this.recordUndo = false;
};
goog.inherits(Blockly.Events.GroupDragOutside, Blockly.Events.GroupBase);
Blockly.Events.GroupDragOutside.prototype.type =
  Blockly.Events.GROUP_DRAG_OUTSIDE;

/** @override */
Blockly.Events.GroupDragOutside.prototype.toJson = function () {
  const json = Blockly.Events.GroupDragOutside.superClass_.toJson.call(this);
  json["isOutside"] = this["isOutside"];
  return json;
};

/** @override */
Blockly.Events.GroupDragOutside.prototype.fromJson = function (json) {
  Blockly.Events.GroupDragOutside.superClass_.fromJson.call(this, json);
  this["isOutside"] = !!json["isOutside"];
};

/**
 * @param {Blockly.Group=} group Group whose drag ended.
 * @param {boolean=} isOutside Whether it ended outside the blocks area.
 * @constructor
 */
Blockly.Events.GroupEndDrag = function (group, isOutside) {
  Blockly.Events.GroupEndDrag.superClass_.constructor.call(this, group);
  this["isOutside"] = !!isOutside;
  this.recordUndo = false;
  if (!group) return;
  const blocks = group.getOwnedTopBlocks_();
  this["groupState"] = group.toJSON();
  this["groupState"].blocks = blocks.map(function (block) {
    return block.id;
  });
  this["xmls"] = isOutside
    ? blocks.map(function (block) {
        return Blockly.Xml.blockToDomWithXY(block, true);
      })
    : [];
};
goog.inherits(Blockly.Events.GroupEndDrag, Blockly.Events.GroupBase);
Blockly.Events.GroupEndDrag.prototype.type = Blockly.Events.GROUP_END_DRAG;

/** @override */
Blockly.Events.GroupEndDrag.prototype.toJson = function () {
  const json = Blockly.Events.GroupEndDrag.superClass_.toJson.call(this);
  json["isOutside"] = this["isOutside"];
  json["groupState"] = this["groupState"];
  json["xmls"] = (this["xmls"] || []).map(function (xml) {
    return Blockly.Xml.domToText(xml);
  });
  return json;
};

/** @override */
Blockly.Events.GroupEndDrag.prototype.fromJson = function (json) {
  Blockly.Events.GroupEndDrag.superClass_.fromJson.call(this, json);
  this["isOutside"] = !!json["isOutside"];
  this["groupState"] = json["groupState"];
  this["xmls"] = (json["xmls"] || []).map(function (xml) {
    return Blockly.Xml.textToDom("<xml>" + xml + "</xml>").firstChild;
  });
};

/**
 * @param {Blockly.Group=} group Group affected by this event.
 * @constructor
 */
Blockly.Events.GroupChange = function (group) {
  Blockly.Events.GroupChange.superClass_.constructor.call(this, group);
  this["oldState"] = null;
  this["newState"] = group ? group.toJSON() : null;
};
goog.inherits(Blockly.Events.GroupChange, Blockly.Events.GroupBase);

Blockly.Events.GroupChange.prototype.type = Blockly.Events.GROUP_CHANGE;

/**
 * @override
 */
Blockly.Events.GroupChange.prototype.toJson = function () {
  const json = Blockly.Events.GroupChange.superClass_.toJson.call(this);
  json["oldState"] = this["oldState"];
  json["newState"] = this["newState"];
  return json;
};

/**
 * @override
 */
Blockly.Events.GroupChange.prototype.fromJson = function (json) {
  Blockly.Events.GroupChange.superClass_.fromJson.call(this, json);
  this["oldState"] = json["oldState"];
  this["newState"] = json["newState"];
};

/**
 * @param {Blockly.Group} group Group before the change.
 */
Blockly.Events.GroupChange.prototype.recordOld = function (group) {
  this["oldState"] = group ? group.toJSON() : null;
};

/**
 * @param {Blockly.Group} group Group after the change.
 */
Blockly.Events.GroupChange.prototype.recordNew = function (group) {
  this["newState"] = group ? group.toJSON() : null;
};

/** @override */
Blockly.Events.GroupChange.prototype.isNull = function () {
  return JSON.stringify(this["oldState"]) === JSON.stringify(this["newState"]);
};

/**
 * @override
 */
Blockly.Events.GroupChange.prototype.run = function (forward) {
  const workspace = this.getEventWorkspace_();
  const state = forward ? this["newState"] : this["oldState"];
  const group = workspace.getGroupById(this["groupId"]);
  const replayEvent = new Blockly.Events.GroupChange(group);
  replayEvent.workspaceId = this.workspaceId;
  replayEvent["groupId"] = this["groupId"];
  replayEvent.recordOld(group);
  replayEvent.recordUndo = false;
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

  // Publish the actual replayed transition to the VM without adding history.
  replayEvent.recordNew(workspace.getGroupById(this["groupId"]));
  Blockly.Events.fire(replayEvent);
};
