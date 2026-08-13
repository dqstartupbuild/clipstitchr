import "server-only";

export function getStudioStitchProviderReadiness() {
  const providers = [
    {
      provider: "dansugc" as const,
      capability: "reactionFootage" as const,
      configured: Boolean(
        process.env.DANSUGC_API_KEY?.trim() &&
          process.env.STUDIO_STITCH_DANSUGC_DOWNLOAD_HOSTS?.trim(),
      ),
      envName:
        "DANSUGC_API_KEY and STUDIO_STITCH_DANSUGC_DOWNLOAD_HOSTS",
    },
    {
      provider: "gemini" as const,
      capability: "demoIntelligence" as const,
      configured: Boolean(process.env.GEMINI_API_KEY?.trim()),
      envName: "GEMINI_API_KEY",
    },
    {
      provider: "elevenlabs" as const,
      capability: "voiceWordTimings" as const,
      configured: Boolean(process.env.ELEVENLABS_API_KEY?.trim()),
      envName: "ELEVENLABS_API_KEY",
    },
    {
      provider: "render" as const,
      capability: "mediaRendering" as const,
      configured: Boolean(
        process.env.STUDIO_BETA_ENABLED === "true" &&
          process.env.STUDIO_STITCH_EXECUTION_ENABLED === "true" &&
          (process.env.STUDIO_STITCH_WORKER_SECRET?.trim().length ?? 0) >= 32 &&
          process.env.STUDIO_STITCH_WORKER_API_ORIGIN?.trim(),
      ),
      envName:
        "STUDIO_BETA_ENABLED, STUDIO_STITCH_EXECUTION_ENABLED, STUDIO_STITCH_WORKER_SECRET, and STUDIO_STITCH_WORKER_API_ORIGIN",
    },
  ];

  return providers.map(({ configured, envName, ...provider }) => ({
    ...provider,
    state: configured ? ("configured" as const) : ("unavailable" as const),
    reason: configured ? null : `${envName} is not configured.`,
  }));
}
