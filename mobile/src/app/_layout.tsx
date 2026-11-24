import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { CatalogProvider } from "@/features/catalog/CatalogProvider";
import { View } from "react-native";
import { DetailTabBar } from "@/components/shopping/DetailTabBar";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <CatalogProvider>
        <StatusBar style="dark" />
        <View style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }} />
          <DetailTabBar />
        </View>
      </CatalogProvider>
    </SafeAreaProvider>
  );
}
