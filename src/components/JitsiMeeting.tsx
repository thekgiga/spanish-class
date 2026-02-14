import { useEffect, useRef } from 'react';
import { JitsiMeeting as JitsiMeetingSDK } from '@jitsi/react-sdk';

interface JitsiMeetingProps {
  roomName: string;
  displayName: string;
  onReadyToClose?: () => void;
  configOverwrite?: Record<string, any>;
  interfaceConfigOverwrite?: Record<string, any>;
}

export function JitsiMeeting({
  roomName,
  displayName,
  onReadyToClose,
  configOverwrite = {},
  interfaceConfigOverwrite = {},
}: JitsiMeetingProps) {
  const domain = import.meta.env.VITE_JITSI_DOMAIN || 'meet.jit.si';

  const defaultConfig = {
    startWithAudioMuted: false,
    startWithVideoMuted: false,
    enableWelcomePage: false,
    prejoinPageEnabled: false,
    disableInviteFunctions: true,
    ...configOverwrite,
  };

  const defaultInterfaceConfig = {
    TOOLBAR_BUTTONS: [
      'microphone',
      'camera',
      'closedcaptions',
      'desktop',
      'fullscreen',
      'fodeviceselection',
      'hangup',
      'chat',
      'raisehand',
      'videoquality',
      'filmstrip',
      'stats',
      'shortcuts',
      'tileview',
      'videobackgroundblur',
      'help',
    ],
    SHOW_JITSI_WATERMARK: false,
    SHOW_WATERMARK_FOR_GUESTS: false,
    ...interfaceConfigOverwrite,
  };

  return (
    <div className="w-full h-full">
      <JitsiMeetingSDK
        domain={domain}
        roomName={roomName}
        configOverwrite={defaultConfig}
        interfaceConfigOverwrite={defaultInterfaceConfig}
        userInfo={{
          displayName,
        }}
        onReadyToClose={onReadyToClose}
        getIFrameRef={(iframeRef) => {
          iframeRef.style.height = '100%';
          iframeRef.style.width = '100%';
        }}
      />
    </div>
  );
}
