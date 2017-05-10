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

const log = (msg) => {
  console.log(msg);

  PushNotification.localNotification({
    message: msg
  });
};

const connect = (p) => {
  BleManager.connect(p.id)
    .then((pInfo) => {
      log(`connected: ${JSON.stringify(pInfo)}`);

      return BleManager.startNotification(p.id, serviceUUID, charUUID);
    })
    .then(() => {
      log("startNotification");
    })
    .catch((err) => {
      log(`startNotification error: ${JSON.stringify(err)}`);
    });
}

log("Parsing file");

export default class BleStateRestoration extends Component {

  componentDidMount() {
    log("componentDidMount");

    PushNotification.configure({
      requestPermission: true
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

    BleManager.getConnectedPeripherals([serviceUUID])
      .then((peripherals) => {
        peripherals.forEach((p) => {
          connect(p);
        });
      })
      .catch((err) => {
        log(`getConnectedPeripherals error: ${JSON.stringify(err)}`);
      })
  }

  handleDiscoverPeripheral(p) {
    log(`handleDiscoverPeripheral: ${JSON.stringify(p)}`);

    connect(p);
  }

  handleDidUpdateState({state}) {
    log(`handleDidUpdateState: ${state}`);

    if (state === "on") {
      log("Scanning");

      BleManager.scan([serviceUUID], 30, false);
    }
  }

  handleDidUpdateValueForCharacteristic(value) {
    log(`handleDidUpdateValueForCharacteristic: ${JSON.stringify(value)}`);
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
