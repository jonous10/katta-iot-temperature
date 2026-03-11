"use client"

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import data from "./example-data/data.json";
import TemperatureDisplay from "./components/temp-display";
import TempHistoryDisplay from "./components/temp-history-display";

console.log(data);

export default function Home() {
  const [apiData, setApiData] = useState<any>(null);

  const fetchSensorData = async () => {
    try {
      const response = await fetch('/api');
      const result = await response.json();
      setApiData(result);
    } catch (err) {
      setApiData({ error: 'Network error: ' + err });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 font-sans">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-center py-16 px-8">
        <TemperatureDisplay temperature={data[data.length - 1].temperature} />
        <div className="mt-8 w-full">
          <TempHistoryDisplay data={data} />
        </div>

        <div className="mt-8 w-full">
          <button onClick={fetchSensorData} className="px-4 py-2 bg-blue-500 text-white rounded">
            Test API
          </button>
          {apiData && (
            <pre className="mt-4 bg-gray-100 p-2 text-xs text-black">
              {JSON.stringify(apiData, null, 2)}
            </pre>
          )}
        </div>

      </main>
    </div>
  );
}
