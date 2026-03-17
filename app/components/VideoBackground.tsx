"use client";

export default function VideoBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover -z-10"
      >
        <source src="/videos/bgvid_color.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay for better contrast */}
      <div className="absolute inset-0 bg-black/10 -z-10" />

      {/* Content */}
      <div className="relative z-20">
        {children}
      </div>
    </div>
  );
}
