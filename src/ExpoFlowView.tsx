import { requireNativeView } from 'expo';
import * as React from 'react';

import { ExpoFlowViewProps } from './ExpoFlow.types';

const NativeView: React.ComponentType<ExpoFlowViewProps> =
  requireNativeView('ExpoFlow');

export default function ExpoFlowView(props: ExpoFlowViewProps) {
  return <NativeView {...props} />;
}
