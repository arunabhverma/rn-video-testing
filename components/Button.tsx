import {
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useState } from "react";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

const Button = (props: PressableProps) => {
  const [isPressed, setIsPressed] = useState(false);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: isPressed
            ? withTiming(0.8, { duration: 300 })
            : withTiming(1, { duration: 300 }),
        },
      ],
    };
  });

  return (
    <Pressable
      {...props}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
    >
      <Animated.View style={animatedStyle}>{props.children}</Animated.View>
    </Pressable>
  );
};

export default Button;
