/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2011 Google Inc.
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
 * @fileoverview Object representing a code group.
 * @author CubesterYT@Nitro-Bolt
 */
"use strict";

goog.provide("Blockly.Group");

goog.require("Blockly.ContextMenu");
goog.require("Blockly.Colours");
goog.require("Blockly.Events.GroupChange");
goog.require("Blockly.Events.GroupDragOutside");
goog.require("Blockly.Events.GroupEndDrag");
goog.require("Blockly.SystemColourPicker");
goog.require("Blockly.Touch");
goog.require("goog.dom");

/**
 * @param {!Blockly.WorkspaceSvg} workspace Owning workspace.
 * @param {!Object=} options Initial state.
 * @constructor
 */
Blockly.Group = function (workspace, options) {
  options = options || {};
  this.workspace = workspace;
  this.id =
    options.id && !workspace.getGroupById(options.id)
      ? options.id
      : Blockly.utils.genUid();
  this.setState_(options);
  this.svgGroup_ = null;
  this.dragState_ = null;
  this.pointerCleanup_ = null;
  this.pressedButton_ = null;
  this.buttonReleaseWrapper_ = null;
  this.fitTimer_ = null;
  this.workspaceChangeListener_ = this.onWorkspaceChange_.bind(this);
  workspace.addChangeListener(this.workspaceChangeListener_);
  workspace.addGroup(this);
};

/**
 * Move this group above other workspace items, with its blocks above its frame.
 * @private
 */
Blockly.Group.prototype.bringToFront_ = function () {
  if (!this.svgGroup_ || !this.workspace) return;
  const canvas = this.workspace.getCanvas();
  canvas.appendChild(this.svgGroup_);
  this.getOwnedTopBlocks_().forEach(function (block) {
    if (block.getSvgRoot()) canvas.appendChild(block.getSvgRoot());
  });
};

// Build and attach the SVG below the blocks.
Blockly.Group.prototype.initSvg = function () {
  if (this.svgGroup_) return;
  this.svgGroup_ = Blockly.utils.createSvgElement(
    "g",
    { class: "scratchGroup" },
    null
  );
  this.background_ = Blockly.utils.createSvgElement(
    "rect",
    { class: "scratchGroupBackground", rx: 4, ry: 4 },
    this.svgGroup_
  );
  this.header_ = Blockly.utils.createSvgElement(
    "rect",
    { class: "scratchGroupHeader", rx: 4, ry: 4 },
    this.svgGroup_
  );
  this.titleText_ = Blockly.utils.createSvgElement(
    "text",
    { class: "scratchGroupTitle", x: 40, y: 22 },
    this.svgGroup_
  );
  this.collapse_ = Blockly.utils.createSvgElement(
    "image",
    { class: "scratchGroupButton", x: 0, y: 0, width: 32, height: 32 },
    this.svgGroup_
  );
  this.delete_ = Blockly.utils.createSvgElement(
    "image",
    { class: "scratchGroupButton", y: 0, width: 32, height: 32 },
    this.svgGroup_
  );
  this.delete_.setAttributeNS(
    "http://www.w3.org/1999/xlink",
    "xlink:href",
    this.workspace.options.pathToMedia + "delete-x.svg"
  );
  this.colourButton_ = Blockly.utils.createSvgElement(
    "image",
    { class: "scratchGroupButton", y: 6, width: 20, height: 20 },
    this.svgGroup_
  );
  this.colourButton_.setAttributeNS(
    "http://www.w3.org/1999/xlink",
    "xlink:href",
    this.workspace.options.pathToMedia + "paintbrush.svg"
  );
  this.resizeTarget_ = Blockly.utils.createSvgElement(
    "rect",
    { class: "scratchGroupResizeTarget", width: 32, height: 32 },
    this.svgGroup_
  );
  this.resize_ = Blockly.utils.createSvgElement(
    "path",
    { class: "scratchGroupResize", d: "M0 12 L12 0 M5 12 L12 5" },
    this.svgGroup_
  );

  this.bringToFront_();
  Blockly.bindEventWithChecks_(
    this.header_,
    "mousedown",
    this,
    this.startDrag_
  );
  Blockly.bindEventWithChecks_(
    this.resize_,
    "mousedown",
    this,
    this.startResize_
  );
  Blockly.bindEventWithChecks_(
    this.resizeTarget_,
    "mousedown",
    this,
    this.startResize_
  );
  Blockly.bindEventWithChecks_(
    this.collapse_,
    "mousedown",
    this,
    this.buttonMouseDown_
  );
  Blockly.bindEventWithChecks_(
    this.collapse_,
    "mouseup",
    this,
    this.toggleCollapsed_
  );
  Blockly.bindEventWithChecks_(
    this.delete_,
    "mousedown",
    this,
    this.buttonMouseDown_
  );
  Blockly.bindEventWithChecks_(
    this.delete_,
    "mouseup",
    this,
    this.deleteGroup_
  );
  const group = this;
  this.colourControl_ = Blockly.SystemColourPicker.attach(
    this.colourButton_,
    function () {
      return group.colour;
    },
    function (colour) {
      group.setColour_(colour);
    }
  );
  Blockly.bindEventWithChecks_(
    this.svgGroup_,
    "mousedown",
    this,
    this.groupMouseDown_
  );
  Blockly.bindEventWithChecks_(
    this.svgGroup_,
    "contextmenu",
    this,
    this.showContextMenu_
  );
  this.render();
};

