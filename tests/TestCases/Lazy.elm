module TestCases.Lazy where

import VirtualDom exposing (Node, lazy)
import ElmTest.Assertion exposing (assertEqual)
import ElmTest.Test exposing (Test, suite, test)

import TestHelpers exposing (forceRenderDom, unsafeRecordCallCount, unsafeQueryCallCount)

renderRecord : { x: String, y: String } -> Node
renderRecord r =
    VirtualDom.text <| "The values: " ++ r.x ++ ", " ++ r.y


renderPrimitive : Int -> Node
renderPrimitive x =
    VirtualDom.text <| "The value: " ++ (toString x)


testLazyIdenticalRecord =
    test "isn't called again with identical record" <|
        let record = { x = "a", y = "b" }
            wrappedRender = unsafeRecordCallCount renderRecord
            lazyRender = lazy wrappedRender
            call1 = forceRenderDom <| lazyRender record
            call2 = forceRenderDom <| lazyRender record
            call3 = forceRenderDom <| lazyRender record
        in
            assertEqual 1 <| unsafeQueryCallCount wrappedRender


testLazyIdenticalPrimitive =
    test "isn't called again with identical primitive" <|
        let wrappedRender = unsafeRecordCallCount renderPrimitive
            lazyRender = lazy wrappedRender
            call1 = forceRenderDom <| lazyRender 5
            call2 = forceRenderDom <| lazyRender 5
            call3 = forceRenderDom <| lazyRender 5
        in
            assertEqual 1 <| unsafeQueryCallCount wrappedRender


testLazyRecordMutationOfIdenticalValue =
    test "isn't called again with record mutation of identical value" <|
        let record = { x = "a", y = "b" }
            wrappedRender = unsafeRecordCallCount renderRecord
            lazyRender = lazy wrappedRender
            call1 = forceRenderDom <| lazyRender record
            call2 = forceRenderDom <| lazyRender { record | x <- "a" }
            call3 = forceRenderDom <| lazyRender { record | x <- "a", y <- "b" }
        in
            assertEqual 1 <| unsafeQueryCallCount wrappedRender


testNotLazyDifferentRecord =
    test "is called again with an equivalent but different record" <|
        let wrappedRender = unsafeRecordCallCount renderRecord
            lazyRender = lazy wrappedRender
            call1 = forceRenderDom <| lazyRender { x = "a", y = "b" }
            call2 = forceRenderDom <| lazyRender { x = "a", y = "b" }
            call3 = forceRenderDom <| lazyRender { x = "a", y = "b" }
        in
            assertEqual 3 <| unsafeQueryCallCount wrappedRender


tests : Test
tests =
    suite
        "Lazy"
        [
            testLazyIdenticalRecord,
            testLazyIdenticalPrimitive,
            testLazyRecordMutationOfIdenticalValue,
            testNotLazyDifferentRecord
        ]
