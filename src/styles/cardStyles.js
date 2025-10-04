import { StyleSheet } from "react-native";
import { Colors } from "./theme";

export const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 24,
    shadowColor: Colors.shadow,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  title: { fontSize: 26, fontWeight: "bold", color: Colors.primary, textAlign: "center" },
  subtitle: { fontSize: 14, color: Colors.textLight, marginBottom: 20, textAlign: "center" },
});
