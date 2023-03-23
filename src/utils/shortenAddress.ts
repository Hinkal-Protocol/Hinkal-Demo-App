export const shortenAddress = (shieldedAddress: string) =>
  shieldedAddress
    .substring(0, 5)
    .concat('...')
    .concat(shieldedAddress.substring(shieldedAddress.length - 4));
