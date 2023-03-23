export const getErrorMessage = (maybeError: unknown) => {
  if (maybeError instanceof Error) {
    return maybeError.message;
  }
  if (typeof maybeError === 'object' && maybeError !== null) {
    if (
      'data' in maybeError &&
      typeof maybeError.data === 'object' &&
      maybeError.data !== null &&
      'message' in maybeError.data &&
      typeof maybeError.data.message === 'string'
    ) {
      return maybeError.data.message;
    }

    if ('message' in maybeError && typeof maybeError.message === 'string') {
      return maybeError.message;
    }
  }

  return 'unknown';
};
