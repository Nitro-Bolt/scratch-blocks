/**
 * @license
 * Blockly Tests
 *
 * Copyright 2017 Google Inc.
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
 * @fileoverview Tests for gesture.
 * @author marisaleung@google.com (Marisa Leung)
 */
"use strict";

var e;
var workspace;

function gestureTest_setUp() {
  workspace = new Blockly.Workspace();
  e = {};
}

function gestureTest_tearDown() {
  e = null;
  workspace.dispose();
}

function test_gestureConstructor() {
  const gesture = new Blockly.Gesture(e, workspace);
  assertEquals(gesture.mostRecentEvent_, e);
  assertEquals(gesture.creatorWorkspace_, workspace);
}

function test_gestureIsField_ClickInWorkspace() {
  gestureTest_setUp();
  const block = new Blockly.Block(workspace);
  const field = new Blockly.Field();
  field.setSourceBlock(block);
  const gesture = new Blockly.Gesture(e, workspace);
  gesture.setStartField(field);

  const isFieldClick = gesture.isFieldClick_();
  assertEquals(isFieldClick, true);
  gestureTest_tearDown();
}

function gestureIsFieldClick_InFlyoutHelper(flyout, expectedResult) {
  // Assign workspace flyout
  workspace.flyout_ = flyout;
  // Create a Field inside of a Block
  const block = new Blockly.Block(workspace);
  const field = new Blockly.Field();
  field.setSourceBlock(block);
  // Create gesture from the flyout
  const gesture = new Blockly.Gesture(e, workspace.flyout_);
  // Populate gesture with click start information
  gesture.setStartField(field);
  gesture.setStartFlyout_(workspace.flyout_);

  const isFieldClick = gesture.isFieldClick_();
  assertEquals(isFieldClick, expectedResult);
}

function test_gestureIsFieldClick_AutoCloseFlyout() {
  gestureTest_setUp();
  const flyout = new Blockly.VerticalFlyout({});
  gestureIsFieldClick_InFlyoutHelper(flyout, false);
  gestureTest_tearDown();
}

function test_gestureIsFieldClick_AlwaysOpenFlyout() {
  gestureTest_setUp();
  const flyout = new Blockly.VerticalFlyout({});
  flyout.autoClose = false;
  gestureIsFieldClick_InFlyoutHelper(flyout, true);
  gestureTest_tearDown();
}
