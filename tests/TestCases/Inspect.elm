module TestCases.Inspect where

import VirtualDom exposing (..)
import VirtualDom.Inspect exposing (..)
import ElmTest.Assertion exposing (assertEqual)
import ElmTest.Test exposing (Test, suite, test)
import Json.Encode as Json


stringProperty : String -> String -> Property
stringProperty name string =
  VirtualDom.property name (Json.string string)


tests : Test
tests =
    let attrImg = node "img" [ attribute "src" "i.png" ] []
        propImg = node "img" [ stringProperty "src" "i.png" ] []
        bothImg =
          node "img"
            [ stringProperty "src" "p.png"
            , attribute "src" "a.png"
            ] []
        emptyDiv = node "div" [] []
        divA = node "div" [ stringProperty "className" "a" ] []
        header = node "header" [ stringProperty "id" "head"] []
        tree =
          node "body" []
            [ header
            , node "div" [] []
            , divA
            ]
    in
        suite "Inspect"
          [
            -- attr

            test "get attribute returns DOM attributes" <|
                assertEqual (Just "i.png") <| attr "src" attrImg,
            test "get attribute returns JS properties" <|
                assertEqual (Just "i.png") <| attr "src" propImg,
            -- TODO: is this correct, or should we prefer the attribute?:
            test "get attribute prefers property to attribute" <|
                assertEqual (Just "p.png") <| attr "src" bothImg,
            test "get attribute with no value" <|
                assertEqual Nothing <| attr "src" emptyDiv,
            test "get attribute with no value" <|
                assertEqual Nothing <| attr "src" <| node "x" [ attribute "x" "x" ] [],


            -- select

            test "class selector" <|
                assertEqual [divA] <| select ".a" tree,
            test "id selector" <|
                assertEqual [header] <| select "#head" tree,
            test "no matches" <|
                assertEqual [] <| select ".z" tree,
            test "multiple matches" <|
                assertEqual 2 <| List.length <| select "div" tree
          ]
