/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  NativeAppEventEmitter,
  Text,
  View
} from 'react-native';
import BleManager from 'react-native-ble-manager';
import PushNotification from "react-native-push-notification";

const serviceUUID = "1814";
const charUUID = "2A53";

PushNotification.localNotification({
  message: "parsing file"
});

export default class BleStateRestoration extends Component {

  componentDidMount() {
    PushNotification.configure({
      requestPermission: true
    });

    PushNotification.localNotification({
      message: "componentDidMount"
    });

    BleManager.start({
      restoreIdentifierKey: "BleStateRestorationKey"
    });

    NativeAppEventEmitter.addListener(
      "BleManagerDiscoverPeripheral",
      this.handleDiscoverPeripheral
    );

    NativeAppEventEmitter.addListener(
      "BleManagerDidUpdateState",
      this.handleDidUpdateState
    );

    NativeAppEventEmitter.addListener(
      "BleManagerDidUpdateValueForCharacteristic",
      this.handleDidUpdateValueForCharacteristic
    );

    BleManager.checkState();
  }

  handleDiscoverPeripheral(p) {
    console.log('handleDiscoverPeripheral: ', p);

    BleManager.connect(p.id)
      .then((pInfo) => {
        console.log("connected: ", pInfo);

        return BleManager.startNotification(p.id, serviceUUID, charUUID);
      })
      .then(() => {
        console.log("notification started");
      })
      .catch((err) => {
        console.err("connect error:", err);
      });
  }

  handleDidUpdateState({state}) {
    console.log("handleDidUpdateState: ", state);

    if (state === "on") {
      BleManager.scan([serviceUUID], 30, false);
    }
  }

  handleDidUpdateValueForCharacteristic(value) {
    console.log("handleDidUpdateValueForCharacteristic: ", value);

    PushNotification.localNotification({
      message: `Value: ${value.value}`
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to React Native!
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
});

AppRegistry.registerComponent('BleStateRestoration', () => BleStateRestoration);
