import { registerPlugin, Capacitor } from '@capacitor/core';

const NativeSpatial = registerPlugin('SpatialAudio');
const isNative = () => Boolean(Capacitor?.isNativePlatform?.() && Capacitor.getPlatform?.() === 'android');

export const SpatialBridge = {
  isNative,
  async getState() {
    if (!isNative()) return null;
    return NativeSpatial.getState();
  },
  async setSettings(settings) {
    if (!isNative()) return {webPreview:true};
    return NativeSpatial.setSettings({settings});
  },
  async applyPreset(id) {
    if (!isNative()) return {webPreview:true};
    return NativeSpatial.applyPreset({id});
  },
  async setFloatingBubble(enabled) {
    if (!isNative()) return {webPreview:true};
    return NativeSpatial.setFloatingBubble({enabled});
  },
  async setFloatingLyrics(enabled) {
    if (!isNative()) return {webPreview:true};
    return NativeSpatial.setFloatingLyrics({enabled});
  },
  async chooseImpulseResponse() {
    if (!isNative()) return {webPreview:true};
    return NativeSpatial.chooseImpulseResponse();
  },
  async setNowPlaying(title, lyrics = null) {
    if (!isNative()) return {webPreview:true};
    return NativeSpatial.setNowPlaying({title, lyrics});
  },
  async requestPlaybackToggle() {
    if (!isNative()) return {webPreview:true};
    return NativeSpatial.requestPlaybackToggle();
  },
  async requestPlaybackPause() {
    if (!isNative()) return {webPreview:true};
    return NativeSpatial.requestPlaybackPause();
  },
  async setGlobalEq(enabled) {
    if (!isNative()) return {webPreview:true};
    return NativeSpatial.setGlobalEq({enabled});
  },
  async startCapture() {
    if (!isNative()) return {webPreview:true};
    return NativeSpatial.requestUniversalCapture();
  },
  async stopCapture() {
    if (!isNative()) return {webPreview:true};
    return NativeSpatial.stopUniversalCapture();
  },
  async savePreset(name, settings) {
    if (!isNative()) return {webPreview:true};
    return NativeSpatial.savePreset({name,settings});
  },
  async deletePreset(id) {
    if (!isNative()) return {webPreview:true};
    return NativeSpatial.deletePreset({id});
  },
  async exportPreset(name, settings) {
    if (!isNative()) return {webPreview:true};
    return NativeSpatial.exportPreset({name,settings});
  },
  async importPreset(json) {
    if (!isNative()) return {webPreview:true};
    return NativeSpatial.importPreset({json});
  },
  async addFrameListener(callback) {
    if (!isNative()) return null;
    return NativeSpatial.addListener('frame', callback);
  },
  async addStatusListener(callback) {
    if (!isNative()) return null;
    return NativeSpatial.addListener('status', callback);
  }
};
