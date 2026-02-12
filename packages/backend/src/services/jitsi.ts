const JITSI_BASE_URL = 'https://meet.jit.si';

export function generateJitsiMeetLink(slotId: string, startTime: Date): string {
  const shortId = slotId.substring(0, 8);
  const dateStr = startTime.toISOString().split('T')[0]; // YYYY-MM-DD
  const roomName = `spanish-class-${shortId}-${dateStr}`;
  return `${JITSI_BASE_URL}/${roomName}`;
}
