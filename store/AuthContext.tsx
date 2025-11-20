"use client";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import { useGetProfileQuery } from "./baseApi";
import { useRouter } from "expo-router";

interface AuthContextType {
	token: string | null;
	data: any;
	refreshToken: () => void;
	refetch: () => void;
	isLoading: boolean;
	setToken: (token: string | null) => void;
	handleLogout: () => void;
}

const AuthContext = createContext<AuthContextType>({
	token: null,
	data: null,
	refreshToken: () => {},
	refetch: () => {},
	isLoading: false,
	setToken: () => {},
	handleLogout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const { data, refetch, isLoading } = useGetProfileQuery();
	const [token, setToken] = useState<string | null>(null);
	const refreshToken = async () => {
		const token = await AsyncStorage.getItem("token");
		console.log(token);

		setToken(token);
		refetch();
	};
	const router = useRouter();

	const handleLogout = async () => {
		await AsyncStorage.removeItem("token");
		refreshToken();
		refetch()
		router.dismissAll();
		router.replace("/(auth)/LoginScreen");
	};

	useEffect(() => {
		refreshToken(); // on first load
	}, []);

	return (
		<AuthContext.Provider
			value={{
				token,
				refreshToken,
				data,
				refetch,
				isLoading,
				setToken,
				handleLogout,
			}}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
