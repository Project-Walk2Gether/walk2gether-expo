// src/geolocation-shim.ts
import * as Location from "expo-location";

type Position = {
  coords: {
    latitude: number;
    longitude: number;
    altitude: number | null;
    accuracy: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number;
};

type Success = (pos: Position) => void;
type ErrorFn = (err: { code: number; message: string }) => void;

let nextWatchId = 1;
const watchers = new Map<number, Promise<Location.LocationSubscription>>();

function toPosition(loc: Location.LocationObject): Position {
  const { coords, timestamp } = loc;
  return {
    coords: {
      latitude: coords.latitude,
      longitude: coords.longitude,
      altitude: coords.altitude ?? null,
      accuracy: coords.accuracy ?? null,
      altitudeAccuracy: coords.altitudeAccuracy ?? null,
      heading: Number.isFinite(coords.heading) ? coords.heading : null,
      speed: Number.isFinite(coords.speed) ? coords.speed : null,
    },
    timestamp,
  };
}

function mapError(e: unknown) {
  const message = e instanceof Error ? e.message : String(e);
  // 1: PERMISSION_DENIED, 2: POSITION_UNAVAILABLE, 3: TIMEOUT
  return { code: 2, message };
}

function accuracyFrom(enableHighAccuracy?: boolean) {
  return enableHighAccuracy
    ? Location.Accuracy.High
    : Location.Accuracy.Balanced;
}

async function ensurePermission() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    throw Object.assign(new Error("Location permission not granted"), {
      code: 1,
    });
  }
}

export const GeoShim = {
  async getCurrentPosition(
    success: Success,
    error?: ErrorFn,
    options?: {
      enableHighAccuracy?: boolean;
      timeout?: number;
      maximumAge?: number;
    }
  ) {
    try {
      await ensurePermission();

      const positionPromise = Location.getCurrentPositionAsync({
        accuracy: accuracyFrom(options?.enableHighAccuracy),
      });

      if (options?.timeout && options.timeout > 0) {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(
            () =>
              reject(Object.assign(new Error("Location timeout"), { code: 3 })),
            options.timeout
          )
        );
        const pos = await Promise.race([positionPromise, timeoutPromise]);
        success(toPosition(pos as Location.LocationObject));
      } else {
        const pos = await positionPromise;
        success(toPosition(pos));
      }
    } catch (e) {
      error?.(mapError(e));
    }
  },

  async watchPosition(
    success: Success,
    error?: ErrorFn,
    options?: {
      enableHighAccuracy?: boolean;
      distanceFilter?: number; // RN prop name sometimes used
      distanceInterval?: number; // expo-location name
      timeInterval?: number;
    }
  ): Promise<number> {
    try {
      await ensurePermission();

      const id = nextWatchId++;
      const subPromise = Location.watchPositionAsync(
        {
          accuracy: accuracyFrom(options?.enableHighAccuracy),
          // distanceInterval is honored on Android; falls back to timeInterval otherwise
          distanceInterval:
            (options as any)?.distanceInterval ??
            (options as any)?.distanceFilter ??
            0,
          timeInterval: options?.timeInterval,
        },
        (loc) => {
          try {
            success(toPosition(loc));
          } catch (e) {
            error?.(mapError(e));
          }
        }
      );
      watchers.set(id, subPromise);
      return id;
    } catch (e) {
      error?.(mapError(e));
      return -1;
    }
  },

  async clearWatch(id: number) {
    const subPromise = watchers.get(id);
    if (subPromise) {
      const sub = await subPromise;
      sub.remove();
      watchers.delete(id);
    }
  },

  async stopObserving() {
    for (const [, subPromise] of watchers) {
      const sub = await subPromise;
      sub.remove();
    }
    watchers.clear();
  },
};
