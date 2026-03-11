"use client"

import { useEffect, useRef, useState } from "react";

interface TemperatureData {
    temperature: number;
    timestamp: string;
}

interface TempHistoryDisplayProps {
    data: TemperatureData[];
    hoursToShow?: number;
}

export default function TempHistoryDisplay({ data }: TempHistoryDisplayProps) {
    const [hoursToShow, setHoursToShow] = useState(24);
    const [sortedData, setSortedData] = useState<TemperatureData[]>([]);

    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstanceRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Filter data to show last N hours
            // Find the latest timestamp in the data to use as "now" for demo purposes
            const latestTimestamp = new Date(Math.max(...data.map(item => new Date(item.timestamp).getTime())));
            const now = latestTimestamp;
            const cutoffTime = new Date(now.getTime() - hoursToShow * 60 * 60 * 1000);
            let filteredData = data.filter(item => new Date(item.timestamp) >= cutoffTime);

            // If no data within the time window (demo data is old), show all data
            if (filteredData.length === 0) {
                filteredData = [...data];
            }

            // Sort filtered data by timestamp (oldest first for chart)
            filteredData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

            // Convert timestamps to milliseconds for proper time-based chart
            const timestampData = filteredData.map(item => ({
                x: new Date(item.timestamp).getTime(),
                y: item.temperature
            }));

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
        <div className="relative flex flex-col rounded-xl bg-white bg-clip-border text-gray-700 shadow-md mt-8 w-full">
            <div className="relative mx-4 mt-4 flex flex-col gap-4 overflow-hidden rounded-none bg-transparent bg-clip-border text-gray-700 shadow-none md:flex-row md:items-center">
                <div className="w-max rounded-lg bg-gray-900 p-5 text-white">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        aria-hidden="true"
                        className="h-6 w-6"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3"
                        ></path>
                    </svg>
                </div>
                <div className="flex-1">
                    <h6 className="block font-sans text-base font-semibold leading-relaxed tracking-normal text-blue-gray-900 antialiased">
                        Temperature Chart
                    </h6>
                    <p className="block max-w-sm font-sans text-sm font-normal leading-normal text-gray-700 antialiased">
                        Visualize temperature data over time using ApexCharts.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Time Range:</label>
                    <select
                        value={hoursToShow}
                        onChange={(e) => setHoursToShow(Number(e.target.value))}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value={1}>1 Hour</option>
                        <option value={6}>6 Hours</option>
                        <option value={24}>24 Hours</option>
                        <option value={48}>2 Days</option>
                        <option value={120}>5 Days</option>
                        <option value={168}>7 Days</option>
                    </select>
                </div>
            </div>
            <div className="pt-6 px-2 pb-0">
                <div ref={chartRef}></div>
            </div>
        </div>
    );
}