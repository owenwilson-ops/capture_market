// Expo inlines literal `process.env.EXPO_PUBLIC_*` references at build time.
// Declare the global so TypeScript accepts the bare `process` reference without
// pulling in full @types/node.
declare const process: {
  env: Record<string, string | undefined>;
};
