export default function TemperatureDisplay({
  temperature,
  size = "large",
}: {
  temperature: number;
  size?: "small" | "large";
}) {
  const temperatureThresholds = {
    cold: 15,
    hot: 25,
  };

  const getTemperatureColor = (temp: number) => {
    if (temp <= 0) return "from-blue-600 via-blue-500 to-cyan-400";
    if (temp <= 10) return "from-blue-500 via-cyan-400 to-teal-400";
    if (temp <= 20) return "from-teal-400 via-green-400 to-emerald-400";
    if (temp <= 25) return "from-green-400 via-yellow-400 to-amber-400";
    return "from-orange-500 via-red-500 to-red-600";
  };

  const getWarningIcon = (temp: number) => {
    if (temp <= temperatureThresholds.cold) return "❄️";
    if (temp >= temperatureThresholds.hot) return "🔥";
    return "✅";
  };

  const getWarningMessage = (temp: number) => {
    if (temp <= temperatureThresholds.cold) return "Too Cold!";
    if (temp >= temperatureThresholds.hot) return "Too Hot!";
    return null;
  };

  const showWarning =
    temperature <= temperatureThresholds.cold ||
    temperature >= temperatureThresholds.hot;

  const roundedTemperature = Number(temperature.toFixed(1));
  const gradientColor = getTemperatureColor(temperature);

  const sizes = {
    small: {
      container: "w-16 h-16",
      inner: "w-14 h-14",
      text: "text-lg font-bold",
      emoji: "text-lg",
      emojiPosition: "-top-1 -right-1",
    },
    large: {
      container: "w-64 h-64",
      inner: "w-56 h-56",
      text: "text-6xl font-bold",
      emoji: "text-3xl",
      emojiPosition: "-top-2 -right-2",
    },
  };

  const currentSize = sizes[size];

  return (
    <div className="relative flex items-center justify-center">
      {/* Main container with gradient */}
      <div
        className={`${currentSize.container} rounded-full bg-linear-to-br ${gradientColor} shadow-xl flex items-center justify-center transition-all duration-500 relative border border-white/20`}
      >
        {/* Shine effect */}
        <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/30 to-transparent animate-pulse"></div>
          <div
            className="absolute inset-0 bg-linear-to-bl from-transparent via-white/20 to-transparent"
            style={{ animation: "shine 3s ease-in-out infinite" }}
          ></div>
        </div>

        {/* Inner white circle */}
        <div className={`${currentSize.inner} rounded-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm flex flex-col items-center justify-center relative z-10 border border-white/50 dark:border-gray-600/50 shadow-sm`}>

          {/* Status emoji */}
          <div className={`absolute ${currentSize.emojiPosition} ${currentSize.emoji} animate-bounce drop-shadow-sm`}>
            {getWarningIcon(temperature)}
          </div>

          {/* Temperature text */}
          <div className={`${currentSize.text} text-gray-800 dark:text-white tabular-nums leading-none`}>
            {roundedTemperature}°C
          </div>

          {/* Additional info for large version */}
          {size === "large" && (
            <>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">Celsius</div>
              {showWarning && getWarningMessage(temperature) && (
                <div className="text-xs text-red-600 dark:text-red-400 mt-2 font-semibold bg-red-50 dark:bg-red-900/30 px-3 py-1 rounded-lg border border-red-200 dark:border-red-800 text-center">
                  {getWarningMessage(temperature)}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Outer glow effect */}
      <div className={`absolute inset-0 ${currentSize.container} rounded-full bg-linear-to-tr from-transparent via-white/10 to-transparent animate-pulse overflow-hidden`}></div>

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
