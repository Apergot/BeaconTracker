import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  DeviceEventEmitter,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import { Card } from 'react-native-elements'

import Kontakt from 'react-native-kontaktio';

const {
  connect,
  configure,
  disconnect,
  isConnected,
  startScanning,
  stopScanning,
  restartScanning,
  isScanning,
  getBeaconRegions,
  setEddystoneNamespace,
  IBEACON,
  EDDYSTONE,
  scanMode,
  scanPeriod,
  activityCheckConfiguration,
  forceScanConfiguration,
  monitoringEnabled,
  monitoringSyncInterval,
} = Kontakt;

export default class AvailableBeaconsScreen extends Component {
  state = {
    scanning: false,
    beacons: [],
    eddystones: [],
    statusText: null,
  };

  

  async componentDidMount() {
    // Initialization, configuration and adding of beacon regions
    connect(
      'MY_KONTAKTIO_API_KEY',
      [IBEACON, EDDYSTONE],
    )
      .then(() => configure({
        scanMode: scanMode.LOW_LATENCY,
        scanPeriod: scanPeriod.create({
          activePeriod: 6000,
          passivePeriod: 20000,
        }),
        activityCheckConfiguration: activityCheckConfiguration.DEFAULT,
        forceScanConfiguration: forceScanConfiguration.MINIMAL,
        monitoringEnabled: monitoringEnabled.TRUE,
        monitoringSyncInterval: monitoringSyncInterval.DEFAULT,
      }))
      .then(() => setEddystoneNamespace())
      .then(this._startScanning())
      .catch(error => console.log('error', error));

    // Beacon listeners
    DeviceEventEmitter.addListener(
      'beaconDidAppear',
      ({ beacon: newBeacon, region }) => {
        console.log('beaconDidAppear', newBeacon, region);

        this.setState({
          beacons: this.state.beacons.concat(newBeacon)
        });
      }
    );
    DeviceEventEmitter.addListener(
      'beaconDidDisappear',
      ({ beacon: lostBeacon, region }) => {
        console.log('beaconDidDisappear', lostBeacon, region);

        const { beacons } = this.state;
        const index = beacons.findIndex(beacon =>
          this._isIdenticalBeacon(lostBeacon, beacon)
        );
        this.setState({
          beacons: beacons.reduce((result, val, ind) => {
            // don't add disappeared beacon to array
            if (ind === index) return result;
            // add all other beacons to array
            else {
              result.push(val);
              return result;
            }
          }, [])
        });
      }
    );
    DeviceEventEmitter.addListener(
      'beaconsDidUpdate',
      ({ beacons: updatedBeacons, region }) => {
        console.log('beaconsDidUpdate', updatedBeacons, region);

        const { beacons } = this.state;
        updatedBeacons.forEach(updatedBeacon => {
          const index = beacons.findIndex(beacon =>
            this._isIdenticalBeacon(updatedBeacon, beacon)
          );
          this.setState({
            beacons: beacons.reduce((result, val, ind) => {
              // replace current beacon values for updatedBeacon, keep current value for others
              ind === index ? result.push(updatedBeacon) : result.push(val);
              return result;
            }, [])
          })
        });
      }
    );

    // Region listeners
    DeviceEventEmitter.addListener(
      'regionDidEnter',
      ({ region }) => {
        console.log('regionDidEnter', region);
      }
    );
    DeviceEventEmitter.addListener(
      'regionDidExit',
      ({ region }) => {
        console.log('regionDidExit', region);
      }
    );

    // Beacon monitoring listener
    DeviceEventEmitter.addListener(
      'monitoringCycle',
      ({ status }) => {
        console.log('monitoringCycle', status);
      }
    );

  }

  componentWillUnmount() {
    // Disconnect beaconManager and set to it to null
    disconnect();
    DeviceEventEmitter.removeAllListeners();
  }

  _startScanning = () => {
    startScanning()
      .then(() => this.setState({ scanning: true, statusText: null }))
      .then(() => console.log('started scanning'))
      .catch(error => console.log('[startScanning]', error));
  };
  _stopScanning = () => {
    stopScanning()
      .then(() => this.setState({ scanning: false, beacons: [], statusText: null }))
      .then(() => console.log('stopped scanning'))
      .catch(error => console.log('[stopScanning]', error));
  };
  _restartScanning = () => {
    restartScanning()
      .then(() => this.setState({ scanning: true, beacons: [], statusText: null }))
      .then(() => console.log('restarted scanning'))
      .catch(error => console.log('[restartScanning]', error));
  };
  _isScanning = () => {
    isScanning()
      .then(result => {
        this.setState({ statusText: `Device is currently ${result ? '' : 'NOT '}scanning.` });
        console.log('Is device scanning?', result);
      })
      .catch(error => console.log('[isScanning]', error));
  };
  _isConnected = () => {
    isConnected()
      .then(result => {
        this.setState({ statusText: `Device is ${result ? '' : 'NOT '}ready to scan beacons.` });
        console.log('Is device connected?', result);
      })
      .catch(error => console.log('[isConnected]', error));
  };
  _getBeaconRegions = () => {
    getBeaconRegions()
      .then(regions => console.log('regions', regions))
      .catch(error => console.log('[getBeaconRegions]', error));
  };

  /**
   * Helper function used to identify equal beacons
   */
  _isIdenticalBeacon = (b1, b2) => (
    (b1.identifier === b2.identifier) &&
    (b1.uuid === b2.uuid) &&
    (b1.major === b2.major) &&
    (b1.minor === b2.minor)
  );

  _renderBeacons = () => {
    const colors = ['#F7C376', '#EFF7B7', '#F4CDED', '#A2C8F9', '#AAF7AF'];

    return this.state.beacons.sort((a, b) => a.accuracy - b.accuracy).map((beacon, ind) => (
      <TouchableOpacity  key={ind} onPress={() => {
          //this._stopScanning()
          this.props.navigation.navigate('RegisterBeacon', {beacon: beacon});
        }}>
        <Card>
        <Card.Title>{beacon.uuid}</Card.Title>
        <Card.Divider/>
        <View>
          <Text>Proximity: {beacon.proximity}</Text>
          <Text>Address: {beacon.address} </Text>
          <Text></Text>
        </View>
      </Card>
      </TouchableOpacity>
    ), this);
  };

  _renderEmpty = () => {
    const { scanning, beacons } = this.state;
    let text;
    if (!scanning) text = "Start scanning to listen for beacon signals!";
    if (scanning && !beacons.length) text = "No beacons detected yet...";
    return (
      <View style={styles.textContainer}>
        <Text style={styles.text}>{text}</Text>
      </View>
    );
  };

  _renderStatusText = () => {
    const { statusText } = this.state;
    return statusText ? (
      <View style={styles.textContainer}>
        <Text style={[styles.text, { color: 'red' }]}>{statusText}</Text>
      </View>
    ) : null;
  };

  _renderButton = (text, onPress, backgroundColor) => (
    <TouchableOpacity style={[styles.button, { backgroundColor }]} onPress={onPress}>
      <Text>{text}</Text>
    </TouchableOpacity>
  );

  render() {
    const { scanning, beacons } = this.state;

    return (
      <View style={styles.container}>
        {this._renderStatusText()}
        <ScrollView>
          {scanning && beacons.length ? this._renderBeacons() : this._renderEmpty()}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  beacon: {
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 10,
  },
  textContainer: {
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  button: {
    padding: 10,
    borderRadius: 10,
  },
});