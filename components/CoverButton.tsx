import React from "react";
import { PressableProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Button from "./Button";

const CoverButton = (props: PressableProps) => {
  return (
    <Button {...props}>
      <Ionicons name="scan" size={18} color="white" />
    </Button>
  );
};

export default CoverButton;
