// Static image imports (bundled by Metro; mapped in Jest via moduleNameMapper).
declare module '*.png' {
  import type { ImageSourcePropType } from 'react-native';

  const source: ImageSourcePropType;
  export default source;
}
