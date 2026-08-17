const origFetch = global.fetch;
global.fetch = async (url, opts) => {
  console.log("FETCHING:", url);
  throw new Error("intercepted");
}
import { encode } from '@jsquash/jpeg';
import UPNG from 'upng-js';
const data = new Uint8ClampedArray(4 * 4 * 4);
encode({ data, width: 4, height: 4, colorSpace: 'srgb' }).catch(console.error);
