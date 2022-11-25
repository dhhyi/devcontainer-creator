export const DCC_REFERENCE =
  'https://raw.githubusercontent.com/dhhyi/devcontainer-creator/main/examples/';

export const DCC_PROTOCOL = 'dcc://';

export const simpleImageReference = (lang: string | undefined) => {
  if (!lang) {
    throw new Error('lang is required');
  }
  return `ghcr.io/dhhyi/dcc-devcontainer-${lang}`;
};

export const baseImageReference = (base: string | undefined) => {
  if (!base) {
    throw new Error('base is not defined');
  }
  return `ghcr.io/dhhyi/dcc-base-${base}`;
};
