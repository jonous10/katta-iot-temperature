"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import TemperatureDisplay from "./components/temp-display";
import TempHistoryDisplay from "./components/temp-history-display";
import { usePermissions } from "../hooks/usePermissions";
import VideoBackground from "./components/VideoBackground";
import Header from "./components/Header";

// Define the interface for API response data
interface ApiSensorData {
  ts: string;
  temperature: number;
}

export default function Home() {
  const [apiData, setApiData] = useState<any[] | { error: string } | null>(
    null,
  );
  const { hasPermission, userType, loading, isAdmin } = usePermissions();

  // Fetch data on component mount
  useEffect(() => {
    if (hasPermission("VIEW_TEMPERATURE")) {
      fetchSensorData();
    }
  }, [userType, loading]); // Depend on userType and loading, not the function

  // Transform API data to match SensorData interface if available
  const displayData =
    apiData && !("error" in apiData)
      ? apiData.map((item: any) => ({
        ts: item.ts || item.timestamp, // Handle both 'ts' and 'timestamp'
        temperature: item.temperature,
      }))
      : [];

  console.log("API Data:", apiData);
  console.log("Display Data:", displayData);

  const fetchSensorData = async () => {
    try {
      const response = await fetch("/api");
      const result = await response.json();
      console.log("Fetch result:", result);
      setApiData(result);
    } catch (err) {
      console.error("Fetch error:", err);
      setApiData({ error: "Network error: " + err });
    }
  };

  return (
    <>
      <Header currentUser={userType || "Guest"} userType={userType} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome to Temperature Monitor
                </h2>
                <p className="text-gray-600">
                  Real-time temperature monitoring and analytics for your IoT
                  sensors
                </p>
              </div>
              <div className="hidden sm:block">
                <div className="w-16 h-16 clean-blue-fade rounded-2xl flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Status Card */}
        <div className="mb-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-md p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {userType?.charAt(0)?.toUpperCase() || "G"}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Logged in as:{" "}
                    <span className="capitalize font-semibold">
                      {userType || "Guest"}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {loading
                      ? "Loading permissions..."
                      : `Permissions: ${hasPermission("VIEW_TEMPERATURE") ? "Full access" : "Limited access"}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${hasPermission("VIEW_TEMPERATURE") ? "bg-green-500" : "bg-yellow-500"}`}
                ></div>
                <span className="text-sm text-gray-600">
                  {hasPermission("VIEW_TEMPERATURE") ? "Active" : "Restricted"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {hasPermission("VIEW_TEMPERATURE") ? (
          <div className="space-y-8">
            {/* Temperature Display Section */}

            {/* Temperature History Section */}
            {hasPermission("VIEW_TEMPERATURE_HISTORY") ? (
              <section className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Temperature History
                  </h3>
                  <p className="text-gray-600">
                    Analyze temperature trends over time
                  </p>
                </div>
                <TempHistoryDisplay data={displayData} />
              </section>
            ) : (
              <div className="flex justify-center items-center">
                <section className="bg-white rounded-full border border-gray-200 shadow-lg p-6 mx-auto my-auto inline-block">
                  <div className="text-center my-10">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Current Temperature
                    </h3>
                    <p className="text-gray-600">
                      Live reading from your IoT sensors
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <TemperatureDisplay
                      temperature={
                        displayData.length > 0
                          ? displayData[displayData.length - 1].temperature
                          : 0
                      }
                    />
                  </div>
                </section>
              </div>
            )}

            {/* Admin Controls Section */}
            {isAdmin() && (
              <section className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border border-red-200 shadow-lg p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-red-900 mb-2">
                    Admin Controls
                  </h3>
                  <p className="text-red-700">
                    Advanced administrative functions
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <button className="px-6 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] flex items-center justify-center space-x-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span>Export Data</span>
                  </button>
                  <button className="px-6 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] flex items-center justify-center space-x-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    <span>Manage Users</span>
                  </button>
                  <button className="px-6 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] flex items-center justify-center space-x-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>Settings</span>
                  </button>
                </div>
              </section>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200 shadow-lg p-8 text-center max-w-md">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-yellow-900 mb-2">
                Access Restricted
              </h3>
              <p className="text-yellow-800 mb-4">
                You don't have permission to view temperature data.
              </p>
              <p className="text-sm text-yellow-700">
                Contact an administrator for access.
              </p>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