/**
 * Keep group interactions from starting a workspace gesture.
 * @param {!Event} e Mouse event.
 * @private
 */
Blockly.Group.prototype.groupMouseDown_ = function (e) {
  Blockly.ContextMenu.hide();
  if (e.button === 2) {
    e.preventDefault();
    e.stopPropagation();
  }
};

// Update SVG geometry.
Blockly.Group.prototype.render = function () {
  if (!this.svgGroup_) return;
  this.svgGroup_.setAttribute(
    "transform",
    "translate(" + this.x + "," + this.y + ")"
  );
  this.background_.setAttribute("width", this.width);
  this.background_.setAttribute("height", this.height);
  this.header_.setAttribute("width", this.width);
  this.header_.setAttribute("height", 32);
  this.renderTitle_();
  this.collapse_.setAttributeNS(
    "http://www.w3.org/1999/xlink",
    "xlink:href",
    this.workspace.options.pathToMedia +
      (this.collapsed ? "comment-arrow-up.svg" : "comment-arrow-down.svg")
  );
  this.delete_.setAttribute("x", this.width - 32);
  this.colourButton_.setAttribute("x", this.width - 58);
  this.colourControl_.setAttribute("x", this.width - 58);
  this.background_.style.fill = this.colour || "";
  this.background_.style.stroke = this.colour || "";
  this.header_.style.fill = this.colour || "";
  this.header_.style.stroke = this.colour || "";
  this.resize_.style.stroke = this.colour || "";
  this.titleText_.style.fill = Blockly.SystemColourPicker.isDark(this.colour)
    ? "#ffffff"
    : "";
  this.resize_.style.display = this.collapsed ? "none" : "";
  this.resizeTarget_.style.display = this.collapsed ? "none" : "";
  this.resizeTarget_.setAttribute("x", this.width - 32);
  this.resizeTarget_.setAttribute("y", this.height - 32);
  this.resize_.setAttribute(
    "transform",
    "translate(" + (this.width - 16) + "," + (this.height - 16) + ")"
  );
};

/**
 * @return {!Object} Serializable state.
 */
Blockly.Group.prototype.toJSON = function () {
  return {
    id: this.id,
    title: this.title,
    colour: this.colour,
    x: this.x,
    y: this.y,
    width: this.width,
    height: this.height,
    expandedWidth: this.collapsed ? this.expandedWidth : this.width,
    expandedHeight: this.collapsed ? this.expandedHeight : this.height,
    collapsed: this.collapsed,
    blocks: this.blockIds.slice(),
  };
};

/**
 * @param {!Object} state New state.
 */
Blockly.Group.prototype.applyState = function (state) {
  // Undo can replace the membership of a collapsed group. Release its previous
  // stacks before hiding the restored membership so removed stacks stay usable.
  if (this.collapsed) this.updateCollapsedBlocks_(false);
  this.setState_(state);
  this.render();
  this.updateCollapsedBlocks_();
  this.workspace.resizeContents();
};

