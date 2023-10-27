const ua = new UAParser();
const isMac = ua.getOS().name === 'Mac OS';

export { isMac };
