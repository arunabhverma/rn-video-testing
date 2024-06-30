import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { Platform, useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

const PlayerOptions = Platform.select({
  android: {
    statusBarTranslucent: true,
    headerShown: false,
  },
  ios: {
    headerShown: false,
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" />
          <Stack.Screen name="videoPlayer" options={PlayerOptions} />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
