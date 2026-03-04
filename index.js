import { registerRootComponent } from 'expo';
import { registerWidgetTaskHandler } from 'react-native-android-widget';
import { widgetTaskHandler } from './widgetTaskHandler';

import App from './App';

import { AppRegistry } from 'react-native';

// Register the widget task hander explicitly for the native background headless task lookup
AppRegistry.registerHeadlessTask('RNWidgetBackgroundTask', () => widgetTaskHandler);
registerWidgetTaskHandler(widgetTaskHandler);

// Finally load expo App component
registerRootComponent(App);
