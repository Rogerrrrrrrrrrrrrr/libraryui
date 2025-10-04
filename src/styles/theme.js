export const Colors = {
  primary: "#00695c",      
  primaryLight: "#26a69a", 
  secondary: "#43cea2",     
  secondaryDark: "#185a9d",
  accent: "#ff7043",       
  background: "#f9f9f9",    
  card: "#fff",              
  text: "#212121",           
  textLight: "#666",        
  error: "#d32f2f",         
  shadow: "#000",
};

export const Typography = {
  heading: { fontSize: 26, fontWeight: "bold" },
  title: { fontSize: 20, fontWeight: "600" },
  body: { fontSize: 16, fontWeight: "400" },
  caption: { fontSize: 13, fontWeight: "400" },
};

export const ButtonStyles = {
  primary: {
    background: [Colors.primaryLight, Colors.primary],
    textColor: "#fff",
    borderRadius: 12,
    paddingVertical: 14,
    shadow: { color: Colors.shadow, opacity: 0.2, radius: 6, offset: { width: 0, height: 3 } },
  },
  secondary: {
    background: [Colors.secondary, Colors.secondaryDark],
    textColor: "#fff",
    borderRadius: 12,
    paddingVertical: 14,
    shadow: { color: Colors.shadow, opacity: 0.15, radius: 5, offset: { width: 0, height: 3 } },
  },
};
