type ScheduleLoopingAudioBufferOptions = {
  buffer: AudioBuffer;
  context: BaseAudioContext;
  destination: AudioNode;
  duration: number;
};

export function scheduleLoopingAudioBuffer({
  buffer,
  context,
  destination,
  duration,
}: ScheduleLoopingAudioBufferOptions) {
  if (duration <= 0 || buffer.duration <= 0) {
    return;
  }

  let startTime = 0;

  while (startTime < duration) {
    const source = context.createBufferSource();
    const segmentDuration = Math.min(buffer.duration, duration - startTime);

    source.buffer = buffer;
    source.connect(destination);
    source.start(startTime, 0, segmentDuration);

    startTime += segmentDuration;
  }
}
