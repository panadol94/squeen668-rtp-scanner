const serverUrl = process.env.CAPACITOR_SERVER_URL || 'https://slotpatcher.com';

module.exports = {
  appId: 'com.squeen668.rtpscanner',
  appName: 'SQUEEN668 RTP Scanner',
  webDir: 'www',
  server: {
    url: serverUrl,
    cleartext: false,
    androidScheme: 'https'
  }
};
