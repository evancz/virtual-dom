module VirtualDom where
{-| API to the core diffing algorithm. Can serve as a foundation for libraries
that expose more helper functions for HTML or SVG.

# Create
@docs text, node

# Embed
@docs toElement

# Declare Properties
@docs property

# Events
@docs on

-}

import Json.Decode as Json
import Graphics.Element (Element)
import Native.VirtualDom
import Signal

type Html = Html

{-| Create a DOM node with a tag name, a list of HTML properties that can
include styles and event listeners, a list of CSS properties like `color`, and
a list of child nodes.

    import Json.Encode as Json

    hello : Html
    hello =
        node "div" [] [ text "Hello!" ]

    greeting : Html
    greeting =
        node "div"
            [ property "id" (Json.string "greeting") ]
            [ text "Hello!" ]
-}
node : String -> [Property] -> [Html] -> Html
node = Native.VirtualDom.node


{-| Just put plain text in the DOM. It will escape the string so that it appears
exactly as you specify.

    text "Hello World!"
-}
text : String -> Html
text = Native.VirtualDom.text


{-| Embed an `Html` value in Elm's rendering system. Like any other `Element`,
this requires a known width and height, so it is not yet clear if this can be
made more convenient in the future.
-}
toElement : Int -> Int -> Html -> Element
toElement = Native.VirtualDom.toElement


-- PROPERTIES

type Property = Property

property : String -> Json.Json -> Property
property =
    Native.VirtualDom.property


-- EVENTS

on : String -> Json.Decoder a -> (a -> Signal.Message) -> Property
on = Native.VirtualDom.on


-- OPTIMIZATION

lazy : (a -> Html) -> a -> Html
lazy = Native.VirtualDom.lazyRef

lazy2 : (a -> b -> Html) -> a -> b -> Html
lazy2 = Native.VirtualDom.lazyRef2

lazy3 : (a -> b -> c -> Html) -> a -> b -> c -> Html
lazy3 = Native.VirtualDom.lazyRef3


lazy' : (a -> Html) -> a -> Html
lazy' = Native.VirtualDom.lazyStruct

lazy2' : (a -> b -> Html) -> a -> b -> Html
lazy2' = Native.VirtualDom.lazyStruct2

lazy3' : (a -> b -> c -> Html) -> a -> b -> c -> Html
lazy3' = Native.VirtualDom.lazyStruct3