"use client"

import Image from "next/image";
import data from "./example-data/data.json";
import TemperatureDisplay from "./components/temp-display";

console.log(data);
export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 font-sans">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32 px-16">
        <TemperatureDisplay temperature={data.temperatur} />
      </main>
    </div>
  );
}
