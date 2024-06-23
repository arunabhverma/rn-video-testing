import {
  ActivityIndicator,
  Alert,
  StatusBar,
  SafeAreaView as RNSafeAreaView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTheme } from "@react-navigation/native";
import * as ScreenOrientation from "expo-screen-orientation";
import { Ionicons, MaterialIcons, AntDesign } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useNavigation } from "expo-router";
import { formatDuration } from "@/utils";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  FadeOutDown,
  FadeOutUp,
  LinearTransition,
  ZoomIn,
  ZoomInDown,
  ZoomOut,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Slider } from "react-native-awesome-slider";
import Button from "@/components/Button";
import { LinearGradient } from "expo-linear-gradient";
import { useHeaderHeight } from "@react-navigation/elements";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { BlurView } from "expo-blur";

const source = {
  // uri: "http://devimages.apple.com/iphone/samples/bipbop/bipbopall.m3u8",
  uri: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
};

const VideoPlayer = () => {
  const navigation = useNavigation();
  const timeoutId = useRef(null);
  const headerHeight = useHeaderHeight();
  const { top } = useSafeAreaInsets();

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
  const duration = useSharedValue(0);

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
      }, 3000); // 3000 milliseconds = 3 seconds
    }
    return () => clearTimeout(timeoutId); // Clear the timeout if the component unmounts or control changes
  }, [state]); // Dependency array with control

  const onPlaybackStatusUpdate = (data) => {
    if (!isScrubbing.value) {
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

  const togglePlay = () => {
    if (state.isPlay) {
      videoRef.current.pauseAsync();
      setState((prev) => ({ ...prev, isPlay: false }));
    } else {
      videoRef.current.playAsync();
      setState((prev) => ({ ...prev, isPlay: true }));
    }
  };

  const play = () => {
    videoRef.current.playAsync();
    setState((prev) => ({ ...prev, isPlay: true }));
  };
  const pause = () => {
    videoRef.current.pauseAsync();
    setState((prev) => ({ ...prev, isPlay: false }));
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

  const onTouchEndCapture = useCallback(() => {
    setState((prev) => ({ ...prev, isControls: !prev.isControls }));
  }, []);

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
          <Button
            onPress={() =>
              setState((prev) => ({ ...prev, resizeMode: ResizeMode.COVER }))
            }
          >
            <View style={styles.resizeButtonWrapper}>
              <AntDesign name="arrowsalt" size={12} color="white" />
            </View>
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
            {/* <View style={styles.resizeButtonWrapper}> */}
            <MaterialIcons name="aspect-ratio" size={18} color="white" />
            {/* </View> */}
          </Button>
        );
      }
      default: {
        return (
          <Button
            onPress={() =>
              setState((prev) => ({
                ...prev,
                resizeMode: ResizeMode.STRETCH,
              }))
            }
          >
            {/* <View style={styles.resizeButtonWrapper}> */}
            <Ionicons name="expand" size={18} color="white" />
            {/* </View> */}
          </Button>
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
        theme={{
          cacheTrackTintColor: "rgba(255, 255, 255, 0.5)",
          maximumTrackTintColor: "rgba(255, 255, 255, 0.3)",
          minimumTrackTintColor: "white",
          bubbleBackgroundColor: "rgba(255, 255, 255, 0.3)",
          bubbleTextColor: "white",
        }}
        containerStyle={{
          borderRadius: 100,
        }}
        onSlidingStart={() => videoRef.current.pauseAsync()}
        onSlidingComplete={(val) => {
          seekTo(val);
          state.isPlay && videoRef.current.playAsync();
        }}
        onValueChange={(val) => {
          resetTimeout();
          progress.value = val;
        }}
      />
    );
  }, [state.isPlay]);

  const GradientTopView = useMemo(() => {
    return (
      <View
        pointerEvents="none"
        style={{
          ...StyleSheet.absoluteFillObject,
        }}
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.9)", "transparent"]}
          style={{ height: "150%", bottom: "50%" }}
        />
      </View>
    );
  }, []);

  const GradientWrapper = useMemo(() => {
    return (
      <LinearGradient
        colors={["rgba(0,0,0,0.5)", "transparent", "rgba(0,0,0,0.9)"]}
        style={StyleSheet.absoluteFillObject}
      />
    );
  }, []);

  const GradientBottomView = useMemo(() => {
    return (
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
        }}
      >
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.9)"]}
          style={{ height: "150%", bottom: "50%" }}
        />
      </View>
    );
  }, []);

  const Header = () => {
    return (
      <Animated.View
        style={{ height: 200, position: "absolute", top: 0, width: "100%" }}
      >
        <Button
          onPress={() => navigation.goBack()}
          style={{
            width: 35,
            aspectRatio: 1,
            borderRadius: 100,
            overflow: "hidden",
            justifyContent: "center",
            alignItems: "center",
          }}
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
      <View style={{ position: "absolute", bottom: 0, width: "100%" }}>
        <GestureDetector gesture={pan}>
          <View style={{ flex: 1, gap: 0 }}>
            {/* SlideBar */}
            <View style={{ gap: 15 }}>
              {SliderBar}
              {/* duration */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
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
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 20,
                paddingVertical: 10,
              }}
            >
              <View>{ResizeButton}</View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 50,
                }}
              >
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
        style={{
          ...StyleSheet.absoluteFillObject,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.3)",
        }}
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
        <SafeAreaView
          style={{ flex: 1, paddingHorizontal: 20, paddingTop: 10 }}
        >
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
    <View
      style={{
        flex: 1,
        backgroundColor: "black",
      }}
    >
      <Video
        onTouchEndCapture={resetTimeout}
        ref={videoRef}
        style={{ flex: 1 }}
        source={source}
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
  resizeButtonWrapper: {
    width: 18,
    aspectRatio: 1,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  durationTextStyle: {
    color: "white",
    fontSize: 13,
  },
});