/** Apply saved fields consistently during creation and undo. @private */
Blockly.Group.prototype.setState_ = function (state) {
  this.title = typeof state.title === "string" ? state.title : "Group";
  this.colour = Blockly.Colours.normalizeHex(state.colour);
  this.x = Number(state.x) || 0;
  this.y = Number(state.y) || 0;
  this.width = Math.max(Number(state.width) || 360, 160);
  this.height = Math.max(Number(state.height) || 240, 96);
  this.expandedWidth = Math.max(Number(state.expandedWidth) || this.width, 160);
  this.expandedHeight = Math.max(
    Number(state.expandedHeight) || this.height,
    96
  );
  this.collapsed = state.collapsed === true || state.collapsed === "true";
  this.blockIds = Array.isArray(state.blocks)
    ? state.blocks.slice()
    : typeof state.blocks === "string" && state.blocks.trim()
      ? state.blocks.trim().split(/\s+/)
      : [];
  if (this.collapsed) {
    this.width = 200;
    this.height = 32;
  }
};

/**
 * @return {!Element} XML representation.
 */
Blockly.Group.prototype.toXml = function () {
  const xml = goog.dom.createDom("group");
  const state = this.toJSON();
  Object.keys(state).forEach(function (key) {
    if (state[key] === null) return;
    xml.setAttribute(
      key,
      Array.isArray(state[key]) ? state[key].join(" ") : state[key]
    );
  });
  return xml;
};

/**
 * @return {!Array<!Blockly.BlockSvg>} Contained top-level stacks.
 */
Blockly.Group.prototype.getContainedBlocks = function () {
  if (this.collapsed) return this.getOwnedTopBlocks_();
  const group = this;
  return this.workspace.getTopBlocks(false).filter(function (block) {
    // Membership is exclusive. In particular, a collapsed group's hidden
    // blocks must remain its own even when another group overlaps their last
    // visible coordinates.
    if (group.workspace.getGroupForBlock(block.id, group)) return false;
    return (
      group.blockIds.indexOf(block.id) !== -1 || group.containsBlock(block)
    );
  });
};

/**
 * @return {!Array<!Blockly.BlockSvg>} Owned top-level stacks.
 */
Blockly.Group.prototype.getOwnedTopBlocks_ = function () {
  const workspace = this.workspace;
  return this.blockIds
    .map(function (id) {
      return workspace.getBlockById(id);
    })
    .filter(function (block) {
      return !!block && !block.getParent();
    });
};

/**
 * Check whether a complete top-level stack is inside this group's body.
 * @param {!Blockly.BlockSvg} block Top-level block.
 * @return {boolean} Whether the block is inside.
 */
Blockly.Group.prototype.containsBlock = function (block) {
  if (this.collapsed) return this.blockIds.indexOf(block.id) !== -1;
  const xy = block.getRelativeToSurfaceXY();
  const size = block.getHeightWidth();
  return (
    xy.x >= this.x &&
    xy.y >= this.y + 32 &&
    xy.x + size.width <= this.x + this.width &&
    xy.y + size.height <= this.y + this.height
  );
};

Blockly.Group.prototype.startDrag_ = function (e) {
  if (e.button !== 0 || this.dragState_) return;
  Blockly.ContextMenu.hide();
  e.stopPropagation();
  Blockly.utils.addClass(this.svgGroup_, "blocklyDragging");
  const blocks = this.getContainedBlocks();
  this.startPointer_(e, false, blocks);
};

Blockly.Group.prototype.startResize_ = function (e) {
  if (e.button !== 0 || this.dragState_) return;
  Blockly.ContextMenu.hide();
  e.stopPropagation();
  this.startPointer_(e, true, []);
};

