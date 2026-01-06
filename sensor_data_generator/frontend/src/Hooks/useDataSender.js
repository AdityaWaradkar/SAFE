import { useEffect, useRef } from "react";

const SEND_INTERVAL = 5000;
const ENDPOINT = "https://safe-0vvn.onrender.com/data";

export default function useDataSender(activeRegion, regionValues) {
  const latestRef = useRef({
    activeRegion,
    regionValues,
  });

  useEffect(() => {
    latestRef.current = {
      activeRegion,
      regionValues,
    };
  }, [activeRegion, regionValues]);

  useEffect(() => {
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

      fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }).catch((err) => {
        console.error("Data send failed:", err);
      });
    }, SEND_INTERVAL);

    return () => clearInterval(interval);
  }, []);
}
