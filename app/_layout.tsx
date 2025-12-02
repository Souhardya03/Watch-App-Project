import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from "@react-navigation/native";
import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "../global.css";
import "react-native-reanimated";
import { useFonts } from "expo-font";
import { useColorScheme } from "@/hooks/use-color-scheme";
import Providers from "@/store/provider";
import ReactQueryProvider from "@/store/query-client";
import { AuthProvider, useAuth } from "@/store/AuthContext";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function RootLayout() {
	const colorScheme = useColorScheme();

	const [fontsLoaded] = useFonts({
		"Lato-Regular": require("../assets/fonts/Lato-Regular.ttf"),
		"Lato-Bold": require("../assets/fonts/Lato-Bold.ttf"),
		DancingScript: require("../assets/fonts/DancingScript-Bold.ttf"),
	});

	if (!fontsLoaded) return null;

	return (
		<Providers>
			<AuthProvider>
				<ThemeProvider
					value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
					<ReactQueryProvider>
						<RootNavigator />
						<StatusBar style="dark" />
					</ReactQueryProvider>
				</ThemeProvider>
			</AuthProvider>
		</Providers>
	);
}

/* -------------------------------------- */

function RootNavigator() {
	const { token, isLoading } = useAuth();
	const segments = useSegments();
	const router = useRouter();

	useEffect(() => {
		if (isLoading) return;

		const current = segments?.[0] as string | undefined;

		const inAuth = current === "(auth)";
		const inMain = current === "(main)";
		const inProfile = current === "profile";
		const atIndex = !current || current === "index";

		if (!token) {
			// must stay in index or (auth)
			if (inMain || inProfile) {
				router.replace("/(auth)/LoginScreen");
			}
			return; // <--- prevent second block firing
		}

		if (token) {
			// must stay inside (main) or profile
			if (inAuth || atIndex) {
				router.replace("/(main)");
			}
			return;
		}
	}, [token, segments, isLoading]);
	if (isLoading) {
		return (
			<View className="flex-1 bg-white items-center justify-center">
				<ActivityIndicator size={24} />
			</View>
		); // or null
	}

	return (
		<Stack screenOptions={{ headerShown: false }}>
			{/* Public screens */}
			<Stack.Screen name="index" />
			<Stack.Screen name="(auth)" />

			{/* Protected screens */}
			<Stack.Screen name="(main)" />
			<Stack.Screen name="profile" />
		</Stack>
	);
}
