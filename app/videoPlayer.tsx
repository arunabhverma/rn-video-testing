import { Alert, StatusBar, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "@react-navigation/native";
import * as ScreenOrientation from "expo-screen-orientation";
import { Ionicons, MaterialIcons, AntDesign } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "expo-router";
import { formatDuration } from "@/utils";
import Animated, { useSharedValue, withTiming } from "react-native-reanimated";
import { Slider } from "react-native-awesome-slider";
import Button from "@/components/Button";

const source = {
  // uri: "http://devimages.apple.com/iphone/samples/bipbop/bipbopall.m3u8",
  uri: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
};

const VideoPlayer = () => {
  const navigation = useNavigation();
  const videoRef = useRef(null);
  const theme = useTheme();
  const [state, setState] = useState({
    isPlay: true,
    fullscreen: false,
    currentDuration: 0,
    duration: 0,
    isBuffering: true,
    resizeMode: ResizeMode.CONTAIN,
  });

  const cache = useSharedValue(0);

  const progress = useSharedValue(0);
  const min = useSharedValue(0);
  const max = useSharedValue(100);
  const isScrubbing = useSharedValue(false);

  const currentDuration = useSharedValue(0);
  const duration = useSharedValue(0);

  const seekTo = (time: number = 0) => {
    setState((prev) => ({ ...prev, currentDuration: time }));
    currentDuration.value = time;

    videoRef.current?.setStatusAsync({
      positionMillis: time,
      shouldPlay: state.isPlay,
    });
    isScrubbing.value = false;
  };

  const unsetOrientation = async () => {
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.PORTRAIT_UP
    );
  };

  useEffect(() => {
    return () => {
      unsetOrientation();
    };
  }, []);

  const onPlaybackStatusUpdate = (data) => {
    if (!data.isLoaded) return;
    if (!isScrubbing.value) {
      console.log("on");
      if (data.durationMillis > data.positionMillis) {
        setState((prev) => ({
          ...prev,
          currentDuration: data.positionMillis,
        }));
        currentDuration.value = data.positionMillis;
        progress.value = data.positionMillis;
      }
    }

    if (
      data.durationMillis > data.playableDurationMillis &&
      data.positionMillis < data.playableDurationMillis
    ) {
      cache.value = data.playableDurationMillis;
    }
    setState((prev) => ({ ...prev, isBuffering: data.isBuffering }));
  };

  const onLoad = (data) => {
    max.value = data.durationMillis;
    setState((prev) => ({ ...prev, duration: data.durationMillis }));
  };

  const play = () => {
    videoRef.current.playAsync();
    setState((prev) => ({ ...prev, isPlay: true }));
  };
  const pause = () => {
    videoRef.current.pauseAsync();
    setState((prev) => ({ ...prev, isPlay: false }));
  };
  const prev = () => {};
  const next = () => {};

  const fullscreen = async () => {
    if (state.fullscreen) {
      setState((prev) => ({ ...prev, fullscreen: false }));
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
    } else {
      setState((prev) => ({ ...prev, fullscreen: true }));
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT
      );
    }
  };

  const PlayButton = () => {
    if (state.isPlay) {
      return (
        <Button onPress={pause}>
          <Ionicons name={"pause"} size={48} color="white" />
        </Button>
      );
    } else {
      return (
        <Button onPress={play}>
          <Ionicons name={"play"} size={48} color="white" />
        </Button>
      );
    }
  };

  const PreviousButton = () => {
    return (
      <Button onPress={prev}>
        <Ionicons name="play-skip-back-sharp" size={28} color="white" />
      </Button>
    );
  };

  const NextButton = () => {
    return (
      <Button onPress={prev}>
        <Ionicons name="play-skip-forward" size={28} color="white" />
      </Button>
    );
  };

  const ResizeButton = () => {
    switch (state.resizeMode) {
      case ResizeMode.STRETCH: {
        return (
          <Button
            onPress={() =>
              setState((prev) => ({ ...prev, resizeMode: ResizeMode.COVER }))
            }
          >
            <AntDesign name="arrowsalt" size={18} color="white" />
          </Button>
        );
      }
      case ResizeMode.COVER: {
        return (
          <Button
            onPress={() =>
              setState((prev) => ({
                ...prev,
                resizeMode: ResizeMode.CONTAIN,
              }))
            }
          >
            <MaterialIcons name="aspect-ratio" size={18} color="white" />
          </Button>
        );
      }
      default: {
        return (
          <View
            style={{
              width: 20,
              aspectRatio: 1,
              // backgroundColor: "black",
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 1,
            }}
          >
            <Button
              onPress={() =>
                setState((prev) => ({
                  ...prev,
                  resizeMode: ResizeMode.STRETCH,
                }))
              }
            >
              <Ionicons name="expand" size={18} color="white" />
            </Button>
          </View>
        );
      }
    }
  };

  const FullScreenButton = () => {
    return (
      <Button onPress={fullscreen}>
        <MaterialIcons name="screen-rotation" size={24} color="white" />
      </Button>
    );
  };

  const Controls = () => {
    return (
      <View>
        <Button onPress={fullscreen}>
          <MaterialIcons name="screen-rotation" size={24} color="white" />
        </Button>
        <Text style={{ color: "white" }}>
          {formatDuration(state.currentDuration)}
        </Text>
        <Text style={{ color: "white" }}>{formatDuration(state.duration)}</Text>

        {state.resizeMode === ResizeMode.CONTAIN && (
          <Button
            onPress={() =>
              setState((prev) => ({
                ...prev,
                resizeMode: ResizeMode.STRETCH,
              }))
            }
          >
            <Ionicons name="expand" size={24} color="white" />
          </Button>
        )}
        {state.resizeMode === ResizeMode.STRETCH && (
          <Button
            onPress={() =>
              setState((prev) => ({ ...prev, resizeMode: ResizeMode.COVER }))
            }
          >
            <AntDesign name="arrowsalt" size={24} color="white" />
          </Button>
        )}
        {state.resizeMode === ResizeMode.COVER && (
          <Button
            onPress={() =>
              setState((prev) => ({
                ...prev,
                resizeMode: ResizeMode.CONTAIN,
              }))
            }
          >
            <MaterialIcons name="aspect-ratio" size={24} color="white" />
          </Button>
        )}
      </View>
    );
  };

  const SliderBar = useMemo(() => {
    return (
      <Slider
        disableTrackFollow={false}
        isScrubbing={isScrubbing}
        progress={progress}
        minimumValue={min}
        maximumValue={max}
        bubble={(e) => formatDuration(e)}
        cache={cache}
        onSlidingStart={() => {
          pause();
        }}
        onSlidingComplete={(val) => {
          seekTo(val);
          play();
        }}
        onValueChange={(val) => {
          progress.value = val;
        }}
      />
    );
  }, []);

  const ControlsBar = () => {
    return (
      <SafeAreaView
        edges={["bottom"]}
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          flexDirection: "row",
        }}
      >
        <View style={{ backgroundColor: "red", flex: 1 }}>
          <Controls />
          {SliderBar}
        </View>
      </SafeAreaView>
    );
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "red",
      }}
    >
      <Video
        ref={videoRef}
        style={{ flex: 1 }}
        source={source}
        useNativeControls
        onLoad={onLoad}
        onPlaybackStatusUpdate={onPlaybackStatusUpdate}
        resizeMode={state.resizeMode}
        progressUpdateIntervalMillis={1000}
        shouldPlay={state.isPlay}
        isLooping
      />
      <SafeAreaView
        edges={["bottom"]}
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          flexDirection: "row",
        }}
      >
        <View style={{ backgroundColor: "red", flex: 1, gap: 20 }}>
          {/* SlideBar */}
          <View style={{ padding: 10, gap: 10 }}>
            {SliderBar}
            {/* duration */}
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={{ color: "white" }}>
                {formatDuration(state.currentDuration)}
              </Text>
              <Text style={{ color: "white" }}>
                {formatDuration(state.duration)}
              </Text>
            </View>
            {/* duration */}
          </View>
          {/* SlideBar */}

          {/* controls */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 10,
            }}
          >
            <View>
              <ResizeButton />
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 50,
              }}
            >
              <PreviousButton />
              <PlayButton />
              <NextButton />
            </View>
            <View>
              <FullScreenButton />
            </View>
          </View>
          {/* controls */}
        </View>
      </SafeAreaView>
    </View>
  );
};

export default VideoPlayer;

const styles = StyleSheet.create({});
