import { StyleSheet } from "react-native";
import { Colors } from "./theme";

export const inputStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  input: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: Colors.text,
  },
  icon: { marginRight: 8 },
  eyeIcon: { paddingHorizontal: 6 },
  errorText: { color: Colors.error, fontSize: 12, marginBottom: 6, marginLeft: 4 },
});
