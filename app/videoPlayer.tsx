import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as ScreenOrientation from "expo-screen-orientation";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { AVPlaybackStatusSuccess, ResizeMode, Video } from "expo-av";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { formatDuration } from "@/utils";
import Animated, {
  FadeIn,
  FadeOut,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Slider } from "react-native-awesome-slider";
import Button from "@/components/Button";
import { LinearGradient } from "expo-linear-gradient";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { LINEAR_GRADIENT_COLORS, SLIDER_THEME } from "@/constants";
import CoverButton from "@/components/CoverButton";
import ContainButton from "@/components/ContainButton";
import StretchButton from "@/components/StratchButton";

const VideoPlayer = () => {
  const local = useLocalSearchParams();

  const navigation = useNavigation();
  const timeoutId = useRef(null);

  const videoRef = useRef(null);
  const [state, setState] = useState({
    isPlay: true,
    fullscreen: false,
    currentDuration: 0,
    duration: 0,
    isBuffering: true,
    resizeMode: ResizeMode.CONTAIN,
    isControls: false,
  });

  const cache = useSharedValue(0);

  const progress = useSharedValue(0);
  const min = useSharedValue(0);
  const max = useSharedValue(100);
  const isScrubbing = useSharedValue(false);

  const currentDuration = useSharedValue(0);

  const seekTo = async (time: number = 0) => {
    setState((prev) => ({
      ...prev,
      currentDuration: time,
    }));

    await videoRef.current?.setPositionAsync(time);
    isScrubbing.value = false;
    currentDuration.value = time;
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

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (state.isControls) {
      timeoutId = setTimeout(() => {
        setState((prev) => ({ ...prev, isControls: false }));
      }, 3000);
    }
    return () => clearTimeout(timeoutId);
  }, [state]);

  const onPlaybackStatusUpdate = (data: AVPlaybackStatusSuccess) => {
    if (!data?.isLoaded) return;
    if (data?.durationMillis && data?.playableDurationMillis) {
      if (!isScrubbing.value) {
        if (data?.durationMillis > data?.positionMillis) {
          setState((prev) => ({
            ...prev,
            currentDuration: data?.positionMillis,
          }));
          currentDuration.value = data?.positionMillis;
          progress.value = data?.positionMillis;
        }
      }

      if (
        data?.durationMillis > data?.playableDurationMillis &&
        data?.positionMillis < data?.playableDurationMillis
      ) {
        cache.value = data?.playableDurationMillis;
      }
      setState((prev) => ({ ...prev, isBuffering: data?.isBuffering }));
    }
  };

  const onLoad = (data: AVPlaybackStatusSuccess) => {
    if (data.durationMillis) {
      max.value = data.durationMillis;
      setState((prev) => ({ ...prev, duration: data.durationMillis || 0 }));
    }
  };

  const togglePlay = () => {
    if (state.isPlay) {
      videoRef?.current?.pauseAsync();
      setState((prev) => ({ ...prev, isPlay: false }));
    } else {
      videoRef?.current?.playAsync();
      setState((prev) => ({ ...prev, isPlay: true }));
    }
  };

  const prev = () => {
    seekTo(state.currentDuration - 10 * 1000);
  };
  const next = () => {
    seekTo(state.currentDuration + 10 * 1000);
  };

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

  const PlayButton = useMemo(() => {
    return (
      <Button onPress={togglePlay}>
        <Ionicons
          name={state.isPlay ? "pause" : "play"}
          size={48}
          color="white"
        />
      </Button>
    );
  }, [state.isPlay]);

  const PreviousButton = useMemo(() => {
    return (
      <Button onPress={prev}>
        <Ionicons name="play-skip-back-sharp" size={28} color="white" />
      </Button>
    );
  }, [state.currentDuration]);

  const NextButton = useMemo(() => {
    return (
      <Button onPress={next}>
        <Ionicons name="play-skip-forward" size={28} color="white" />
      </Button>
    );
  }, [state.currentDuration]);

  const ResizeButton = useMemo(() => {
    switch (state.resizeMode) {
      case ResizeMode.STRETCH: {
        return (
          <CoverButton
            onPress={() =>
              setState((prev) => ({ ...prev, resizeMode: ResizeMode.COVER }))
            }
          />
        );
      }
      case ResizeMode.COVER: {
        return (
          <ContainButton
            onPress={() =>
              setState((prev) => ({
                ...prev,
                resizeMode: ResizeMode.CONTAIN,
              }))
            }
          />
        );
      }
      default: {
        return (
          <StretchButton
            onPress={() =>
              setState((prev) => ({
                ...prev,
                resizeMode: ResizeMode.STRETCH,
              }))
            }
          />
        );
      }
    }
  }, [state.resizeMode]);

  const FullScreenButton = useMemo(() => {
    return (
      <Button onPress={fullscreen}>
        <MaterialIcons name="screen-rotation" size={20} color="white" />
      </Button>
    );
  }, [state.fullscreen]);

  const SliderBar = useMemo(() => {
    return (
      <Slider
        disableTrackFollow={false}
        onTap={() => resetTimeout()}
        isScrubbing={isScrubbing}
        progress={progress}
        minimumValue={min}
        maximumValue={max}
        bubble={(e) => formatDuration(e)}
        cache={cache}
        thumbWidth={25}
        bubbleTranslateY={-25 - 15}
        bubbleTextStyle={{ fontSize: 15 }}
        theme={SLIDER_THEME}
        containerStyle={styles.sliderContainerStyle}
        onSlidingStart={() => videoRef?.current?.pauseAsync()}
        onSlidingComplete={(val) => {
          seekTo(val);
          state.isPlay && videoRef?.current?.playAsync();
        }}
        onValueChange={(val) => {
          resetTimeout();
          progress.value = val;
        }}
      />
    );
  }, [state.isPlay]);

  const GradientWrapper = useMemo(() => {
    return (
      <LinearGradient
        colors={LINEAR_GRADIENT_COLORS}
        style={StyleSheet.absoluteFillObject}
      />
    );
  }, []);

  const Header = () => {
    return (
      <Animated.View style={styles.headerContainer}>
        <Button
          onPress={() => navigation.goBack()}
          style={styles.headerButtonStyle}
        >
          <Ionicons name="close" size={28} color="white" />
        </Button>
      </Animated.View>
    );
  };

  const resetTimeout = () => {
    setState((prev) => ({ ...prev, isControls: true }));
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
    timeoutId.current = setTimeout(() => {
      setState((prev) => ({ ...prev, isControls: false }));
    }, 3000);
  };

  const pan = Gesture.Tap().onStart(() => {
    runOnJS(resetTimeout)();
  });

  const Controls = useMemo(() => {
    return (
      <View style={styles.controllerWrapper}>
        <GestureDetector gesture={pan}>
          <View style={styles.controllerSubWrapper}>
            {/* SlideBar */}
            <View style={{ gap: 15 }}>
              {SliderBar}
              {/* duration */}
              <View style={styles.durationWrapper}>
                <Text style={styles.durationTextStyle}>
                  {formatDuration(state.currentDuration)}
                </Text>
                <Text style={styles.durationTextStyle}>
                  {formatDuration(state.duration)}
                </Text>
              </View>
              {/* duration */}
            </View>
            {/* SlideBar */}

            {/* controls */}
            <View style={styles.resizeButtonContainer}>
              <View>{ResizeButton}</View>
              <View style={styles.playButtonContainer}>
                <>
                  {PreviousButton}
                  {PlayButton}
                  {NextButton}
                </>
              </View>
              <View>{FullScreenButton}</View>
            </View>
            {/* controls */}
          </View>
        </GestureDetector>
      </View>
    );
  }, [
    state.isControls,
    state.currentDuration,
    state.duration,
    state.resizeMode,
    state.isPlay,
    state.fullscreen,
  ]);

  const Loader = useMemo(() => {
    if (!state.isBuffering) {
      return null;
    }
    return (
      <Animated.View
        entering={FadeIn}
        exiting={FadeOut}
        pointerEvents="none"
        style={styles.loaderContainer}
      >
        <ActivityIndicator color={"white"} size={"large"} />
      </Animated.View>
    );
  }, [state.isBuffering]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: state.isControls ? withTiming(1) : withTiming(0),
    };
  });

  const VideoController = useMemo(() => {
    return (
      <Animated.View
        style={[StyleSheet.absoluteFillObject, animatedStyle]}
        pointerEvents={state.isControls ? "auto" : "none"}
      >
        {GradientWrapper}
        <SafeAreaView style={styles.controllerContainer}>
          <View style={{ flex: 1 }}>
            <Header />
          </View>
          <View
            style={{ flex: 3 }}
            onTouchEndCapture={() =>
              setState((prev) => ({ ...prev, isControls: false }))
            }
          />
          <View style={{ flex: 2 }}>{Controls}</View>
        </SafeAreaView>
      </Animated.View>
    );
  }, [
    state.isControls,
    state.currentDuration,
    state.duration,
    state.resizeMode,
    state.isPlay,
    state.fullscreen,
  ]);

  return (
    <View style={styles.container}>
      <Video
        onTouchEndCapture={resetTimeout}
        ref={videoRef}
        style={{ flex: 1 }}
        source={local}
        onLoad={onLoad}
        onPlaybackStatusUpdate={onPlaybackStatusUpdate}
        resizeMode={state.resizeMode}
        progressUpdateIntervalMillis={1000}
        shouldPlay={state.isPlay}
        isLooping
      />
      {Loader}
      {VideoController}
    </View>
  );
};

export default VideoPlayer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  // resizeButtonWrapper: {
  //   width: 18,
  //   aspectRatio: 1,
  //   borderColor: "white",
  //   justifyContent: "center",
  //   alignItems: "center",
  //   borderWidth: 1,
  // },
  durationTextStyle: {
    color: "white",
    fontSize: 13,
  },
  controllerContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  controllerWrapper: {
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  controllerSubWrapper: {
    flex: 1,
    gap: 0,
  },
  durationWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  resizeButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  playButtonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 50,
  },
  headerContainer: {
    height: 200,
    position: "absolute",
    top: 0,
    width: "100%",
  },
  headerButtonStyle: {
    width: 35,
    aspectRatio: 1,
    borderRadius: 100,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  sliderContainerStyle: {
    borderRadius: 100,
  },
});