Blockly.Group.prototype.startPointer_ = function (e, resizing, blocks) {
  this.bringToFront_();
  const group = this;
  const event = new Blockly.Events.GroupChange(this);
  event.recordOld(this);
  this.dragState_ = {
    clientX: e.clientX,
    clientY: e.clientY,
    x: this.x,
    y: this.y,
    width: this.width,
    height: this.height,
    resizing: resizing,
    blocks: blocks,
    blockXY: blocks.map(function (block) {
      return block.getRelativeToSurfaceXY();
    }),
    event: event,
    isOutside: false,
  };
  if (!resizing) this.moveToDragSurface_();
  const move = (moveEvent) => group.pointerMove_(moveEvent);
  const up = (upEvent) => group.finishPointer_(upEvent);
  this.pointerCleanup_ = function () {
    document.removeEventListener("mousemove", move);
    document.removeEventListener("mouseup", up);
    group.pointerCleanup_ = null;
  };
  document.addEventListener("mousemove", move);
  document.addEventListener("mouseup", up);
};

// Move the group and its blocks to Blockly's elevated drag surface.
Blockly.Group.prototype.moveToDragSurface_ = function () {
  const state = this.dragState_;
  const surface = this.workspace.getBlockDragSurface();
  if (!surface || surface.getCurrentBlock()) return;
  const wrapper = Blockly.utils.createSvgElement("g", {}, null);
  wrapper.appendChild(this.svgGroup_);
  state.blocks.forEach(function (block) {
    if (block.getSvgRoot()) wrapper.appendChild(block.getSvgRoot());
  });
  surface.setBlocksAndShow(wrapper);
  surface.translateSurface(0, 0);
  state.dragSurface = surface;
  state.dragWrapper = wrapper;
};

// Restore the group and its blocks to the normal workspace canvas.
Blockly.Group.prototype.moveOffDragSurface_ = function () {
  const state = this.dragState_;
  if (!state.dragSurface) return;
  const canvas = this.workspace.getCanvas();
  state.dragSurface.clearAndHide(canvas);
  this.bringToFront_();
  state.dragWrapper.remove();
  state.dragSurface = null;
  state.dragWrapper = null;
  this.render();
};

Blockly.Group.prototype.pointerMove_ = function (e) {
  const state = this.dragState_;
  const dx = (e.clientX - state.clientX) / this.workspace.scale;
  const dy = (e.clientY - state.clientY) / this.workspace.scale;
  if (state.resizing) {
    this.width = Math.max(160, state.width + dx);
    this.height = Math.max(96, state.height + dy);
  } else {
    this.x = state.x + dx;
    this.y = state.y + dy;
    if (state.dragSurface) {
      state.dragSurface.translateSurface(dx, dy);
    } else {
      state.blocks.forEach(function (block, index) {
        block.translate(
          state.blockXY[index].x + dx,
          state.blockXY[index].y + dy
        );
      });
    }
  }
  if (!state.resizing) {
    const isOutside = !this.workspace.isInsideBlocksArea(e);
    if (isOutside !== state.isOutside) {
      Blockly.Events.fire(new Blockly.Events.GroupDragOutside(this, isOutside));
      state.isOutside = isOutside;
    }
  }
  if (!state.dragSurface) this.render();
};

/**
 * @param {Event=} e Mouse-up event.
 */
