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
'use strict';

goog.provide('Blockly.Group');

goog.require('Blockly.ContextMenu');
goog.require('Blockly.Events.GroupChange');
goog.require('Blockly.Events.GroupDragOutside');
goog.require('Blockly.Events.GroupEndDrag');
goog.require('Blockly.Touch');
goog.require('goog.dom');
goog.require('goog.math.Coordinate');

/**
 * @param {!Blockly.WorkspaceSvg} workspace Owning workspace.
 * @param {!Object=} options Initial state.
 * @constructor
 */
Blockly.Group = function(workspace, options) {
  options = options || {};
  this.workspace = workspace;
  this.id = options.id && !workspace.getGroupById(options.id) ?
      options.id : Blockly.utils.genUid();
  this.title = options.title || 'Group';
  this.x = Number(options.x) || 0;
  this.y = Number(options.y) || 0;
  this.width = Math.max(Number(options.width) || 360, 160);
  this.height = Math.max(Number(options.height) || 240, 96);
  this.expandedHeight = Math.max(Number(options.expandedHeight) || this.height, 96);
  this.collapsed = options.collapsed === true || options.collapsed === 'true';
  this.blockIds = Array.isArray(options.blocks) ? options.blocks.slice() :
      (typeof options.blocks === 'string' && options.blocks ? options.blocks.split(' ') : []);
  if (this.collapsed) this.height = 32;
  this.svgGroup_ = null;
  this.dragState_ = null;
  this.fitTimer_ = null;
  this.workspaceChangeListener_ = this.onWorkspaceChange_.bind(this);
  workspace.addChangeListener(this.workspaceChangeListener_);
  workspace.addGroup(this);
};

// Build and attach the SVG below the blocks.
Blockly.Group.prototype.initSvg = function() {
  if (this.svgGroup_) return;
  this.svgGroup_ = Blockly.utils.createSvgElement('g',
      {'class': 'scratchGroup'}, null);
  this.background_ = Blockly.utils.createSvgElement('rect',
      {'class': 'scratchGroupBackground', rx: 4, ry: 4}, this.svgGroup_);
  this.header_ = Blockly.utils.createSvgElement('rect',
      {'class': 'scratchGroupHeader', rx: 4, ry: 4}, this.svgGroup_);
  this.titleText_ = Blockly.utils.createSvgElement('text',
      {'class': 'scratchGroupTitle', x: 40, y: 22}, this.svgGroup_);
  this.collapse_ = Blockly.utils.createSvgElement('image',
      {'class': 'scratchGroupButton', x: 0, y: 0, width: 32, height: 32},
      this.svgGroup_);
  this.delete_ = Blockly.utils.createSvgElement('image',
      {'class': 'scratchGroupButton', y: 0, width: 32, height: 32},
      this.svgGroup_);
  this.delete_.setAttributeNS('http://www.w3.org/1999/xlink',
      'xlink:href', this.workspace.options.pathToMedia + 'delete-x.svg');
  this.resizeTarget_ = Blockly.utils.createSvgElement('rect',
      {'class': 'scratchGroupResizeTarget', width: 32, height: 32},
      this.svgGroup_);
  this.resize_ = Blockly.utils.createSvgElement('path',
      {'class': 'scratchGroupResize', d: 'M0 12 L12 0 M5 12 L12 5'}, this.svgGroup_);

  var canvas = this.workspace.getCanvas();
  canvas.insertBefore(this.svgGroup_, canvas.firstChild);
  Blockly.bindEventWithChecks_(this.header_, 'mousedown', this,
      this.startDrag_);
  Blockly.bindEventWithChecks_(this.resize_, 'mousedown', this,
      this.startResize_);
  Blockly.bindEventWithChecks_(this.resizeTarget_, 'mousedown', this,
      this.startResize_);
  Blockly.bindEventWithChecks_(this.collapse_, 'mousedown', this,
      this.buttonMouseDown_);
  Blockly.bindEventWithChecks_(this.collapse_, 'mouseup', this,
      this.toggleCollapsed_);
  Blockly.bindEventWithChecks_(this.delete_, 'mousedown', this,
      this.buttonMouseDown_);
  Blockly.bindEventWithChecks_(this.delete_, 'mouseup', this,
      this.deleteGroup_);
  Blockly.bindEventWithChecks_(this.svgGroup_, 'mousedown', this,
      this.groupMouseDown_);
  Blockly.bindEventWithChecks_(this.svgGroup_, 'contextmenu', this,
      this.showContextMenu_);
  this.render();
};

