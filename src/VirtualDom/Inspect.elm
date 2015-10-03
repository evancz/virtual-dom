module VirtualDom.Inspect
  ( select, attr
  ) where

{-| API to inspect VirtualDom nodes.

# CSS selectors
@docs select

# attribute
@docs attr

-}

import VirtualDom exposing (Node)
import Native.VirtualDom


{-| Find all nodes matching a given CSS selector.

    select "body > #header .logo" render

Selector matching is done using [cssauron](https://www.npmjs.com/package/cssauron).
See the documentation for details on supported selectors.
-}
select : String -> Node -> List Node
select =
    Native.VirtualDom.select


{-| Gets an attribute value of a Node.

    node = Html.img [ Html.src "example.png" ]
    attr "img" node == "example.png"
-}
attr : String -> Node -> Maybe String
attr =
    Native.VirtualDom.attr
