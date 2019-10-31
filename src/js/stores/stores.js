import { readable, writable} from 'svelte/store';
import { coin, pubkey, token } from './defaults.js';

export { HashStore } from './hashStore.js';
export { MarketInfoStore, fiatWalletTotal } from './marketInfoStore.js';
export { CoinStore, numberOfCoins, symbolList } from './coinStore.js';
export { SwapStore, initialSwaps, participateSwaps, swapCount  } from './swapStore.js';
export { SettingsStore, firstRun, themeStyle, currentPage, loggedIn, currencies, currencyCode, calcRemainingStorage  } from './settingsStore.js';

//MISC Stores
export const CURRENT_KS_VERSION = writable("1.0");
export const defaultOjects = readable({coin, pubkey, token});



