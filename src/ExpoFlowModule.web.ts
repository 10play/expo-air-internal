import { registerWebModule, NativeModule } from 'expo';

import { ExpoFlowModuleEvents } from './ExpoFlow.types';

class ExpoFlowModule extends NativeModule<ExpoFlowModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(ExpoFlowModule, 'ExpoFlowModule');
