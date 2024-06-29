import React from "react";
import { PressableProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Button from "./Button";

const StretchButton = (props: PressableProps) => {
  return (
    <Button {...props}>
      <Ionicons name="expand" size={18} color="white" />
    </Button>
  );
};

export default StretchButton;