Blockly.Group.prototype.finishPointer_ = function (e) {
  const state = this.dragState_;
  if (!state) return;
  if (this.pointerCleanup_) this.pointerCleanup_();
  this.moveOffDragSurface_();
  Blockly.utils.removeClass(this.svgGroup_, "blocklyDragging");
  const isOutside =
    !state.resizing && e && !this.workspace.isInsideBlocksArea(e);
  if (!state.resizing) {
    // Preview transforms do not change the block models. Restore them before
    // committing a move or exporting the source scripts to another target.
    state.blocks.forEach(function (block, index) {
      block.translate(state.blockXY[index].x, state.blockXY[index].y);
    });
    Blockly.Events.fire(new Blockly.Events.GroupDragOutside(this, false));
  }
  if (isOutside) {
    // An outside drop copies scripts to another target. Cancel the source
    // preview directly, preserving its undo and redo history.
    this.x = state.x;
    this.y = state.y;
    this.render();
    Blockly.Events.fire(new Blockly.Events.GroupEndDrag(this, true));
    this.dragState_ = null;
    this.workspace.resizeContents();
    return;
  }
  if (!state.resizing && e && this.workspace.isDeleteArea(e)) {
    Blockly.Events.fire(new Blockly.Events.GroupEndDrag(this, false));
    const procedureCodes = state.blocks
      .filter(function (block) {
        return block.type == Blockly.PROCEDURES_DEFINITION_BLOCK_TYPE;
      })
      .map(function (block) {
        const prototype = block
          .getInput("custom_block")
          .connection.targetBlock();
        return prototype && prototype.getProcCode();
      })
      .filter(function (procCode) {
        return !!procCode;
      });
    const deleteWorkspace = this.workspace;
    this.x = state.x;
    this.y = state.y;
    this.render();
    this.dragState_ = null;
    // Validate before deleting so a rejected deletion never touches history.
    const hasOrphanedCall =
      procedureCodes.length &&
      deleteWorkspace.getAllBlocks().some(function (block) {
        return (
          block.type == Blockly.PROCEDURES_CALL_BLOCK_TYPE &&
          procedureCodes.indexOf(block.getProcCode()) !== -1 &&
          state.blocks.indexOf(block.getRootBlock()) === -1
        );
      });
    if (hasOrphanedCall) {
      alert(Blockly.Msg.PROCEDURE_USED);
      deleteWorkspace.resizeContents();
      return;
    }
    const previousGroup = Blockly.Events.getGroup();
    if (!previousGroup) Blockly.Events.setGroup(true);
    try {
      state.blocks.forEach(function (block) {
        if (block.workspace) block.dispose(false, true);
      });
      this.dispose(true);
    } finally {
      Blockly.Events.setGroup(previousGroup);
    }
    if (procedureCodes.length) {
      deleteWorkspace.refreshToolboxSelection_();
    }
    return;
  }
  const previousGroup = Blockly.Events.getGroup();
  if (!previousGroup) Blockly.Events.setGroup(true);
  try {
    if (!state.resizing) {
      const dx = this.x - state.x;
      const dy = this.y - state.y;
      state.blocks.forEach(function (block) {
        block.moveBy(dx, dy);
      });
    }
    if (!this.collapsed) {
      this.blockIds = this.getContainedBlocks().map(function (block) {
        return block.id;
      });
      if (!state.resizing) this.bringToFront_();
    }
    state.event.recordNew(this);
    state.event.group = Blockly.Events.getGroup();
    Blockly.Events.fire(state.event);
  } finally {
    Blockly.Events.setGroup(previousGroup);
  }
  this.dragState_ = null;
  this.workspace.resizeContents();
  if (!state.resizing)
    Blockly.Events.fire(new Blockly.Events.GroupEndDrag(this, false));
};

/**
 * Prevent title-bar buttons from starting a drag before mouse-up.
 * @param {!Event} e Mouse-down event.
 */
Blockly.Group.prototype.buttonMouseDown_ = function (e) {
  if (e.button !== 0) return;
  e.preventDefault();
  e.stopPropagation();
  this.pressedButton_ = e.currentTarget;
  if (this.buttonReleaseWrapper_) {
    Blockly.unbindEvent_(this.buttonReleaseWrapper_);
  }
  this.buttonReleaseWrapper_ = Blockly.bindEventWithChecks_(
    document,
    "mouseup",
    this,
    function () {
      this.pressedButton_ = null;
      Blockly.unbindEvent_(this.buttonReleaseWrapper_);
      this.buttonReleaseWrapper_ = null;
    }
  );
};

/**
 * Check that a title-bar mouse-up belongs to a click started on that button.
 * @param {!Event} e Mouse-up event.
 * @return {boolean} Whether the button should be activated.
 * @private
 */
Blockly.Group.prototype.isButtonClick_ = function (e) {
  if (e.button !== 0 || this.pressedButton_ !== e.currentTarget) return false;
  this.pressedButton_ = null;
  if (this.buttonReleaseWrapper_) {
    Blockly.unbindEvent_(this.buttonReleaseWrapper_);
    this.buttonReleaseWrapper_ = null;
  }
  return true;
};

