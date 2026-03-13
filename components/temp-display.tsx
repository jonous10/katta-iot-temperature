export default function TemperatureDisplay({ temperature }: { temperature: number }) {
  const temperatureThresholds = {
    cold: 15,
    hot: 25,
  };

  const getTemperatureColor = (temp: number) => {
    if (temp <= 0) return "from-blue-600 via-blue-500 to-cyan-400";
    if (temp <= 10) return "from-blue-500 via-cyan-400 to-teal-400";
    if (temp <= 20) return "from-teal-400 via-green-400 to-emerald-400";
    if (temp <= 25) return "from-green-400 via-yellow-400 to-amber-400";
    if (temp <= 30) return "from-yellow-400 via-orange-400 to-red-400";
    return "from-orange-500 via-red-500 to-red-600";
  };

  const getWarningIcon = (temp: number) => {
    if (temp <= temperatureThresholds.cold) return "❄️";
    if (temp >= temperatureThresholds.hot) return "🔥";
    return null;
  };

  const getWarningMessage = (temp: number) => {
    if (temp <= temperatureThresholds.cold) return "Too Cold!";
    if (temp >= temperatureThresholds.hot) return "Too Hot!";
    return null;
  };

  const showWarning =
    temperature <= temperatureThresholds.cold ||
    temperature >= temperatureThresholds.hot;

  const warningIcon = getWarningIcon(temperature);
  const warningMessage = getWarningMessage(temperature);
  const gradientColor = getTemperatureColor(temperature);

  return (
    <div className="relative flex items-center justify-center">
      <div className={`w-64 h-64 rounded-full bg-gradient-to-br ${gradientColor} shadow-2xl flex items-center justify-center transition-all duration-500 relative`}>

        {/* Shine container (ONLY this clips) */}
        <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/50 to-transparent animate-pulse"></div>

          <div
            className="absolute inset-0 bg-gradient-to-bl from-transparent via-white/40 to-transparent"
            style={{ animation: "shine 3s ease-in-out infinite" }}
          ></div>
        </div>

        <div className="w-56 h-56 rounded-full bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center relative z-10">

          {/* Emoji can overflow now */}
          <div className="absolute -top-2 -right-2 text-3xl animate-bounce">
            {showWarning ? warningIcon : "✅"}
          </div>

          <div className="text-6xl font-bold text-gray-800">
            {temperature}°C
          </div>

          <div className="text-xl text-gray-600 mt-2">
            Celsius
          </div>

          {showWarning && warningMessage && (
            <div className="text-sm text-red-600 mt-1 font-semibold">
              {warningMessage}
            </div>
          )}
        </div>
      </div>

      {/* Outer glow */}
      <div className="absolute inset-0 w-64 h-64 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-transparent animate-pulse overflow-hidden"></div>

      <style jsx>{`
        @keyframes shine {
          0% {
            transform: translateX(-100%) translateY(-100%) rotate(45deg);
          }
          50% {
            transform: translateX(100%) translateY(100%) rotate(45deg);
          }
          100% {
            transform: translateX(-100%) translateY(-100%) rotate(45deg);
          }
        }
      `}</style>
    </div>
  );
}