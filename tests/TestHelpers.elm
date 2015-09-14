module TestHelpers where

import VirtualDom exposing (Node)

import Native.TestHelpers
import Native.VirtualDom

unsafeRecordCallCount : (a -> b) -> (a -> b)
unsafeRecordCallCount =
    Native.TestHelpers.unsafeRecordCallCount

unsafeQueryCallCount : (a -> b) -> Int
unsafeQueryCallCount =
    Native.TestHelpers.unsafeQueryCallCount

type OpaqueDom = OpaqueDom

forceRenderDom : Node -> OpaqueDom
forceRenderDom =
    Native.VirtualDom.render