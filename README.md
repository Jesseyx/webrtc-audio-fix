# WebRTCAudioFix

A small script for fix WebRTC audio track bug in Chrome.

Bug detail see: [https://bugs.chromium.org/p/chromium/issues/detail?id=987548](https://bugs.chromium.org/p/chromium/issues/detail?id=987548)

# How to use

```
# import package
import { createFix } from 'webrtc-audio-fix';

# Give your MediaStream
const fix = createFix(mediaStream);

# Delete when not needed
fix.destroy();
```

This script use `StorageEvent` for multiple tabs communication, you can set the local storage key to be stored by yourself, but it must be unique! Default is `rtc_live_storage_broadcast_channel`
```
import { setChannelLocalStorageKey } from 'webrtc-audio-fix';

# Set
setChannelLocalStorageKey(key);
```
