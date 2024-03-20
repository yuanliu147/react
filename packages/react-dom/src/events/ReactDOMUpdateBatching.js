/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  needsStateRestore,
  restoreStateIfNeeded,
} from './ReactDOMControlledComponent';

// Used as a way to call batchedUpdates when we don't have a reference to
// the renderer. Such as when we're dispatching events or if third party
// libraries need to call batchedUpdates. Eventually, this API will go away when
// everything is batched by default. We'll then have a similar API to opt-out of
// scheduled work and instead do synchronous work.

// Defaults
let batchedUpdatesImpl = function(fn, bookkeeping) {
  return fn(bookkeeping);
};
let discreteUpdatesImpl = function(fn, a, b, c, d) {
  return fn(a, b, c, d);
};
let flushSyncImpl = function() {};

let isInsideEventHandler = false;

function finishEventHandler() {
  // Here we wait until all updates have propagated, which is important
  // when using controlled components within layers:
  // https://github.com/facebook/react/issues/1698
  // Then we restore state of any controlled component.
  // 在这里，我们等待所有更新传播完毕，
  // 这在层内使用受控组件时非常重要：https://github.com/facebook/react/issues/1698然后我们恢复任何受控组件的状态。
  const controlledComponentsHavePendingUpdates = needsStateRestore();
  if (controlledComponentsHavePendingUpdates) {
    // If a controlled event was fired, we may need to restore the state of
    // the DOM node back to the controlled value. This is necessary when React
    // bails out of the update without touching the DOM.
    // TODO: Restore state in the microtask, after the discrete updates flush,
    // instead of early flushing them here.
    flushSyncImpl();
    restoreStateIfNeeded();
  }
}
 
export function batchedUpdates(fn, a, b) {
  if (isInsideEventHandler) {
    // If we are currently inside another batch, we need to wait until it
    // fully completes before restoring state.
    // 如果我们当前在另一个批中，我们需要等到它完全完成后才能恢复状态。
    return fn(a, b);
  }
  isInsideEventHandler = true;
  try {
    return batchedUpdatesImpl(fn, a, b);
  } finally {
    isInsideEventHandler = false;
    finishEventHandler();
  }
}

// TODO: Replace with flushSync
export function discreteUpdates(fn, a, b, c, d) {
  return discreteUpdatesImpl(fn, a, b, c, d);
}

export function setBatchingImplementation(
  _batchedUpdatesImpl,
  _discreteUpdatesImpl,
  _flushSyncImpl,
) {
  batchedUpdatesImpl = _batchedUpdatesImpl;
  discreteUpdatesImpl = _discreteUpdatesImpl;
  flushSyncImpl = _flushSyncImpl;
}
