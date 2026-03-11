"use client"

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import data from "./example-data/data.json";
import TemperatureDisplay from "./components/temp-display";
import TempHistoryDisplay from "./components/temp-history-display";

console.log(data);

export default function Home() {



  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 font-sans">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-center py-16 px-8">
        <TemperatureDisplay temperature={data[data.length - 1].temperature} />
        <div className="mt-8 w-full">
          <TempHistoryDisplay data={data} />
        </div>

      </main>
    </div>
  );
}
