"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import TemperatureDisplay from "@/app/components/temp-display";
import TempHistoryDisplay from "@/app/components/temp-history-display";
import { usePermissions } from "@/hooks/usePermissions";
import VideoBackground from "@/app/components/VideoBackground";
import Header from "@/app/components/Header";

interface ApiSensorData {
    ts: string;
    temperature: number;
}

export default function Home() {
    const [apiData, setApiData] = useState<any[] | { error: string } | null>(null);
    const { hasPermission, userType, loading, isAdmin } = usePermissions();
    const [sortField, setSortField] = useState<"ts" | "temperature" | null>(null);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

    const handleSort = (field: "ts" | "temperature") => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("desc");
        }
    };

    useEffect(() => {
        if (hasPermission("VIEW_TEMPERATURE")) {
            fetchSensorData();
        }
    }, [userType, loading]);

    const displayData =
        apiData && !("error" in apiData)
            ? apiData.map((item: any) => ({
                ts: item.ts || item.timestamp,
                temperature: item.temperature,
            }))
            : [];

    const fetchSensorData = async () => {
        try {
            const response = await fetch("/api");
            const result = await response.json();
            setApiData(result);
        } catch (err) {
            console.error("Fetch error:", err);
            setApiData({ error: "Network error: " + err });
        }
    };

    const handleDelete = async (ts: string) => {
        if (!confirm("Are you sure you want to delete this reading?")) return;

        try {
            const res = await fetch("/api/data", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ts }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to delete record");

            await fetchSensorData();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to delete record");
        }
    };

    const sortedData = [...displayData].sort((a, b) => {
        if (!sortField) return 0;

        if (sortField === "ts") {
            return sortDirection === "asc"
                ? new Date(a.ts).getTime() - new Date(b.ts).getTime()
                : new Date(b.ts).getTime() - new Date(a.ts).getTime();
        }

        if (sortField === "temperature") {
            return sortDirection === "asc"
                ? a.temperature - b.temperature
                : b.temperature - a.temperature;
        }

        return 0;
    });

    const canDelete = hasPermission("DELETE_DATA");

    return (
        <>
            <Header currentUser={userType || "Guest"} userType={userType} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    Welcome to Temperature Monitor
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Real-time temperature monitoring and analytics for your IoT sensors
                                </p>
                            </div>
                            <div className="hidden sm:block">
                                <div className="w-16 h-16 clean-blue-fade rounded-2xl flex items-center justify-center">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* User Status Card */}
                <div className="mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                                    <span className="text-white font-medium">
                                        {userType?.charAt(0)?.toUpperCase() || "G"}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        Logged in as:{" "}
                                        <span className="capitalize font-semibold">
                                            {userType || "Guest"}
                                        </span>
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {loading
                                            ? "Loading permissions..."
                                            : `Permissions: ${hasPermission("VIEW_TEMPERATURE") ? "Full access" : "Limited access"}`}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${hasPermission("VIEW_TEMPERATURE") ? "bg-green-500" : "bg-yellow-500"}`}></div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {hasPermission("VIEW_TEMPERATURE") ? "Active" : "Restricted"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                {hasPermission("VIEW_TEMPERATURE") ? (
                    <div className="space-y-8">
                        {hasPermission("VIEW_TEMPERATURE_HISTORY") ? (
                            <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-6">
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                        Temperature History
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">Analyze temperature trends over time</p>
                                </div>
                                <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Temperature History</h2>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Raw sensor readings</p>
                                    </div>

                                    <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                                            <tr>
                                                <th
                                                    onClick={() => handleSort("ts")}
                                                    className="cursor-pointer px-6 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-left"
                                                >
                                                    Timestamp {sortField === "ts" && (sortDirection === "asc" ? "↑" : "↓")}
                                                </th>
                                                <th
                                                    onClick={() => handleSort("temperature")}
                                                    className="cursor-pointer px-6 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-left"
                                                >
                                                    Temperature (°C) {sortField === "temperature" && (sortDirection === "asc" ? "↑" : "↓")}
                                                </th>
                                                {canDelete && (
                                                    <th className="px-6 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-left">
                                                        Actions
                                                    </th>
                                                )}
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {sortedData.length > 0 ? (
                                                sortedData.map((row, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                        <td className="px-6 py-4 text-gray-800 dark:text-gray-200">{row.ts}</td>
                                                        <td className="px-6 py-4 text-gray-800 dark:text-gray-200">{row.temperature}</td>
                                                        {canDelete && (
                                                            <td className="px-6 py-4">
                                                                <button
                                                                    onClick={() => handleDelete(row.ts)}
                                                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </td>
                                                        )}
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan={canDelete ? 3 : 2}
                                                        className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                                                    >
                                                        No temperature data available
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </section>
                            </section>
                        ) : (
                            <div className="flex justify-center items-center">
                                <section className="bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 shadow-lg p-6 mx-auto my-auto inline-block">
                                    <div className="text-center my-10">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                            Current Temperature
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400">Live reading from your IoT sensors</p>
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
                    </div>
                ) : (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-2xl border border-yellow-200 dark:border-yellow-800 shadow-lg p-8 text-center max-w-md">
                            <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-yellow-900 dark:text-yellow-400 mb-2">Access Restricted</h3>
                            <p className="text-yellow-800 dark:text-yellow-500 mb-4">You don't have permission to view temperature data.</p>
                            <p className="text-sm text-yellow-700 dark:text-yellow-600">Contact an administrator for access.</p>
                        </div>
                    </div>
                )}
            </main>
        </>
    );
}