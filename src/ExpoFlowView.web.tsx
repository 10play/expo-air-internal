import * as React from 'react';

import { ExpoFlowViewProps } from './ExpoFlow.types';

export default function ExpoFlowView(props: ExpoFlowViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