/** Render the title without allowing it to overlap the title-bar buttons. @private */
Blockly.Group.prototype.renderTitle_ = function () {
  const title = this.title;
  const availableWidth = Math.max(0, this.width - 104);
  this.titleText_.textContent = title;
  if (this.titleText_.getComputedTextLength() <= availableWidth) return;
  let low = 0;
  let high = title.length;
  const ellipsis = "\u2026";
  while (low < high) {
    const length = Math.ceil((low + high) / 2);
    const candidate = this.workspace.RTL
      ? ellipsis + title.slice(0, length)
      : title.slice(0, length) + ellipsis;
    this.titleText_.textContent = candidate;
    if (this.titleText_.getComputedTextLength() <= availableWidth) {
      low = length;
    } else {
      high = length - 1;
    }
  }
  this.titleText_.textContent = this.workspace.RTL
    ? ellipsis + title.slice(0, low)
    : title.slice(0, low) + ellipsis;
};

/** @param {string} colour Selected colour. @private */
Blockly.Group.prototype.setColour_ = function (colour) {
  const group = this;
  colour = Blockly.Colours.normalizeHex(colour);
  if (colour === group.colour) return;
  const event = new Blockly.Events.GroupChange(group);
  event.recordOld(group);
  group.colour = colour;
  group.render();
  event.recordNew(group);
  Blockly.Events.fire(event);
};

/**
 * Adopt stacks and expand this group once to contain their combined bounds.
 * @param {!Array.<!Blockly.BlockSvg>} blocks Top-level stacks.
 */
Blockly.Group.prototype.fitBlocks = function (blocks) {
  if (!blocks.length || this.collapsed) return;
  const padding = 16;
  let left = this.x;
  let top = this.y;
  let right = this.x + this.width;
  let bottom = this.y + this.height;
  let ownsAllBlocks = true;
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const bounds = block.getBoundingRectangle();
    left = Math.min(left, bounds.topLeft.x - padding);
    top = Math.min(top, bounds.topLeft.y - 32 - padding);
    right = Math.max(right, bounds.bottomRight.x + padding);
    bottom = Math.max(bottom, bounds.bottomRight.y + padding);
    if (this.blockIds.indexOf(block.id) === -1) ownsAllBlocks = false;
  }
  if (
    left === this.x &&
    top === this.y &&
    right === this.x + this.width &&
    bottom === this.y + this.height &&
    ownsAllBlocks
  ) {
    return;
  }
  const event = new Blockly.Events.GroupChange(this);
  event.recordOld(this);
  this.x = left;
  this.y = top;
  this.width = right - left;
  this.height = bottom - top;
  this.expandedWidth = this.width;
  this.expandedHeight = this.height;
  for (let i = 0; i < blocks.length; i++) {
    if (this.blockIds.indexOf(blocks[i].id) === -1) {
      this.blockIds.push(blocks[i].id);
    }
  }
  this.render();
  event.recordNew(this);
  Blockly.Events.fire(event);
  this.workspace.resizeContents();
};

/**
 * Remeasure owned stacks after block edits and mutations finish rendering.
 * @param {Blockly.Events.Abstract=} event Workspace event.
 */
Blockly.Group.prototype.onWorkspaceChange_ = function (event) {
  if (
    event &&
    [
      Blockly.Events.BLOCK_CREATE,
      Blockly.Events.BLOCK_CHANGE,
      Blockly.Events.BLOCK_MOVE,
      Blockly.Events.BLOCK_DELETE,
    ].indexOf(event.type) === -1
  )
    return;
  if (this.collapsed || this.dragState_) return;
  if (this.fitTimer_) clearTimeout(this.fitTimer_);
  const group = this;
  const eventGroup = event ? event.group : Blockly.Events.getGroup();
  const recordUndo = event ? event.recordUndo : Blockly.Events.recordUndo;
  this.fitTimer_ = setTimeout(function () {
    group.fitTimer_ = null;
    if (!group.workspace || group.collapsed || group.dragState_) return;
    const previousGroup = Blockly.Events.getGroup();
    const previousRecordUndo = Blockly.Events.recordUndo;
    Blockly.Events.setGroup(eventGroup);
    Blockly.Events.recordUndo = recordUndo;
    try {
      group.fitBlocks(group.getOwnedTopBlocks_());
    } finally {
      Blockly.Events.setGroup(previousGroup);
      Blockly.Events.recordUndo = previousRecordUndo;
    }
  }, 0);
};

