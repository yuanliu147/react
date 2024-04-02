/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

export type HookFlags = number;

export const NoFlags = /*   */ 0b0000;

// Represents whether effect should fire.
// 表示是否存在 effect。
export const HasEffect = /* */ 0b0001;

// Represents the phase in which the effect (not the clean-up) fires.
// 表示 effect 的启动阶段。（而不是清理）
export const Insertion = /*  */ 0b0010;
export const Layout = /*    */ 0b0100;
export const Passive = /*   */ 0b1000;
