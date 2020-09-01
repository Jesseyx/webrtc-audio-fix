declare class Fix {
  constructor(mediaStream: MediaStream);
  destroy();
}

declare namespace WebRTCAudioFix {
  export function createFix(mediaStream: MediaStream): Fix;
  export function setChannelLocalStorageKey(key: string);
}

export = WebRTCAudioFix;
export as namespace WebRTCAudioFix;
