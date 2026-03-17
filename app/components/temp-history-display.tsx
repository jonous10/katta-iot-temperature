"use client"

import { useEffect, useRef, useState } from "react";
import TemperatureDisplay from "./temp-display";

interface SensorData {
    ts: string;
    temperature: number;
}

interface TempHistoryDisplayProps {
    data: SensorData[];
    hoursToShow?: number;
}

export default function TempHistoryDisplay({ data }: TempHistoryDisplayProps) {
    const [hoursToShow, setHoursToShow] = useState(24);
    const [sortedData, setSortedData] = useState<SensorData[]>([]);

    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstanceRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            console.log("Chart received data:", data);
            console.log("Data length:", data.length);
            console.log("Hours to show:", hoursToShow);

            if (data.length === 0) {
                console.log("No data to display");
                return;
            }

            // Find the latest timestamp in the data
            const latestTimestamp = new Date(Math.max(...data.map(item => new Date(item.ts).getTime())));
            const cutoffTime = new Date(latestTimestamp.getTime() - hoursToShow * 60 * 60 * 1000);

            console.log("Latest timestamp:", latestTimestamp);
            console.log("Cutoff time:", cutoffTime);

            // Filter data to show only data within the selected time range
            let filteredData = data.filter(item => new Date(item.ts) >= cutoffTime);

            console.log("Filtered data length:", filteredData.length);

            // Sort data by timestamp (oldest first for chart)
            filteredData.sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());

            // Convert timestamps to milliseconds for proper time-based chart
            const timestampData = filteredData.map(item => ({
                x: new Date(item.ts).getTime(),
                y: item.temperature
            }));

            console.log("Chart data points:", timestampData.length);

            // Dynamically import ApexCharts
            import('apexcharts').then((ApexCharts) => {
                const chartConfig: any = {
                    series: [
                        {
                            name: "Temperature",
                            data: timestampData,
                        },
                    ],
                    chart: {
                        type: "line",
                        height: 240,
                        toolbar: {
                            show: false,
                        },
                    },
                    title: {
                        show: "",
                    },
                    dataLabels: {
                        enabled: false,
                    },
                    colors: ["#ffed86ff"],
                    stroke: {
                        lineCap: "round",
                        curve: "smooth",
                    },
                    markers: {
                        size: 0,
                    },
                    xaxis: {
                        type: "datetime",
                        axisTicks: {
                            show: true,
                        },
                        axisBorder: {
                            show: false,
                        },
                        labels: {
                            style: {
                                colors: "#616161",
                                fontSize: "12px",
                                fontFamily: "inherit",
                                fontWeight: 400,
                            },
                            datetimeFormatter: {
                                year: 'yyyy',
                                month: 'MMM yy',
                                day: 'dd MMM',
                                hour: 'HH:mm',
                                minute: 'HH:mm'
                            }
                        },
                    },
                    yaxis: {
                        labels: {
                            style: {
                                colors: "#616161",
                                fontSize: "12px",
                                fontFamily: "inherit",
                                fontWeight: 400,
                            },
                        },
                    },
                    grid: {
                        show: true,
                        borderColor: "#dddddd",
                        strokeDashArray: 5,
                        xaxis: {
                            lines: {
                                show: true,
                            },
                        },
                        padding: {
                            top: 5,
                            right: 0,
                        },
                    },
                    fill: {
                        opacity: 0.8,
                    },
                    tooltip: {
                        theme: "dark",
                        x: {
                            format: 'dd MMM yyyy HH:mm'
                        }
                    },
                };

                // Destroy existing chart if it exists
                if (chartInstanceRef.current) {
                    chartInstanceRef.current.destroy();
                }

                // Create new chart
                const chart = new ApexCharts.default(chartRef.current as HTMLElement, chartConfig);
                chart.render();
                chartInstanceRef.current = chart;

                return () => {
                    if (chartInstanceRef.current) {
                        chartInstanceRef.current.destroy();
                        chartInstanceRef.current = null;
                    }
                };
            });
        }
    }, [data, hoursToShow]);

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Title and current temp */}
                    <div className="flex items-center gap-4">
                        <TemperatureDisplay temperature={data[data.length - 1]?.temperature || 0} size="small" />
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">
                                Temperature Analytics
                            </h3>
                            <p className="text-sm text-gray-600">
                                Monitor temperature trends over time
                            </p>
                        </div>
                    </div>

                    {/* Time range selector */}
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Range:</label>
                        <select
                            value={hoursToShow}
                            onChange={(e) => setHoursToShow(Number(e.target.value))}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm hover:border-gray-400 transition-colors"
                        >
                            <option value={1}>1 Hour</option>
                            <option value={6}>6 Hours</option>
                            <option value={24}>24 Hours</option>
                            <option value={48}>2 Days</option>
                            <option value={120}>5 Days</option>
                            <option value={168}>1 Week</option>
                            <option value={744}>1 Month</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Chart container */}
            <div className="p-6 bg-gray-50/30">
                <div ref={chartRef} className="w-full min-h-[300px]"></div>
            </div>
        </div>
    );
}