declare class Fix {
  constructor(mediaStream: MediaStream);
  destroy();
}

declare var WebRTCAudioFix: {
  createFix(mediaStream: MediaStream): Fix,
  setChannelLocalStorageKey(key: string),
};

export default WebRTCAudioFix;
