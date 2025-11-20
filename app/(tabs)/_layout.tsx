import { Stack } from "expo-router";
import React from "react";

export default function TabLayout() {
	return (
		<Stack>
			<Stack.Screen
				name="index"
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="Home"
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="Notification"
				options={{ headerShown: false }}
			/>
		</Stack>
	);
}
