export const DCC_PROTOCOL = 'dcc://';
const BASE_PROTOCOL = 'base://';

export const baseImageReference = (base: string | undefined) => {
  if (!base) {
    throw new Error('base is not defined');
  }
  if (base.startsWith(BASE_PROTOCOL)) {
    return `ghcr.io/dhhyi/dcc-base-${base.substring(BASE_PROTOCOL.length)}`;
  } else if (base.startsWith(DCC_PROTOCOL)) {
    return `ghcr.io/dhhyi/dcc-devcontainer-${base.substring(
      DCC_PROTOCOL.length
    )}`;
  } else {
    throw new Error(`base ${base} is not supported`);
  }
};
