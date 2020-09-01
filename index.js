// See chrome bug: https://bugs.chromium.org/p/chromium/issues/detail?id=987548

import { EventEmitter } from 'eventemitter3';
import window from 'global/window';
import document from 'global/document';

let CHANNEL_LOCAL_STORAGE_KEY = 'rtc_live_storage_broadcast_channel';
const ACTIVE_TRACK_EVENT = 'active_track';
const INACTIVE_TRACK_EVENT = 'inactive_track';

const emitter = new EventEmitter();

let hiddenProperty = '';
if ('hidden' in document) {
  hiddenProperty = 'hidden';
} else {
  hiddenProperty = 'webkitHidden';
}
const visibilityChange = hiddenProperty.replace(/hidden/i, 'visibilitychange');

const uaMatched = /(chrome)[ /]([\w.]+)/.exec(window.navigator.userAgent.toLowerCase()) || [];
const isChrome = uaMatched[1] || '';

function isSupport() {
  return isChrome && window.localStorage && (typeof StorageEvent !== 'undefined');
}

function emitActiveTrackEvent() {
  // delay run
  setTimeout(() => {
    emitter.emit(ACTIVE_TRACK_EVENT);
  }, 1000);
}

function emitInactiveTrackEvent() {
  emitter.emit(INACTIVE_TRACK_EVENT);
}

let channelPeersNumber = 0; // tab peers

function setNumberStorage(num) {
  if (typeof num !== 'number') return;

  try {
    window.localStorage.setItem(CHANNEL_LOCAL_STORAGE_KEY, JSON.stringify({
      num,
      ts: Date.now(),
    }));
  } catch (err) {
    console.log(err);
  }
}

function getNumberStorage() {
  let storageNum = 0;
  try {
    const storageData = JSON.parse(window.localStorage.getItem(CHANNEL_LOCAL_STORAGE_KEY));
    storageNum = Number(storageData.num);
  } catch (err) {
    // ignore
  }

  return storageNum;
}

function broadcastActive() {
  const storageNum = getNumberStorage();
  channelPeersNumber = storageNum + 1;
  setNumberStorage(channelPeersNumber);
}

function broadcastInactive() {
  if (channelPeersNumber < 1) return;
  channelPeersNumber -= 1;
  setNumberStorage(channelPeersNumber);
}

function handleStorageEvent(data) {
  let storageData = {};
  try {
    storageData = JSON.parse(data);
  } catch (err) {
    // ignore
  }
  const storageNumber = Number(storageData.num);
  if (typeof storageNumber === 'number') {
    channelPeersNumber = storageNumber;
  }

  if (channelPeersNumber === 1) {
    // enable self track
    emitActiveTrackEvent();
  }
}

if (isSupport()) {
  document.addEventListener(visibilityChange, () => {
    // important: has other tab
    if (channelPeersNumber > 1) {
      if (document[hiddenProperty]) {
        // disable self track
        emitInactiveTrackEvent();
      } else {
        // enable self track
        emitActiveTrackEvent();
      }
    }
  });

  window.addEventListener('storage', (evt) => {
    if (evt.key !== CHANNEL_LOCAL_STORAGE_KEY) return;
    if (!evt.newValue) return;
    handleStorageEvent(evt.newValue);
  });

  window.addEventListener('unload', () => {
    broadcastInactive();
  });

  // Notify other peers of new connections
  broadcastActive();
}

class Fix {
  constructor(mediaStream) {
    this._mediaStream = mediaStream;
    const audioTracks = mediaStream.getAudioTracks();
    this._audioTrack = audioTracks[0] || null;

    if (this._audioTrack) {
      this._handleActive = this._handleActive.bind(this);
      this._handleInactive = this._handleInactive.bind(this);
      emitter.on(ACTIVE_TRACK_EVENT, this._handleActive);
      emitter.on(INACTIVE_TRACK_EVENT, this._handleInactive);
    }
  }

  _handleActive() {
    const cpAudioTrack = this._audioTrack.clone();
    this._mediaStream.addTrack(cpAudioTrack);
    this._mediaStream.removeTrack(this._audioTrack);
    this._audioTrack = cpAudioTrack;
  }

  _handleInactive() { // eslint-disable-line
    // this._mediaStream.removeTrack(this._audioTrack);
  }

  destroy() {
    if (this._audioTrack) {
      emitter.off(ACTIVE_TRACK_EVENT, this._handleActive);
      emitter.off(INACTIVE_TRACK_EVENT, this._handleInactive);
    }

    this._mediaStream = null;
    this._audioTrack = null;
  }
}

export function createFix(mediaStream) {
  if (!mediaStream) {
    throw new Error('You must provide media stream object!');
  }
  return new Fix(mediaStream);
}

export function setChannelLocalStorageKey(key) {
  if (key) {
    CHANNEL_LOCAL_STORAGE_KEY = key;
  }
}
