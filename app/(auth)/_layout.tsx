import { useAuth } from "@/store/AuthContext";
import { useRouter } from "expo-router";
import { Stack } from "expo-router";
import { useEffect } from "react";

export default function RootLayout() {
	const { token } = useAuth();
	const router = useRouter();

	// useEffect(() => {
	// 	if (token !== null) {
	// 		router.replace("/(main)"); // replaces instead of pushing
	// 	}
	// }, [token, router]);

	// if (token !== null) {
	// 	return null; // optional loader
	// }
	return (
		<Stack>
			<Stack.Screen
				name="LoginScreen"
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="RegisterScreen"
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="ForgotPassScreen"
				options={{ headerShown: false }}
			/>
		</Stack>
	);
}
