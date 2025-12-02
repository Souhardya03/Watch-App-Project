import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import React from "react";
import { Bell } from "lucide-react-native";
import { useRouter } from "expo-router";

type HeaderProps = {
	name: string;
	profilePic?: string | null; // Made optional/nullable
};

const Header: React.FC<HeaderProps> = ({ name, profilePic }) => {
	// Helper function to get initials (e.g. "Suchintan Roy" -> "SR")
	const getInitials = (fullName: string) => {
		if (!fullName) return "?";
		const names = fullName.trim().split(" ");
		if (names.length === 1) return names[0].charAt(0).toUpperCase();
		return (
			names[0].charAt(0) + names[names.length - 1].charAt(0)
		).toUpperCase();
	};
	const router = useRouter();

	return (
		<View style={styles.container}>
			<View style={styles.leftSection}>
				{/* Conditional Rendering: Image OR Initials */}
				<TouchableOpacity activeOpacity={0.8} onPress={()=>router.push("/profile")}>
					{profilePic ? (
						<Image
							source={{ uri: profilePic }}
							style={styles.profilePic}
							resizeMode="cover"
						/>
					) : (
						<View style={[styles.profilePic, styles.avatarPlaceholder]}>
							<Text style={styles.avatarText}>{getInitials(name)}</Text>
						</View>
					)}
				</TouchableOpacity>

				<View>
					<Text style={styles.hello}>Hello, {name.split(" ")[0]}!</Text>
				</View>
			</View>

			<TouchableOpacity
				activeOpacity={0.8}
				onPress={() => router.push("/(main)/Notification")}
				style={styles.notifButton}>
				<Bell
					size={24}
					color="black"
				/>
			</TouchableOpacity>
		</View>
	);
};

export default Header;

const styles = StyleSheet.create({
	container: {
		width: "100%",
		paddingHorizontal: 20,
		paddingTop: 10,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	leftSection: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	profilePic: {
		width: 48,
		height: 48,
		borderRadius: 24,
	},
	// New styles for the Initials Placeholder
	avatarPlaceholder: {
		backgroundColor: "#E0E0E0", // Light gray background
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 1,
		borderColor: "#D1D1D1",
	},
	avatarText: {
		fontSize: 18,
		fontWeight: "700",
		color: "#555",
	},
	hello: {
		fontSize: 18,
		fontWeight: "600",
		color: "#000",
		paddingRight: 16,
	},
	notifButton: {
		padding: 8,
		backgroundColor: "#fff",
		borderRadius: 30,
		elevation: 3,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.15,
		shadowRadius: 2,
	},
});
