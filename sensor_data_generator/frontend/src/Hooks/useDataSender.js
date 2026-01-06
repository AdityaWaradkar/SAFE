import { useEffect, useRef } from "react";

const SEND_INTERVAL = 5000;

export default function useDataSender(activeRegion, regionValues) {
  const latestRef = useRef({
    activeRegion,
    regionValues,
  });

  const endpoint = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    latestRef.current = {
      activeRegion,
      regionValues,
    };
  }, [activeRegion, regionValues]);

  useEffect(() => {
    if (!endpoint) return;

    const interval = setInterval(() => {
      const { activeRegion, regionValues } = latestRef.current;

      const payload = {
        timestamp: new Date().toISOString(),
        activeRegion,
        regions: Object.fromEntries(
          Object.entries(regionValues).map(([region, values]) => [
            region,
            {
              flame: values[0],
              smoke: values[1],
              temperature: values[2],
            },
          ])
        ),
      };

      fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }).catch(() => {});
    }, SEND_INTERVAL);

    return () => clearInterval(interval);
  }, [endpoint]);
}
