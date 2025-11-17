import React, { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";
import Toast from "react-native-toast-message";

export default function NetworkListener() {
  const [toastShown, setToastShown] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = state.isConnected && state.isInternetReachable;

      if (!connected && !toastShown) {
        Toast.show({
          type: "error",
          text1: "No Internet Connection",
          text2: "Some features may not work",
          position: "top",
          autoHide: false, // keep it visible until back online
        });
        setToastShown(true);
      }

      if (connected && toastShown) {
        Toast.hide();
        Toast.show({
          type: "success",
          text1: "Back Online",
          position: "top",
          visibilityTime: 2000,
        });
        setToastShown(false);
      }
    });

    return () => unsubscribe();
  }, [toastShown]);

  return null;
}
