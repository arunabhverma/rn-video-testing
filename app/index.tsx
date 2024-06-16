import * as React from "react";
import {
  View,
  StyleSheet,
  Button,
  FlatList,
  Text,
  useWindowDimensions,
  TextInput,
  Modal,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { mediaJSON } from "@/mock/VideoData";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { M3uParser } from "m3u-parser-generator";
import { Link } from "expo-router";
import { useTheme } from "@react-navigation/native";

const RenderItem = ({ item, index }) => {
  const [status, setStatus] = React.useState({});
  const video = React.useRef(null);
  const headerHeight = useHeaderHeight();
  const { top, bottom } = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  return (
    <Video
      ref={video}
      style={{ width, height: height - headerHeight, backgroundColor: "blue" }}
      source={{
        // uri: item.sources?.[0],
        // uri: "https://live-hls-abr-cdn.livepush.io/live/bigbuckbunnyclip/index.m3u8",
        // uri: "http://170.254.18.106/HISTORY/index.m3u8",
        uri: "http://devimages.apple.com/iphone/samples/bipbop/bipbopall.m3u8",
      }}
      useNativeControls
      videoStyle={{ marginBottom: bottom }}
      resizeMode={ResizeMode.CONTAIN}
      isLooping
      onError={(e) => console.log("e", e)}
      onPlaybackStatusUpdate={(status) => setStatus(() => status)}
    />
  );
};

export default function App() {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      <Link href={"/videoPlayer"}>
        <Text style={{ color: theme.colors.text }}>Hello world!</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    alignSelf: "center",
    width: 320,
    height: 200,
    backgroundColor: "blue",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});
