import { useEffect, useRef } from "react";

const SEND_INTERVAL = 5000;
const BASE_URL = "https://safe-0vvn.onrender.com/data";

export default function useDataSender(regionValues) {
  const latestRef = useRef(regionValues);

  // Keep latest region values reference
  useEffect(() => {
    latestRef.current = regionValues;
  }, [regionValues]);

  // Periodically send data for all regions
  useEffect(() => {
    const interval = setInterval(() => {
      const regions = latestRef.current;

      Object.entries(regions).forEach(([region, values]) => {
        if (!values) return;

        const payload = {
          timestamp: new Date().toISOString(),
          region,
          data: {
            flame: values[0],
            smoke: values[1],
            temperature: values[2],
          },
        };

        fetch(`${BASE_URL}/${region}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).catch(() => {});
      });
    }, SEND_INTERVAL);

    return () => clearInterval(interval);
  }, []);
}
