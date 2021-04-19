import React, { Component } from "react";
import { View, FlatList, StyleSheet, DeviceEventEmitter } from "react-native";
import { connect as connectRedux } from "react-redux";

import ListItem from "./ListItem";
import { retrieveAssociatedBeacons } from "../redux/actions/beaconsActions";
import { setScannerStateToScanning } from '../redux/actions/scannerActions'
import Kontakt from "react-native-kontaktio";

const {
  connect,
  configure,
  disconnect,
  startScanning,
  stopScanning,
  restartScanning,
  // setBeaconRegion,
  setBeaconRegions,
  IBEACON,
  // Configurations
  scanMode,
  scanPeriod,
  activityCheckConfiguration,
  forceScanConfiguration,
  monitoringEnabled,
  monitoringSyncInterval,
} = Kontakt;

class BeaconScanner extends Component {
  state = {
    scanning: false,
    beacons: [],
    eddystones: [],
    statusText: null,
  };

  _calculateAccuracy = (txPower, rssi) => {
    if (rssi == 0) return -1;
    var ratio = rssi * (1.0 / txPower);
    if (ratio < 1.0) {
      return Math.pow(ratio, 10);
    } else {
      return 0.89976 * Math.pow(ratio, 7.7095) + 0.111;
    }
  };

  async initBeaconsScanner() {
    await this.props.retrieveAssociatedBeacons();
    connect("APIKEYWEDONTHAVE", [IBEACON])
      .then(() =>
        configure({
          scanMode: scanMode.BALANCED,
          scanPeriod: scanPeriod.RANGING,
          activityCheckConfiguration: activityCheckConfiguration.DEFAULT,
          forceScanConfiguration: forceScanConfiguration.MINIMAL,
          monitoringEnabled: monitoringEnabled.TRUE,
          monitoringSyncInterval: monitoringSyncInterval.DEFAULT,
        })
      )
      .then(() =>
        setBeaconRegions(
          this.props.beacons.map((beacon) => {
            if (beacon.track) {
              return beacon.region;
            }
          })
        )
      )
      .then(() => this._startScanning())
      .catch((error) => console.log("error", error));

    // Beacon listeners
    DeviceEventEmitter.addListener(
      "beaconDidAppear",
      ({ beacon: newBeacon }) => {
        //console.log("beaconDidAppear", newBeacon);
        this.props.beacons.forEach((beacon) => {
          if (beacon.address === newBeacon.address) {
            beacon.currentdistance = (
              Math.round(
                (this._calculateAccuracy(newBeacon.txPower, newBeacon.rssi) +
                  Number.EPSILON) *
                  100
              ) / 100
            ).toFixed(2);
            if (beacon.currentdistance >= beacon.maxdistance) {
              beacon.exceeded = true;
            } else {
              beacon.exceeded = false;
            }
          }
        });
        this.setState({
          beacons: this.state.beacons.concat(newBeacon),
        });
      }
    );
    DeviceEventEmitter.addListener(
      "beaconDidDisappear",
      ({ beacon: lostBeacon, region }) => {
        //console.log("beaconDidDisappear", lostBeacon, region);
        const { beacons } = this.state;
        const index = beacons.findIndex((beacon) =>
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
          }, []),
        });
      }
    );
    DeviceEventEmitter.addListener(
      "beaconsDidUpdate",
      ({ beacons: updatedBeacons, region }) => {
        //console.log("beaconsDidUpdate", region);
        this.props.beacons.forEach((beacon) => {
          if (beacon.address === updatedBeacons[0].address) {
            beacon.currentdistance = (
              Math.round(
                (this._calculateAccuracy(
                  updatedBeacons[0].txPower,
                  updatedBeacons[0].rssi
                ) +
                  Number.EPSILON) *
                  100
              ) / 100
            ).toFixed(2);
            if (beacon.currentdistance >= beacon.maxdistance) {
              beacon.exceeded = true;
            } else {
              beacon.exceeded = false;
            }
          }
        });
        const { beacons } = this.state;
        updatedBeacons.forEach((updatedBeacon) => {
          const index = beacons.findIndex((beacon) =>
            this._isIdenticalBeacon(updatedBeacon, beacon)
          );
          this.setState({
            beacons: beacons.reduce((result, val, ind) => {
              // replace current beacon values for updatedBeacon, keep current value for others
              ind === index ? result.push(updatedBeacon) : result.push(val);
              return result;
            }, []),
          });
        });
      }
    );

    // Region listeners
    DeviceEventEmitter.addListener("regionDidEnter", ({ region }) => {
      //console.log("regionDidEnter", region);
    });
    DeviceEventEmitter.addListener("regionDidExit", ({ region }) => {
      //console.log("regionDidExit", region);
    });
  }

  async componentDidMount() {
    this.props.retrieveAssociatedBeacons();
  }

  componentWillUnmount() {
    disconnect();
    DeviceEventEmitter.removeAllListeners();
  }

  componentDidUpdate() {
    if (this.props.beacons != null && this.props.isScanning === false){
      this.initBeaconsScanner();
      this.props.setScannerStateToScanning();
    }
  }

  _startScanning = () => {
    startScanning()
      .then(() => this.setState({ scanning: true, statusText: null }))
      .catch((error) => console.log("[startScanning]", error));
  };
  _stopScanning = () => {
    stopScanning()
      .then(() =>
        this.setState({ scanning: false, beacons: [], statusText: null })
      )
      .catch((error) => console.log("[stopScanning]", error));
  };
  _restartScanning = () => {
    restartScanning()
      .then(() =>
        this.setState({ scanning: true, beacons: [], statusText: null })
      )
      .catch((error) => console.log("[restartScanning]", error));
  };

  _isIdenticalBeacon = (b1, b2) =>
    b1.identifier === b2.identifier &&
    b1.uuid === b2.uuid &&
    b1.major === b2.major &&
    b1.minor === b2.minor;

  renderItem = ({ item }) => {
    return <ListItem item={item} />;
  };

  render() {
    return (
      <View style={styles.listContainer}>
        <FlatList
          data={this.props.beacons}
          renderItem={this.renderItem}
          keyExtractor={(item) => item.address}
          style={styles.items}
          extraData={this.props.beacons}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  listContainer: {
    display: "flex",
    height: "100%",
    backgroundColor: "#fff",
    zIndex: 1,
    borderTopRightRadius: 25,
    borderTopLeftRadius: 25,
  },
  items: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginVertical: 8,
    marginHorizontal: 16,
  },
});

const mapStateToProps = (state) => ({
  beacons: state.beacons.associated,
  isScanning: state.scanner.isScanning
});

export default connectRedux(mapStateToProps, { retrieveAssociatedBeacons, setScannerStateToScanning })(BeaconScanner);
