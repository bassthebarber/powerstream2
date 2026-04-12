export const recoverFromCrash = () => {
  // Stub recovery hook to prevent startup crashes when the full
  // recovery subsystem isn't available in this backend build.
  return true;
};

export default { recoverFromCrash };
