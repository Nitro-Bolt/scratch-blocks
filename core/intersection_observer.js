"use strict";

goog.provide("Blockly.IntersectionObserver");

Blockly.IntersectionObserver = function (workspace) {
  this.workspace = workspace;
  this.observing = [];
  this.intersectionCheckQueued = false;
  this.checkForIntersections = this.checkForIntersections.bind(this);
};

Blockly.IntersectionObserver.prototype.observe = function (block) {
  const index = this.observing.indexOf(block);
  if (index === -1) {
    this.observing.push(block);
  }
};

Blockly.IntersectionObserver.prototype.unobserve = function (block) {
  const index = this.observing.indexOf(block);
  if (index !== -1) {
    this.observing = this.observing.filter((item) => item !== block);
  }
};

Blockly.IntersectionObserver.prototype.dispose = function () {
  this.observing = [];
  this.workspace = null;
};

Blockly.IntersectionObserver.prototype.queueIntersectionCheck = function () {
  if (this.intersectionCheckQueued) {
    return;
  }
  this.intersectionCheckQueued = true;
  // Check for intersections on the next microtask.
  queueMicrotask(this.checkForIntersections);
};

Blockly.IntersectionObserver.prototype.checkForIntersections = function () {
  this.intersectionCheckQueued = false;

  if (!this.workspace) {
    return;
  }

  const workspace = this.workspace;
  const workspaceScale = workspace.scale;
  const RTL = workspace.RTL;
  const workspaceHeight = workspace.getParentSvg().height.baseVal.value;
  const workspaceWidth = workspace.getParentSvg().width.baseVal.value;
  const canvas = workspace.isDragSurfaceActive_
    ? workspace.workspaceDragSurface_.SVG_
    : workspace.getCanvas();
  const canvasPos = Blockly.utils.getRelativeXY(canvas);

  // Allow blocks to go slightly offscreen so that effects such as glow do not get cut off.
  const margin = 12 * workspaceScale;

  for (let i = 0; i < this.observing.length; i++) {
    const block = this.observing[i];
    const blockPos = block.getRelativeToSurfaceXY();
    let blockSize = null;
    if (RTL) {
      blockSize = block.getHeightWidth();
      blockPos.x -= blockSize.width;
      blockSize.width *= workspaceScale;
      blockSize.height *= workspaceScale;
    }
    blockPos.x *= workspaceScale;
    blockPos.y *= workspaceScale;

    let visible = true;
    if (canvasPos.y + blockPos.y - margin > workspaceHeight) {
      visible = false;
    } else if (canvasPos.x + blockPos.x - margin > workspaceWidth) {
      visible = false;
    } else {
      if (!blockSize) {
        blockSize = block.getHeightWidth();
        blockSize.width *= workspaceScale;
        blockSize.height *= workspaceScale;
      }
      if (canvasPos.x + blockPos.x + blockSize.width + margin < 0) {
        visible = false;
      } else if (canvasPos.y + blockPos.y + blockSize.height + margin < 0) {
        visible = false;
      }
    }

    block.setIntersects(visible);
  }
};
