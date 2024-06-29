import React from "react";
import { PressableProps } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Button from "./Button";

const ContainButton = (props: PressableProps) => {
  return (
    <Button {...props}>
      <MaterialIcons name="aspect-ratio" size={18} color="white" />
    </Button>
  );
};

export default ContainButton;
