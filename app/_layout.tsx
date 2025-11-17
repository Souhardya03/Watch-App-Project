import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "../global.css";
import { useFonts } from "expo-font";
import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
	anchor: "(tabs)",
};

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const [fontsLoaded] = useFonts({
		"Lato-Regular": require("../assets/fonts/Lato-Regular.ttf"),
		"Lato-Bold": require("../assets/fonts/Lato-Bold.ttf"),
		DancingScript: require("../assets/fonts/DancingScript-Bold.ttf"),
	});

	if (!fontsLoaded) return null;
	return (
		<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
			<Stack>
				<Stack.Screen
					name="index"
					options={{ headerShown: false }}
				/>
				<Stack.Screen
					name="(auth)"
					options={{ headerShown: false }}
				/>
				<Stack.Screen
					name="(tabs)"
					options={{ headerShown: false }}
				/>
				<Stack.Screen
					name="modal"
					options={{ presentation: "modal", title: "Modal" }}
				/>
			</Stack>
			<StatusBar style="dark" />
		</ThemeProvider>
	);
}
