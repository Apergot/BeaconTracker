import React, { Component } from "react";
import { View, FlatList, StyleSheet, NativeEventEmitter, Text } from "react-native";
import { connect as connectRedux } from "react-redux";

import ListItem from "./ListItem";
import Loader from '../custom-components/Loader'
import { retrieveAssociatedBeacons } from "../redux/actions/beaconsActions";
import { setScannerStateToScanning, setScannerStateToNotScanning } from "../redux/actions/scannerActions";
import { getRegionToSearchForIos, setRegionToSearchForIos } from "../redux/actions/regionActions";
import Kontakt, { KontaktModule } from "react-native-kontaktio";

const {
  init,
  configure,
  requestAlwaysAuthorization,
  // ranging
  startRangingBeaconsInRegion,
  stopRangingBeaconsInRegion,
  stopRangingBeaconsInAllRegions
} = Kontakt;

const kontaktEmitter = new NativeEventEmitter(KontaktModule);

class BeaconScanner extends Component {
  state = {
    scanning: false,
    ranging: false,
    monitoring: false,
    discoveredBeacons: [],
    rangedBeacons: [],
    rangedRegions: [],
    monitoredRegions: [],
    monitoredRegionsCloseBy: [],
    authorizationStatus: "",
    region1: {
      identifier: 'All beacons from certain region',
      uuid: this.props.region.uuid,
      major: this.props.region.major
    }
  };

  regionRangeSubscription = null;
  regionRangeFailSubscription = null;

  region1 = {
    identifier: 'All beacons',
    uuid: this.props.region.uuid,
    major: this.props.region.major
    // no minor provided: will detect all minors
  };

  _requestAlwaysAuthorization = () => {
    requestAlwaysAuthorization()
      .then(() => console.log('requested always authorization'))
      .catch(error => console.log('[requestAlwaysAuthorization]', error));
  };

  async initBeaconsScanner () {
    await this.props.retrieveAssociatedBeacons();

    init('APIKEYWEDONTHAVE')
    .then(() => configure({
      dropEmptyRanges: true,    // don't trigger beacon events in case beacon array is empty
      invalidationAge: 5000,   // time to forget lost beacon
      // connectNearbyBeacons: false,   // true not working yet
    }))
    .then(() => this._requestAlwaysAuthorization())
    .then(() => this._startRanging())
    .catch(error => console.log('error', error));
    
    // Ranging event
    this.regionRangeSubscription = kontaktEmitter.addListener(
        'didRangeBeacons',
        ({ beacons: rangedBeacons, region }) => {
        this.props.beacons.forEach((beacon) => {
          rangedBeacons.some(rangedBeacon => {
            if (rangedBeacon.minor === beacon.address) {
              if (rangedBeacon.accuracy >= 0) {
                beacon.currentdistance = Math.round((rangedBeacon.accuracy + Number.EPSILON) * 100) / 100;
                if (beacon.currentdistance >= beacon.maxdistance) {
                    beacon.exceeded = true;
                } else {
                  beacon.exceeded = false;
                }
              }
            }
          });
        });
        this.setState({ rangedBeacons });
        }
    );
  }

  async componentDidMount () {
      this.props.retrieveAssociatedBeacons();
      //await this.props.setRegionToSearchForIos(this.props.region);
  }

  componentDidUpdate() {
    if (this.props.beacons != null && this.props.isScanning === false){
      this.setState({region1: {identifier: 'All beacons from certain region', uuid: this.props.region.uuid, major: this.props.region.major}});
      this.region1.uuid = this.props.region.uuid;
      this.region1.major = this.props.region.major;
      this.initBeaconsScanner();
      this.props.setScannerStateToScanning();
    }
  }

  componentWillUnmount() {
    this.regionRangeSubscription.remove();
    this.regionRangeFailSubscription.remove();
  }

  _startRanging = () => {
    startRangingBeaconsInRegion(this.state.region1)
      .then(() => this.setState({ ranging: true, rangedBeacons: [] }))
      .then(() => console.log('started ranging at BeaconScanner', this.region1))
      .catch(error => console.log('[startRanging]', error));
  };
  _stopRanging = () => {
    stopRangingBeaconsInRegion(this.state.region1)
      .then(() => this.setState({ ranging: false, rangedBeacons: [] }))
      .then(() => console.log('stopped ranging'))
      .catch(error => console.log('[stopRanging]', error));
  };
  _stopAllRanging = () => {
    stopRangingBeaconsInAllRegions()
      .then(() => this.setState({ ranging: false, rangedBeacons: [] }))
      .then(() => console.log('stopped ranging in all regions'))
      .catch(error => console.log('[stopAllRanging]', error));
  };

  _isIdenticalRegion = (r1, r2) => (
    r1.identifier === r2.identifier
  );

  renderItem = ({ item }) => {
    return <ListItem item={item} />;
  };

  render() {
    return (
      <View style={styles.listContainer}>
        {this.props.region === null ? <Loader size={"small"} />:<FlatList
          data={this.props.beacons}
          renderItem={this.renderItem}
          keyExtractor={(item) => item.address.toString()}
          style={styles.items}
          extraData={this.props.beacons}
        />}
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
  }
});

const mapStateToProps = (state) => ({
  beacons: state.beacons.associated,
  isScanning: state.scanner.isScanning,
  region: state.region.beacon,
});

export default connectRedux(mapStateToProps, {
  retrieveAssociatedBeacons,
  setScannerStateToScanning,
  setScannerStateToNotScanning,
  getRegionToSearchForIos,
  setRegionToSearchForIos
})(BeaconScanner);
