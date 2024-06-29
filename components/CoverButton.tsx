import React from "react";
import { PressableProps, StyleSheet, View } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import Button from "./Button";

const CoverButton = (props: PressableProps) => {
  return (
    <Button {...props}>
      <View style={styles.resizeButtonWrapper}>
        <AntDesign name="arrowsalt" size={12} color="white" />
      </View>
    </Button>
  );
};

export default CoverButton;

const styles = StyleSheet.create({
  resizeButtonWrapper: {
    width: 18,
    aspectRatio: 1,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
});