/**
 * Keep group interactions from starting a workspace gesture.
 * @param {!Event} e Mouse event.
 * @private
 */
Blockly.Group.prototype.groupMouseDown_ = function(e) {
  Blockly.ContextMenu.hide();
  if (e.button === 2) {
    e.preventDefault();
    e.stopPropagation();
  }
};

// Update SVG geometry.
Blockly.Group.prototype.render = function() {
  if (!this.svgGroup_) return;
  this.svgGroup_.setAttribute('transform', 'translate(' + this.x + ',' + this.y + ')');
  this.background_.setAttribute('width', this.width);
  this.background_.setAttribute('height', this.height);
  this.header_.setAttribute('width', this.width);
  this.header_.setAttribute('height', 32);
  this.titleText_.textContent = this.title;
  this.collapse_.setAttributeNS('http://www.w3.org/1999/xlink',
      'xlink:href', this.workspace.options.pathToMedia +
      (this.collapsed ? 'comment-arrow-up.svg' : 'comment-arrow-down.svg'));
  this.delete_.setAttribute('x', this.width - 32);
  this.resize_.style.display = this.collapsed ? 'none' : '';
  this.resizeTarget_.style.display = this.collapsed ? 'none' : '';
  this.resizeTarget_.setAttribute('x', this.width - 32);
  this.resizeTarget_.setAttribute('y', this.height - 32);
  this.resize_.setAttribute('transform',
      'translate(' + (this.width - 16) + ',' + (this.height - 16) + ')');
};

/**
 * @return {!Object} Serializable state.
 */
Blockly.Group.prototype.toJSON = function() {
  return {id: this.id, title: this.title, x: this.x, y: this.y,
    width: this.width, height: this.height, expandedHeight: this.expandedHeight,
    collapsed: this.collapsed, blocks: this.blockIds.slice()};
};

/**
 * @param {!Object} state New state.
 */
Blockly.Group.prototype.applyState = function(state) {
  this.title = state.title;
  this.x = Number(state.x);
  this.y = Number(state.y);
  this.width = Number(state.width);
  this.height = Number(state.height);
  this.expandedHeight = Number(state.expandedHeight) || this.height;
  this.collapsed = state.collapsed === true || state.collapsed === 'true';
  this.blockIds = Array.isArray(state.blocks) ? state.blocks.slice() :
      (typeof state.blocks === 'string' && state.blocks ? state.blocks.split(' ') : []);
  this.render();
  this.updateCollapsedBlocks_();
};

/**
 * @return {!Element} XML representation.
 */
Blockly.Group.prototype.toXml = function() {
  var xml = goog.dom.createDom('group');
  var state = this.toJSON();
  Object.keys(state).forEach(function(key) {
    xml.setAttribute(key, Array.isArray(state[key]) ? state[key].join(' ') : state[key]);
  });
  return xml;
};

/**
 * @return {!Array<!Blockly.BlockSvg>} Contained top-level stacks.
 */
Blockly.Group.prototype.getContainedBlocks = function() {
  if (this.collapsed && this.blockIds.length) {
    var workspace = this.workspace;
    return this.blockIds.map(function(id) { return workspace.getBlockById(id); })
        .filter(function(block) { return !!block; });
  }
  var group = this;
  return this.workspace.getTopBlocks(false).filter(function(block) {
    // Membership is exclusive. In particular, a collapsed group's hidden
    // blocks must remain its own even when another group overlaps their last
    // visible coordinates.
    if (group.workspace.getGroupForBlock(block.id, group)) return false;
    return group.containsBlock(block);
  });
};

/**
 * @return {!Array<!Blockly.BlockSvg>} Owned top-level stacks.
 */
