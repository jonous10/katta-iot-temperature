"use client"

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import TemperatureDisplay from "./components/temp-display";
import TempHistoryDisplay from "./components/temp-history-display";
import { usePermissions } from "../hooks/usePermissions";

// Define the interface for API response data
interface ApiSensorData {
  ts: string;
  temperature: number;
}

export default function Home() {
  const [apiData, setApiData] = useState<any[] | { error: string } | null>(null);
  const { hasPermission, userType, loading, isAdmin } = usePermissions();

  // Fetch data on component mount
  useEffect(() => {
    if (hasPermission('VIEW_TEMPERATURE')) {
      fetchSensorData();
    }
  }, [userType, loading]); // Depend on userType and loading, not the function

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

        {/* User info and permissions display */}
        <div className="w-full mb-4 p-4 bg-white rounded-lg shadow">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm text-gray-600">Logged in as: </span>
              <span className="font-semibold capitalize">{userType || 'Unknown'}</span>
            </div>
            <div className="text-sm text-gray-500">
              {loading ? 'Loading permissions...' : `Permissions: ${hasPermission('VIEW_TEMPERATURE') ? 'Can view temperature' : 'Limited access'}`}
            </div>
          </div>
        </div>

        {/* Show temperature display if user has permission */}
        {hasPermission('VIEW_TEMPERATURE') ? (
          <>
            <TemperatureDisplay temperature={displayData.length > 0 ? displayData[displayData.length - 1].temperature : 0} />

            {/* Show history only if user has permission */}
            {hasPermission('VIEW_TEMPERATURE_HISTORY') && (
              <div className="mt-8 w-full">
                <TempHistoryDisplay data={displayData} />
              </div>
            )}

            {/* Admin-only controls */}
            {isAdmin() && (
              <div className="mt-8 w-full p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Admin Controls</h3>
                <div className="space-y-2">
                  <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                    Export Data
                  </button>
                  <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 ml-2">
                    Manage Users
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center p-8 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h2 className="text-xl font-semibold text-yellow-800">Access Restricted</h2>
            <p className="text-yellow-700 mt-2">You don't have permission to view temperature data.</p>
            <p className="text-sm text-yellow-600 mt-2">Contact an administrator for access.</p>
          </div>
        )}

      </main>
    </div>
  );
}
