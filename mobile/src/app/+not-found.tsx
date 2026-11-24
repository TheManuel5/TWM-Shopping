import { router } from "expo-router";
import { Button, Message, Page } from "@/components/shopping/ui";
export default function NotFound() {
  return (
    <Page>
      <Message title="Esta página no está disponible" />
      <Button title="Ir al inicio" onPress={() => router.replace("/")} />
    </Page>
  );
}