Blockly.Group.prototype.getOwnedTopBlocks_ = function() {
  var workspace = this.workspace;
  return this.blockIds.map(function(id) {
    return workspace.getBlockById(id);
  }).filter(function(block) {
    return !!block && !block.getParent();
  });
};

/**
 * Check whether a complete top-level stack is inside this group's body.
 * @param {!Blockly.BlockSvg} block Top-level block.
 * @return {boolean} Whether the block is inside.
 */
Blockly.Group.prototype.containsBlock = function(block) {
  if (this.collapsed) return this.blockIds.indexOf(block.id) !== -1;
  var xy = block.getRelativeToSurfaceXY();
  var size = block.getHeightWidth();
  return xy.x >= this.x && xy.y >= this.y + 32 &&
      xy.x + size.width <= this.x + this.width &&
      xy.y + size.height <= this.y + this.height;
};

Blockly.Group.prototype.startDrag_ = function(e) {
  if (e.button !== 0) return;
  Blockly.ContextMenu.hide();
  e.stopPropagation();
  Blockly.utils.addClass(this.svgGroup_, 'blocklyDragging');
  var blocks = this.getContainedBlocks();
  this.blockIds = blocks.map(function(block) { return block.id; });
  this.startPointer_(e, false, blocks);
};

Blockly.Group.prototype.startResize_ = function(e) {
  if (e.button !== 0) return;
  Blockly.ContextMenu.hide();
  e.stopPropagation();
  this.startPointer_(e, true, []);
};

Blockly.Group.prototype.startPointer_ = function(e, resizing, blocks) {
  var group = this;
  var event = new Blockly.Events.GroupChange(this);
  event.recordOld(this);
  this.dragState_ = {clientX: e.clientX, clientY: e.clientY,
    x: this.x, y: this.y, width: this.width, height: this.height,
    resizing: resizing, blocks: blocks,
    blockXY: blocks.map(function(block) { return block.getRelativeToSurfaceXY(); }),
    event: event, isOutside: false};
  if (!resizing) this.moveToDragSurface_();
  var move = function(moveEvent) { group.pointerMove_(moveEvent); };
  var up = function(upEvent) {
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', up);
    group.finishPointer_(upEvent);
  };
  document.addEventListener('mousemove', move);
  document.addEventListener('mouseup', up);
};

// Move the group and its blocks to Blockly's elevated drag surface.
Blockly.Group.prototype.moveToDragSurface_ = function() {
  var state = this.dragState_;
  var surface = this.workspace.getBlockDragSurface();
  if (!surface || surface.getCurrentBlock()) return;
  var wrapper = Blockly.utils.createSvgElement('g', {}, null);
  wrapper.appendChild(this.svgGroup_);
  state.blocks.forEach(function(block) {
    if (block.getSvgRoot()) wrapper.appendChild(block.getSvgRoot());
  });
  surface.setBlocksAndShow(wrapper);
  surface.translateSurface(0, 0);
  state.dragSurface = surface;
  state.dragWrapper = wrapper;
};

// Restore the group and its blocks to the normal workspace canvas.
Blockly.Group.prototype.moveOffDragSurface_ = function() {
  var state = this.dragState_;
  if (!state.dragSurface) return;
  var canvas = this.workspace.getCanvas();
  state.dragSurface.clearAndHide(canvas);
  canvas.insertBefore(this.svgGroup_, canvas.firstChild);
  state.blocks.forEach(function(block) {
    if (block.getSvgRoot()) canvas.appendChild(block.getSvgRoot());
  });
  goog.dom.removeNode(state.dragWrapper);
  state.dragSurface = null;
  state.dragWrapper = null;
  this.render();
};

