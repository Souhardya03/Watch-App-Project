import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router"; // Added hooks
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "../global.css";
import { useFonts } from "expo-font";
import { useColorScheme } from "@/hooks/use-color-scheme";
import Providers from "@/store/provider";
import ReactQueryProvider from "@/store/query-client";
import { AuthProvider, useAuth } from "@/store/AuthContext";
import { useEffect } from "react";

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

/* ----------------------------------------- */

function RootNavigator() {
	const { token, isLoading } = useAuth();
	const segments = useSegments(); // Gets the current path segments
	const router = useRouter();

	useEffect(() => {
		if (isLoading) return;

		const inAuthGroup = segments[0] === "(auth)";
		const inTabsGroup = segments[0] === "(tabs)";
		const inProfile = segments[0] === "profile";

		// Cast to string to fix TS error
		const currentSegment = segments[0] as string | undefined;
		const atIndex = segments.length as number === 0 || currentSegment === "index";

		// 1. LOGOUT LOGIC
		if (!token && (inTabsGroup || inProfile)) {
			// A. Dismiss all screens in the stack (clears history)
			if (router.canDismiss()) {
				router.dismissAll();
			}
			// B. Replace with Login
			router.replace("/(auth)/LoginScreen");
		}

		// 2. LOGIN LOGIC
		else if (token && (inAuthGroup || atIndex)) {
			// A. Dismiss auth screens (clears history)
			if (router.canDismiss()) {
				router.dismissAll();
			}
			// B. Replace with Tabs
			router.replace("/(tabs)");
		}
	}, [token, segments, isLoading]);

	// Return ONE Stack with ALL screens available
	return (
		<Stack screenOptions={{ headerShown: false }}>
			{/* Public Screens */}
			<Stack.Screen name="index" />
			<Stack.Screen name="(auth)" />

			{/* Protected Screens */}
			<Stack.Screen name="(tabs)" />
			<Stack.Screen name="profile" />
		</Stack>
	);
}
