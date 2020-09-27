declare class Fix {
  constructor(mediaStream: MediaStream, videoElement: HTMLVideoElement);
  destroy();
}

declare namespace WebRTCAudioFix {
  export function createFix(mediaStream: MediaStream, videoElement: HTMLVideoElement): Fix;
  export function setChannelLocalStorageKey(key: string);
}

export = WebRTCAudioFix;
export as namespace WebRTCAudioFix;