Blockly.Group.prototype.pointerMove_ = function(e) {
  var state = this.dragState_;
  var dx = (e.clientX - state.clientX) / this.workspace.scale;
  var dy = (e.clientY - state.clientY) / this.workspace.scale;
  if (state.resizing) {
    this.width = Math.max(160, state.width + dx);
    this.height = Math.max(96, state.height + dy);
  } else {
    this.x = state.x + dx;
    this.y = state.y + dy;
    if (state.dragSurface) {
      state.dragSurface.translateSurface(dx, dy);
    } else {
      state.blocks.forEach(function(block, index) {
        block.translate(state.blockXY[index].x + dx, state.blockXY[index].y + dy);
      });
    }
  }
  if (!state.resizing) {
    var isOutside = !this.workspace.isInsideBlocksArea(e);
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
Blockly.Group.prototype.finishPointer_ = function(e) {
  var state = this.dragState_;
  if (!state) return;
  this.moveOffDragSurface_();
  Blockly.utils.removeClass(this.svgGroup_, 'blocklyDragging');
  var isOutside = !state.resizing && e && !this.workspace.isInsideBlocksArea(e);
  if (!state.resizing) {
    Blockly.Events.fire(new Blockly.Events.GroupDragOutside(this, false));
    var endEvent = new Blockly.Events.GroupEndDrag(this, isOutside);
    // The block models still have their pre-drag coordinates at this point.
    // Use the matching frame coordinates so their relative layout is retained.
    endEvent['groupState'].x = state.x;
    endEvent['groupState'].y = state.y;
    Blockly.Events.fire(endEvent);
  }
  if (!state.resizing && e && this.workspace.isDeleteArea(e)) {
    state.blocks.forEach(function(block, index) {
      block.translate(state.blockXY[index].x, state.blockXY[index].y);
    });
    this.x = state.x;
    this.y = state.y;
    this.render();
    this.dragState_ = null;
    Blockly.Events.setGroup(true);
    try {
      state.blocks.forEach(function(block) {
        if (block.workspace) block.dispose(false, true);
      });
      this.dispose(true);
    } finally {
      Blockly.Events.setGroup(false);
    }
    return;
  }
  if (!state.resizing) {
    var dx = this.x - state.x;
    var dy = this.y - state.y;
    Blockly.Events.setGroup(true);
    state.blocks.forEach(function(block, index) {
      // pointerMove_ previews the final position by changing the SVG transform.
      // Restore the recorded position before committing so moveBy measures from
      // the real origin instead of applying the drag delta a second time.
      block.translate(state.blockXY[index].x, state.blockXY[index].y);
      block.moveBy(dx, dy);
    });
  } else {
    Blockly.Events.setGroup(true);
  }
  if (!this.collapsed) {
    this.blockIds = this.getContainedBlocks().map(function(block) {
      return block.id;
    });
  }
  state.event.recordNew(this);
  state.event.group = Blockly.Events.getGroup();
  Blockly.Events.fire(state.event);
  Blockly.Events.setGroup(false);
  this.dragState_ = null;
  if (isOutside) {
    var workspace = this.workspace;
    var groupId = this.id;
    setTimeout(function() {
      workspace.undo();
      var group = workspace.getGroupById(groupId);
      if (group && group.collapsed) group.updateCollapsedBlocks_();
    }, 0);
  }
};

/**
 * Prevent title-bar buttons from starting a drag before mouse-up.
 * @param {!Event} e Mouse-down event.
 */
Blockly.Group.prototype.buttonMouseDown_ = function(e) {
  e.preventDefault();
  e.stopPropagation();
};

/**
 * Adopt a stack and expand this group just enough to contain it.
 * @param {!Blockly.BlockSvg} block Top-level stack.
 */
Blockly.Group.prototype.fitBlock = function(block) {
  var bounds = block.getBoundingRectangle();
  var padding = 16;
  var left = Math.min(this.x, bounds.topLeft.x - padding);
  var top = Math.min(this.y, bounds.topLeft.y - 32 - padding);
  var right = Math.max(this.x + this.width,
      bounds.bottomRight.x + padding);
  var bottom = Math.max(this.y + this.height,
      bounds.bottomRight.y + padding);
  var ownsBlock = this.blockIds.indexOf(block.id) !== -1;
  if (left === this.x && top === this.y &&
      right === this.x + this.width && bottom === this.y + this.height &&
      ownsBlock) {
    return;
  }
  var event = new Blockly.Events.GroupChange(this);
  event.recordOld(this);
  this.x = left;
  this.y = top;
  this.width = right - left;
  this.height = bottom - top;
  this.expandedHeight = this.height;
  if (this.blockIds.indexOf(block.id) === -1) this.blockIds.push(block.id);
  this.render();
  event.recordNew(this);
  Blockly.Events.fire(event);
};

/**
 * Remeasure owned stacks after block edits and mutations finish rendering.
 * @param {Blockly.Events.Abstract=} event Workspace event.
 */
Blockly.Group.prototype.onWorkspaceChange_ = function(event) {
  if (event && ['dragOutside', 'endDrag', 'group_drag_outside',
    'group_end_drag'].indexOf(event.type) !== -1) return;
  if (this.collapsed || this.dragState_) return;
  if (this.fitTimer_) clearTimeout(this.fitTimer_);
  var group = this;
  this.fitTimer_ = setTimeout(function() {
    group.fitTimer_ = null;
    if (!group.workspace || group.collapsed) return;
    group.blockIds.slice().forEach(function(id) {
      var block = group.workspace.getBlockById(id);
      if (block && !block.getParent()) group.fitBlock(block);
    });
  }, 0);
};

/**
 * Move this group and all of its owned stacks by the same offset.
 * @param {number} dx Horizontal offset.
 * @param {number} dy Vertical offset.
 */
Blockly.Group.prototype.moveBy = function(dx, dy) {
  if (!dx && !dy) return;
  var event = new Blockly.Events.GroupChange(this);
  event.recordOld(this);
  var workspace = this.workspace;
  this.blockIds.forEach(function(id) {
    var block = workspace.getBlockById(id);
    if (block && !block.getParent()) block.moveBy(dx, dy);
  });
  this.x += dx;
  this.y += dy;
  this.render();
  event.recordNew(this);
  Blockly.Events.fire(event);
};

Blockly.Group.prototype.rename_ = function(e) {
  e.stopPropagation();
  var title = window.prompt('Group name', this.title);
  if (title === null || !title.trim() || title === this.title) return;
  var event = new Blockly.Events.GroupChange(this);
  event.recordOld(this);
  this.title = title.trim();
  this.render();
  event.recordNew(this);
  Blockly.Events.fire(event);
};

Blockly.Group.prototype.toggleCollapsed_ = function(e) {
  e.stopPropagation();
  var event = new Blockly.Events.GroupChange(this);
  event.recordOld(this);
  if (this.collapsed) {
    this.collapsed = false;
    this.height = this.expandedHeight;
  } else {
    var ids = this.blockIds.filter(function(id) {
      return !!this.workspace.getBlockById(id);
    }, this);
    this.getContainedBlocks().forEach(function(block) {
      if (ids.indexOf(block.id) === -1) ids.push(block.id);
    });
    this.blockIds = ids;
    this.expandedHeight = this.height;
    this.collapsed = true;
    this.height = 32;
  }
  this.updateCollapsedBlocks_();
  this.render();
  event.recordNew(this);
  Blockly.Events.fire(event);
};

Blockly.Group.prototype.updateCollapsedBlocks_ = function() {
  var workspace = this.workspace;
  this.blockIds.forEach(function(id) {
    var block = workspace.getBlockById(id);
    if (block && block.getSvgRoot()) {
      block.getSvgRoot().style.display = this.collapsed ? 'none' : '';
    }
  }, this);
};

/**
 * Recover membership for collapsed groups saved without usable block IDs.
 * Uses the group's saved expanded bounds, which still surround the scripts.
 */
Blockly.Group.prototype.restoreCollapsedBlocks_ = function() {
  if (!this.collapsed) return;
  var workspace = this.workspace;
  var validIds = this.blockIds.filter(function(id) {
    return !!workspace.getBlockById(id);
  });
  if (!validIds.length) {
    var group = this;
    validIds = workspace.getTopBlocks(false).filter(function(block) {
      if (workspace.getGroupForBlock(block.id, group)) return false;
      var xy = block.getRelativeToSurfaceXY();
      var size = block.getHeightWidth();
      return xy.x >= group.x && xy.y >= group.y + 32 &&
          xy.x + size.width <= group.x + group.width &&
          xy.y + size.height <= group.y + group.expandedHeight;
    }).map(function(block) { return block.id; });
  }
  var changed = validIds.join(' ') !== this.blockIds.join(' ');
  if (changed) {
    var event = new Blockly.Events.GroupChange(this);
    event.recordOld(this);
    this.blockIds = validIds;
    event.recordNew(this);
    Blockly.Events.fire(event);
  }
  this.updateCollapsedBlocks_();
};

Blockly.Group.prototype.duplicateGroup_ = function(e, pointerEvent) {
  e.stopPropagation();
  var blocks = this.getContainedBlocks();
  var workspace = this.workspace;
  var offset = 24;
  var state = this.toJSON();
  delete state.id;
  state.x += offset;
  state.y += offset;

  Blockly.Events.setGroup(true);
  try {
    var copies = blocks.map(function(block) {
      var xml = Blockly.Xml.blockToDom(block);
      Blockly.Events.disable();
      try {
        var copy = Blockly.Xml.domToBlock(xml, workspace);
        Blockly.scratchBlocksUtils.changeObscuredShadowIds(copy);
        var xy = block.getRelativeToSurfaceXY();
        copy.moveBy(xy.x + offset, xy.y + offset);
      } finally {
        Blockly.Events.enable();
      }
      if (Blockly.Events.isEnabled() && !copy.isShadow()) {
        Blockly.Events.fire(new Blockly.Events.BlockCreate(copy));
      }
      return copy;
    });
    state.blocks = copies.map(function(block) { return block.id; });
    var duplicate = Blockly.Group.fromJSON(workspace, state, true);
    if (duplicate.collapsed) duplicate.updateCollapsedBlocks_();
  } finally {
    Blockly.Events.setGroup(false);
  }
  if (pointerEvent &&
      Blockly.Touch.getTouchIdentifierFromEvent(pointerEvent) === 'mouse') {
    duplicate.startDrag_({
      button: 0,
      clientX: pointerEvent.clientX,
      clientY: pointerEvent.clientY,
      stopPropagation: function() { e.stopPropagation(); }
    });
  }
};

Blockly.Group.prototype.deleteGroup_ = function(e) {
  e.stopPropagation();
  this.dispose(true);
};

Blockly.Group.prototype.showContextMenu_ = function(e) {
  e.preventDefault();
  e.stopPropagation();
  Blockly.ContextMenu.show(e, [
    Blockly.ContextMenu.groupRenameOption(this),
    Blockly.ContextMenu.groupDuplicateOption(this, e),
    Blockly.ContextMenu.groupDeleteOption(this)],
  this.workspace.RTL);
};

Blockly.Group.prototype.dispose = function(fireEvent) {
  if (!this.workspace) return;
  clearTimeout(this.fitTimer_);
  this.workspace.removeChangeListener(this.workspaceChangeListener_);
  if (fireEvent && Blockly.Events.isEnabled()) {
    var event = new Blockly.Events.GroupChange(this);
    event.recordOld(this);
    event['newState'] = null;
    Blockly.Events.fire(event);
  }
  this.blockIds.forEach(function(id) {
    var block = this.workspace.getBlockById(id);
    if (block && block.getSvgRoot()) block.getSvgRoot().style.display = '';
  }, this);
  goog.dom.removeNode(this.svgGroup_);
  this.workspace.removeGroup(this);
  this.workspace = null;
};

/**
 * @param {!Blockly.WorkspaceSvg} workspace Workspace.
 * @param {!Object} state State.
 * @param {boolean} fireEvent Whether to emit a creation event.
 * @return {!Blockly.Group} The new group.
 */
Blockly.Group.fromJSON = function(workspace, state, fireEvent) {
  var group = new Blockly.Group(workspace, state);
  group.initSvg();
  setTimeout(function() {
    if (!group.workspace) return;
    if (!group.blockIds.length && !group.collapsed) {
      group.blockIds = group.getContainedBlocks().map(function(block) {
        return block.id;
      });
    }
    if (group.collapsed) group.updateCollapsedBlocks_();
  }, 0);
  if (fireEvent && Blockly.Events.isEnabled()) {
    var event = new Blockly.Events.GroupChange(group);
    event['oldState'] = null;
    Blockly.Events.fire(event);
  }
  return group;
};
