import { StyleSheet, Text, TextStyle } from "react-native";
import React, { FC } from "react";

type componentProps = {
  fontSize?: number;
  fontWeight?:
    | "normal"
    | "bold"
    | "100"
    | "200"
    | "300"
    | "400"
    | "500"
    | "600"
    | "700"
    | "800"
    | "900";
  color?: string;
  alignSelf?: any;
  textAlign?: "auto" | "left" | "right" | "center" | "justify" | undefined;
  text?: any;
  marginTop?: any;
  marginLeft?: any;
  marginRight?: any;
  marginBottom?: any;
  width?: any;
  numofLine?: number;
  lineHeight?: number;
  position?: "absolute" | "relative" | undefined;
  bottom?: any;
  top?: any;
  left?: any;
  right?: any;
  backgroundColor?: any;
  textShadowColor?: any;
  textShadowOffset?: { width: number; height: number };
  textShadowRadius?: any;
  textDecorationLine?:
    | "none"
    | "underline"
    | "line-through"
    | "underline line-through"
    | undefined;
  letterSpacing?: any;
  rightTextIcon?: any;
  leftTextIcon?: any;
  fontFamily?: any;
  key?: any;
  ellipsizeMode?: "head" | "middle" | "tail" | "clip" | undefined;
  uppercase?: boolean; // <-- Added here
};

const TextField: FC<componentProps> = (props) => {
  const textStyle: TextStyle = {
    width: props.width,
    letterSpacing: props.letterSpacing,
    color: props.color,
    textDecorationLine: props.textDecorationLine,
    fontSize: props.fontSize,
    fontWeight: props.fontWeight,
    alignSelf: props.alignSelf,
    textAlign: props.textAlign,
    marginTop: props.marginTop,
    marginLeft: props.marginLeft,
    marginRight: props.marginRight,
    marginBottom: props.marginBottom,
    lineHeight: props.lineHeight,
    position: props.position,
    bottom: props.bottom,
    top: props.top,
    left: props.left,
    right: props.right,
    backgroundColor: props.backgroundColor,
    textShadowColor: props.textShadowColor,
    textShadowOffset: props.textShadowOffset,
    textShadowRadius: props.textShadowRadius,
    fontFamily: props.fontFamily,
  };

  const displayText = props.uppercase
    ? (props.text || "").toUpperCase()
    : props.text; // Handle uppercase here

  return (
    <Text
      key={props.key}
      style={textStyle}
      ellipsizeMode={props.ellipsizeMode}
      numberOfLines={props.numofLine}
      allowFontScaling={false}
    >
      {props.leftTextIcon}
      {displayText}
      {props.rightTextIcon}
    </Text>
  );
};

export default TextField;

const styles = StyleSheet.create({});
