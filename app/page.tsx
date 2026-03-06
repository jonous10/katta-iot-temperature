import Image from "next/image";
import data from "./example-data/data.json";

console.log(data);

function TemperatureDisplay({ temperature }: { temperature: number }) {
  return (
    <div className="relative flex items-center justify-center">
      <div className="w-64 h-64 rounded-full bg-gradient-to-br from-blue-400 via-cyan-400 to-teal-400 shadow-2xl flex items-center justify-center">
        <div className="w-56 h-56 rounded-full bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="text-6xl font-bold text-gray-800">
            {temperature}°
          </div>
          <div className="text-xl text-gray-600 mt-2">
            Celsius
          </div>
        </div>
      </div>
      <div className="absolute inset-0 w-64 h-64 rounded-full bg-gradient-to-tr from-transparent via-white/20 to-transparent animate-pulse"></div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 font-sans">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32 px-16">
        <TemperatureDisplay temperature={data.temperatur} />
      </main>
    </div>
  );
}