/**
 * Move this group and all of its owned stacks by the same offset.
 * @param {number} dx Horizontal offset.
 * @param {number} dy Vertical offset.
 */
Blockly.Group.prototype.moveBy = function (dx, dy) {
  if (!dx && !dy) return;
  const event = new Blockly.Events.GroupChange(this);
  event.recordOld(this);
  this.getOwnedTopBlocks_().forEach(function (block) {
    block.moveBy(dx, dy);
  });
  this.x += dx;
  this.y += dy;
  this.render();
  event.recordNew(this);
  Blockly.Events.fire(event);
  this.workspace.resizeContents();
};

Blockly.Group.prototype.rename_ = function (e) {
  e.stopPropagation();
  const group = this;
  Blockly.prompt(
    Blockly.Msg.RENAME_GROUP_TITLE,
    this.title,
    function (title) {
      if (!group.workspace || typeof title !== "string") return;
      title = title.trim();
      if (!title || title === group.title) return;
      const event = new Blockly.Events.GroupChange(group);
      event.recordOld(group);
      group.title = title;
      group.render();
      event.recordNew(group);
      Blockly.Events.fire(event);
    },
    Blockly.Msg.RENAME_GROUP_MODAL_TITLE
  );
};

Blockly.Group.prototype.toggleCollapsed_ = function (e) {
  if (!this.isButtonClick_(e)) return;
  e.stopPropagation();
  const event = new Blockly.Events.GroupChange(this);
  event.recordOld(this);
  if (this.collapsed) {
    this.collapsed = false;
    this.width = this.expandedWidth;
    this.height = this.expandedHeight;
  } else {
    this.blockIds = this.getContainedBlocks().map(function (block) {
      return block.id;
    });
    this.expandedWidth = this.width;
    this.expandedHeight = this.height;
    this.collapsed = true;
    this.width = 200;
    this.height = 32;
  }
  this.updateCollapsedBlocks_();
  this.render();
  event.recordNew(this);
  Blockly.Events.fire(event);
  this.workspace.resizeContents();
};

/** @param {boolean=} opt_collapsed Visibility override when releasing stacks. */
Blockly.Group.prototype.updateCollapsedBlocks_ = function (opt_collapsed) {
  const collapsed =
    opt_collapsed === undefined ? this.collapsed : opt_collapsed;
  this.getOwnedTopBlocks_().forEach(function (block) {
    if (block.getSvgRoot()) {
      block.getSvgRoot().style.display = collapsed ? "none" : "";
      // Hide connections of blocks inside collapsed groups so other blocks
      // cannot connect to them.
      block.setConnectionsHidden(collapsed);
    }
  });
};

/**
 * Restore saved membership, recovering expanded groups from visible bounds.
 * Collapsed groups must never adopt scripts from their hidden expanded area.
 */
Blockly.Group.prototype.restoreBlocks_ = function () {
  const workspace = this.workspace;
  let validIds = this.getOwnedTopBlocks_().map(function (block) {
    return block.id;
  });
  if (!this.collapsed && !validIds.length) {
    const group = this;
    validIds = workspace
      .getTopBlocks(false)
      .filter(function (block) {
        if (workspace.getGroupForBlock(block.id, group)) return false;
        const xy = block.getRelativeToSurfaceXY();
        const size = block.getHeightWidth();
        return (
          xy.x >= group.x &&
          xy.y >= group.y + 32 &&
          xy.x + size.width <= group.x + group.width &&
          xy.y + size.height <= group.y + group.height
        );
      })
      .map(function (block) {
        return block.id;
      });
  }
  const changed = validIds.join(" ") !== this.blockIds.join(" ");
  if (changed) {
    const event = new Blockly.Events.GroupChange(this);
    event.recordOld(this);
    this.blockIds = validIds;
    event.recordNew(this);
    event.recordUndo = false;
    Blockly.Events.fire(event);
  }
  this.updateCollapsedBlocks_();
};

