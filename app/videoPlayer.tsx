import { StyleSheet, Text, View } from "react-native";
import React, { useRef } from "react";
import { useTheme } from "@react-navigation/native";
import { ResizeMode, Video } from "expo-av";
import { SafeAreaView } from "react-native-safe-area-context";

const source = {
  uri: "http://devimages.apple.com/iphone/samples/bipbop/bipbopall.m3u8",
};

const VideoPlayer = () => {
  const videoRef = useRef(null);
  const theme = useTheme();

  const Controls = () => {
    return (
      <View style={{ backgroundColor: "red" }}>
        <Text>Hello world!</Text>
      </View>
    );
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "red",
      }}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: "blue" }}>
        <Video
          ref={videoRef}
          style={{ flex: 1 }}
          source={source}
          useNativeControls={true}
          resizeMode={ResizeMode.CONTAIN}
          isLooping
        />
        <Controls />
      </SafeAreaView>
    </View>
  );
};

export default VideoPlayer;

const styles = StyleSheet.create({});
