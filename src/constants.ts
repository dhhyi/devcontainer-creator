export const DCC_PROTOCOL = 'dcc://';
const BASE_PROTOCOL = 'base://';
const BASE_IMAGE_PREFIX = 'ghcr.io/dhhyi/dcc-base';

export const isBaseImage = (base: string): boolean => {
  return base?.startsWith(BASE_IMAGE_PREFIX);
};

export const resolveImageReference = (image: string): string => {
  if (image.startsWith(BASE_PROTOCOL) || image.startsWith(DCC_PROTOCOL)) {
    return baseImageReference(image);
  } else {
    return image;
  }
};

export const baseImageReference = (base: string | undefined) => {
  if (!base) {
    throw new Error('base is not defined');
  }
  if (base.startsWith(BASE_PROTOCOL)) {
    return `${BASE_IMAGE_PREFIX}-${base.substring(BASE_PROTOCOL.length)}`;
  } else if (base.startsWith(DCC_PROTOCOL)) {
    return `ghcr.io/dhhyi/dcc-devcontainer-${base.substring(
      DCC_PROTOCOL.length
    )}`;
  } else {
    throw new Error(`base ${base} is not supported`);
  }
};
