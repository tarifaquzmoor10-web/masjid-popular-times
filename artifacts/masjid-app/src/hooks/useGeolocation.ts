import { useState, useEffect, useCallback, useRef } from 'react';
import type { UserLocation } from '../types';

interface GeolocationState {
  location: UserLocation | null;
  error: string | null;
  loading: boolean;
  permissionDenied: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    loading: true,
    permissionDenied: false,
  });

  const watchIdRef = useRef<number | null>(null);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({ ...prev, error: 'Geolocation not supported', loading: false }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    const options: PositionOptions = { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 };

    const onSuccess = (position: GeolocationPosition) => {
      setState({
        location: {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        },
        error: null,
        loading: false,
        permissionDenied: false,
      });
    };

    const onError = (error: GeolocationPositionError) => {
      if (error.code === error.PERMISSION_DENIED) {
        setState((prev) => ({ ...prev, error: 'Location permission denied', loading: false, permissionDenied: true }));
        return;
      }
      setState((prev) => ({ ...prev, error: 'Unable to get location', loading: false }));
    };

    watchIdRef.current = navigator.geolocation.watchPosition(onSuccess, onError, options);
    navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
  }, []);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const retry = useCallback(() => {
    stopTracking();
    startTracking();
  }, [startTracking, stopTracking]);

  useEffect(() => {
    startTracking();
    return () => stopTracking();
  }, [startTracking, stopTracking]);

  return { ...state, retry, startTracking, stopTracking };
}
