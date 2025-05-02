import { useGlobalSearchParams, usePathname } from "expo-router";
import { useEffect } from "react";

export function useScreenTracking() {
  const pathname = usePathname();
  const params = useGlobalSearchParams();

  // Set global screen info immediately
  global.currentScreenPath = pathname;
  global.currentScreenParams = params;

  useEffect(() => {
    if (__DEV__) {
      console.log("Tracking screen:", pathname, params);
    }
  }, [pathname, params]);
}
