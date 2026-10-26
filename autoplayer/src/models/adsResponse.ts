import type { Ad } from './ad.js';

export type AdsResponse = Ad[] | { adventures?: Ad[]; ads?: Ad[]; messages?: Ad[] };
