import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors as c } from "@/theme/shopping";

const tabs = [
  ["index", "Inicio", "home-outline"],
  ["categorias", "Categorías", "grid-outline"],
  ["publicar", "Publicar", "add-circle"],
  ["mis-productos", "Mis productos", "bag-outline"],
  ["cuenta", "Mi cuenta", "person-outline"],
] as const;
export default function TabsLayout() {
  return (
    <Tabs
      backBehavior="history"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.muted,
        tabBarStyle: {
          borderTopColor: c.border,
          backgroundColor: "white",
          minHeight: 64,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: "600" },
      }}
    >
      {tabs.map(([name, title, icon]) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ color }) => (
              <Ionicons
                name={icon}
                size={name === "publicar" ? 34 : 23}
                color={
                  name === "publicar"
                    ? c.primary
                    : typeof color === "string"
                      ? color
                      : c.muted
                }
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
