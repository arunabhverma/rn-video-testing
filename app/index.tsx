import {
  FlatList,
  StyleSheet,
  Image as RNImage,
  View,
  useWindowDimensions,
  Text,
  Pressable,
} from "react-native";
import React, { useState } from "react";
import { MEDIA_DATA } from "@/mock/VideoData";
import { Image } from "expo-image";
import { useTheme } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MEDIA_TYPE } from "@/types/home";

const RenderItem = ({ item }: { item: MEDIA_TYPE }) => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [height, setHeight] = useState(0);

  const theme = useTheme();

  RNImage.getSize(item.thumb, (imgWidth, imgHeight) => {
    let aspectRatio = imgWidth / imgHeight;
    const imageHeight = width / aspectRatio;
    setHeight(imageHeight);
  });

  return (
    <Pressable
      onPress={() =>
        router.navigate({
          pathname: "/videoPlayer",
          params: { uri: item.sources },
        })
      }
    >
      <Image
        source={{ uri: item.thumb }}
        contentFit="cover"
        style={{ width: width, height: height }}
      />
      <View style={styles.detailsWrapper}>
        <Text
          numberOfLines={2}
          style={[styles.descriptionText, { color: theme.colors.text }]}
        >
          {item.description}
        </Text>
        <Text numberOfLines={1} style={styles.title}>
          {item.title}
        </Text>
      </View>
    </Pressable>
  );
};

const Main = () => {
  const { bottom } = useSafeAreaInsets();
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={MEDIA_DATA}
        contentContainerStyle={{ gap: 20, paddingBottom: bottom }}
        renderItem={({ item }) => <RenderItem item={item} />}
        keyExtractor={(_, i) => i.toString()}
      />
    </View>
  );
};

export default Main;

const styles = StyleSheet.create({
  detailsWrapper: {
    padding: 15,
    gap: 5,
  },
  descriptionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  title: {
    fontSize: 14,
    color: "rgba(100,100,100,0.8)",
  },
});
