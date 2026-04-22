import { join } from 'path';
import { pathToFileURL } from 'url';
import { fontsDir } from './common.mjs';

function fontUrl(fileName) {
  return pathToFileURL(join(fontsDir, fileName)).href;
}

export function buildStructuredFontCss() {
  return `
  @font-face {
    font-family: 'Space Grotesk';
    src: url('${fontUrl('space-grotesk-latin.woff2')}') format('woff2');
    font-weight: 300 700;
    font-style: normal;
    font-display: swap;
  }
  @font-face {
    font-family: 'Space Grotesk';
    src: url('${fontUrl('space-grotesk-latin-ext.woff2')}') format('woff2');
    font-weight: 300 700;
    font-style: normal;
    font-display: swap;
  }
  @font-face {
    font-family: 'DM Sans';
    src: url('${fontUrl('dm-sans-latin.woff2')}') format('woff2');
    font-weight: 100 1000;
    font-style: normal;
    font-display: swap;
  }
  @font-face {
    font-family: 'DM Sans';
    src: url('${fontUrl('dm-sans-latin-ext.woff2')}') format('woff2');
    font-weight: 100 1000;
    font-style: normal;
    font-display: swap;
  }`;
}
