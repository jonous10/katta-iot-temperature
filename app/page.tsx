"use client"

import { useEffect, useState } from "react";
import TemperatureDisplay from "@/components/temp-display";
import TempHistoryDisplay from "@/components/temp-history-display";

// Define the interface for API response data
interface ApiSensorData {
  ts: string;
  temperature: number;
}

export default function Home() {
  const [apiData, setApiData] = useState<any[] | { error: string } | null>(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchSensorData();
  }, []);

  // Transform API data to match SensorData interface if available
  const displayData = apiData && !('error' in apiData) ?
    apiData.map((item: any) => ({
      ts: item.ts || item.timestamp,  // Handle both 'ts' and 'timestamp'
      temperature: item.temperature
    })) : [];

  console.log("API Data:", apiData);
  console.log("Display Data:", displayData);

  const fetchSensorData = async () => {
    try {
      const response = await fetch('/api');
      const result = await response.json();
      console.log("Fetch result:", result);
      setApiData(result);
    } catch (err) {
      console.error("Fetch error:", err);
      setApiData({ error: 'Network error: ' + err });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 font-sans">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-center py-16 px-8">
        <TemperatureDisplay temperature={displayData.length > 0 ? displayData[displayData.length - 1].temperature : 0} />
        <div className="mt-8 w-full">
          <TempHistoryDisplay data={displayData} />
        </div>
      </main>
    </div>
  );
}
