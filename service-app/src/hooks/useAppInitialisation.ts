import { useState, useEffect } from "react";
import { loadFonts } from "@/src/config/fonts";

interface AppState {
  isReady: boolean;
  // isLocationReady: boolean;
  fontsLoaded: boolean;
  // userLoaded: boolean;
  // isEventConfigLoading: boolean;
}

export const useAppInitialization = () => {
  const [appState, setAppState] = useState<AppState>({
    isReady: false,
    // isLocationReady: false,
    fontsLoaded: false,
    // userLoaded: false,
    // isEventConfigLoading: true,
  });

  // const { initializeLocation } = useLocationSetup();
  // const { initializeUser } = useUserSetup();
  // const { fetchEventConfig } = useEventConfigSetup();

  useEffect(() => {
    async function initialize() {
      try {
        const [fontsLoaded] = await Promise.all([loadFonts()]);

        setAppState({
          isReady: true,
          fontsLoaded: true,
        });
      } catch (error) {
        console.error("App initialization error:", error);
        setAppState((prev) => ({ ...prev, isReady: true }));
      }
    }

    initialize();
  }, []);

  return { appState };
};
