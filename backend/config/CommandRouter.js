export const routeCommand = (command, context = {}) => {
  // Stub router to prevent startup crashes when AI modules are not present.
  // Downstream implementations can replace this with real command routing.
  if (typeof command === "string" && command.length) {
    console.log(`[CommandRouter] ${command}`);
  } else {
    console.log("[CommandRouter] (no command)", context);
  }
  return { ok: true };
};

export default { routeCommand };