Blockly.Group.prototype.duplicateGroup_ = function (e, pointerEvent) {
  let duplicate;
  e.stopPropagation();
  const blocks = this.getContainedBlocks();
  const workspace = this.workspace;
  const offset = 24;
  const state = this.toJSON();
  delete state.id;
  state.x += offset;
  state.y += offset;

  const previousGroup = Blockly.Events.getGroup();
  if (!previousGroup) Blockly.Events.setGroup(true);
  try {
    const copies = blocks.map(function (block) {
      let copy;
      const xml = Blockly.Xml.blockToDom(block);
      Blockly.Events.disable();
      try {
        copy = Blockly.Xml.domToBlock(xml, workspace);
        Blockly.scratchBlocksUtils.changeObscuredShadowIds(copy);
        const xy = block.getRelativeToSurfaceXY();
        copy.moveBy(xy.x + offset, xy.y + offset);
      } finally {
        Blockly.Events.enable();
      }
      if (Blockly.Events.isEnabled() && !copy.isShadow()) {
        Blockly.Events.fire(new Blockly.Events.BlockCreate(copy));
      }
      return copy;
    });
    state.blocks = copies.map(function (block) {
      return block.id;
    });
    duplicate = Blockly.Group.fromJSON(workspace, state, true);
  } finally {
    Blockly.Events.setGroup(previousGroup);
  }
  if (
    pointerEvent &&
    Blockly.Touch.getTouchIdentifierFromEvent(pointerEvent) === "mouse"
  ) {
    duplicate.startDrag_({
      button: 0,
      clientX: pointerEvent.clientX,
      clientY: pointerEvent.clientY,
      stopPropagation: function () {
        e.stopPropagation();
      },
    });
  }
};

Blockly.Group.prototype.deleteGroup_ = function (e) {
  if (!this.isButtonClick_(e)) return;
  e.stopPropagation();
  this.dispose(true);
};

Blockly.Group.prototype.showContextMenu_ = function (e) {
  e.preventDefault();
  e.stopPropagation();
  Blockly.ContextMenu.currentGroup = this;
  Blockly.ContextMenu.show(
    e,
    [
      Blockly.ContextMenu.groupRenameOption(this),
      Blockly.ContextMenu.groupDuplicateOption(this, e),
      Blockly.ContextMenu.groupDeleteOption(this),
    ],
    this.workspace.RTL
  );
};

Blockly.Group.prototype.dispose = function (fireEvent) {
  if (!this.workspace) return;
  clearTimeout(this.fitTimer_);
  if (this.pointerCleanup_) this.pointerCleanup_();
  if (this.dragState_) {
    this.moveOffDragSurface_();
    this.dragState_.blocks.forEach(function (block, index) {
      const xy = this.dragState_.blockXY[index];
      block.translate(xy.x, xy.y);
    }, this);
    this.x = this.dragState_.x;
    this.y = this.dragState_.y;
    this.width = this.dragState_.width;
    this.height = this.dragState_.height;
    this.dragState_ = null;
  }
  if (this.buttonReleaseWrapper_) {
    Blockly.unbindEvent_(this.buttonReleaseWrapper_);
    this.buttonReleaseWrapper_ = null;
  }
  this.workspace.removeChangeListener(this.workspaceChangeListener_);
  if (fireEvent && Blockly.Events.isEnabled()) {
    const event = new Blockly.Events.GroupChange(this);
    event.recordOld(this);
    event["newState"] = null;
    Blockly.Events.fire(event);
  }
  this.updateCollapsedBlocks_(false);
  if (this.svgGroup_) this.svgGroup_.remove();
  this.workspace.removeGroup(this);
  this.workspace = null;
};

/**
 * @param {!Blockly.WorkspaceSvg} workspace Workspace.
 * @param {!Object} state State.
 * @param {boolean} fireEvent Whether to emit a creation event.
 * @return {!Blockly.Group} The new group.
 */
Blockly.Group.fromJSON = function (workspace, state, fireEvent) {
  const group = new Blockly.Group(workspace, state);
  group.initSvg();
  if (fireEvent && !group.blockIds.length && !group.collapsed) {
    group.blockIds = group.getContainedBlocks().map(function (block) {
      return block.id;
    });
  }
  group.updateCollapsedBlocks_();
  if (fireEvent && Blockly.Events.isEnabled()) {
    const event = new Blockly.Events.GroupChange(group);
    event["oldState"] = null;
    Blockly.Events.fire(event);
  }
  return group;
};
