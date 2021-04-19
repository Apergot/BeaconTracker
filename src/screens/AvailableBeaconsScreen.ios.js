import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  NativeEventEmitter,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert
} from 'react-native';

import Kontakt, { KontaktModule } from 'react-native-kontaktio';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Input, Button } from "react-native-elements";
import { connect } from 'react-redux';
import { getRegionToSearchForIos, setRegionToSearchForIos } from '../redux/actions/regionActions'
import { setScannerStateToNotScanning } from '../redux/actions/scannerActions'

const {
  init,
  configure,
  // authorization
  getAuthorizationStatus,
  requestWhenInUseAuthorization,
  requestAlwaysAuthorization,
  // ranging
  startRangingBeaconsInRegion,
  stopRangingBeaconsInRegion,
  stopRangingBeaconsInAllRegions
} = Kontakt;

const kontaktEmitter = new NativeEventEmitter(KontaktModule);

class AvailableBeaconsScreen extends Component {
  state = {
    scanning: false,
    ranging: false,
    monitoring: false,
    discoveredBeacons: [],
    rangedBeacons: [],
    rangedRegions: [],
    monitoredRegions: [],
    monitoredRegionsCloseBy: [],
    authorizationStatus: '',
    isVisible: false,
    uuid: '',
    major: null,
    region1 : {
      identifier: 'All beacons',
      uuid: this.props.region.uuid,
      major: this.props.region.major
    }
  };

  regionRangeSubscription = null;
  regionRangeFailSubscription = null;
  authorizationSubscription = null;

  displayModal(show) {
    this.setState({ isVisible: show });
  }

  initBeaconsScanner () {
    if (this.state.ranging) {
      this._stopAllRanging();
      this.setState({rangedBeacons: []});
    }
    init('MY_KONTAKTIO_API_KEY')
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
        console.log('didRangeBeacons', rangedBeacons, region);
        this.setState({ rangedBeacons });
      }
    );
    this.regionRangeFailSubscription = kontaktEmitter.addListener(
      'rangingDidFailForRegion',
      ({ region, error }) => (
        //console.log('rangingDidFailForRegion', region , error)
        console.log('')
      )
    );

    // Authorization event
    this.authorizationSubscription = kontaktEmitter.addListener(
      'authorizationStatusDidChange',
      ({ status }) => {
        console.log('authorizationStatusDidChange', status);
        this.setState({ authorizationStatus: status });
      }
    );
  }

  async componentDidMount() {
    this.props.setScannerStateToNotScanning();
    // Initialization, configuration and adding of beacon regions
    this.initBeaconsScanner();
  }

  componentWillUnmount() {
    this.regionRangeSubscription.remove();
    this.regionRangeFailSubscription.remove();
    this.authorizationSubscription.remove();
  }

  /* --- Ranging beacons --- */

  _startRanging = () => {
    startRangingBeaconsInRegion(this.state.region1)
      .then(() => this.setState({ ranging: true, rangedBeacons: [] }))
      .then(() => console.log('Starting ranging', this.state.region1))
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
  
  /* --- Authorization --- */

  _getAuthorizationStatus = () => {
    getAuthorizationStatus()
      .then(authorizationStatus => {
        alert(`Authorization status: ${authorizationStatus}`);
        console.log(`Authorization status: ${authorizationStatus}`);
      })
      .catch(error => console.log('[getAuthorizationStatus]', error));
  };

  _requestAlwaysAuthorization = () => {
    requestAlwaysAuthorization()
      .then(() => console.log('requested always authorization'))
      .catch(error => console.log('[requestAlwaysAuthorization]', error));
  };

  _requestWhenInUseAuthorization = () => {
    requestWhenInUseAuthorization()
      .then(() => console.log('requested when in use authorization'))
      .catch(error => console.log('[requestWhenInUseAuthorization]', error));
  };

  /**
   * Helper function used to identify equal regions
   */
  _isIdenticalRegion = (r1, r2) => (
    r1.identifier === r2.identifier
  );

  _renderRangedBeacons = () => {
    const colors = ['#F7C376', '#EFF7B7', '#F4CDED', '#A2C8F9', '#AAF7AF'];

    return this.state.rangedBeacons.sort((a, b) => a.accuracy - b.accuracy).map((beacon, ind) => (
      <TouchableOpacity key={ind} onPress={() => {
        this._stopAllRanging();
        this.props.navigation.navigate('RegisterBeacon', {beacon: beacon});
      }}>
        <View style={[styles.beacon, {backgroundColor: colors[beacon.minor - 1]}]}>
        <Text style={{fontWeight: 'bold'}}>{beacon.uuid}</Text>
        <Text>Major: {beacon.major}, Minor: {beacon.minor}</Text>
        <Text>RSSI: {beacon.rssi}, Proximity: {beacon.proximity}</Text>
        <Text>Distance: {beacon.accuracy}</Text>
        </View>
      </TouchableOpacity>
    ), this);
  };

  _renderEmpty = () => {
    const { scanning, ranging, monitoring, discoveredBeacons, rangedBeacons, monitoredRegionsCloseBy } = this.state;
    let text = '';
    if (!scanning && !ranging && !monitoring) text = "Start scanning to listen for beacon signals!";
    if (scanning && !discoveredBeacons.length) text = "No beacons discovered yet...";
    if (ranging && !rangedBeacons.length) text = "No beacons ranged yet...";
    if (monitoring && !monitoredRegionsCloseBy.length) text = "No monitored regions in your proximity...";
    return text ? (
      <View style={styles.textContainer}>
        <Text style={styles.text}>{text}</Text>
      </View>) : null;
  };

  render() {
    const { ranging, rangedBeacons } = this.state;

    return (
      <View style={styles.container}>
        <Modal
            animationType={"slide"}
            transparent={true}
            visible={this.state.isVisible}
            onRequestClose={() => {
              Alert.alert("Modal has now been closed.");
            }}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Text style={styles.modalTitle}>Add your beacons region</Text>
                <Text style={styles.modalDesc}>In order to be able to scan your beacons on iOS we need to know your beacons region, this can be set on your beacons configuration app</Text>
                <Input
                  placeholder="Enter proximity UUID"
                  onChangeText={(uuid) => this.setState({ uuid })}
                />
                <Input
                  placeholder="Enter region major"
                  onChangeText={(major) => this.setState({ major })}
                />
                <Button 
                        title='Pair beacon'
                        buttonStyle={styles.button} 
                        containerStyle={styles.buttonContainer} onPress={() => {
                          console.log('uuid', this.state.uuid);
                          console.log('major', parseInt(this.state.major));
                          this.props.setRegionToSearchForIos({
                            uuid: this.state.uuid,
                            major: parseInt(this.state.major)
                          });
                          this.setState({region1: {identifier: 'All beacons', uuid: this.state.uuid, major: parseInt(this.state.major)}});
                          this.initBeaconsScanner();
                          this.displayModal(false);
                        }}/>
              </View>
            </View>
          </Modal>
        <View style={styles.infocard}>
          <View style={styles.infocard_header}>
            <Text style={styles.headerTitle}>Scanner Info</Text>
            <TouchableOpacity onPress={() => {
                this.displayModal(true);
              }}>
              <Icon name="settings" size={24} color={'black'}/>
            </TouchableOpacity>
          </View>
          <Text style={styles.infotext}>Scanning right now in the region indicated below, to change the region of your beacons go to your own configuration application and modify the region. If you want to change the region to your own, press the gear and enter your own region.</Text>
          <Text style={styles.infotext}>Current scanning region:</Text>
          <Text style={styles.infotext}><Text style={{fontWeight: "bold"}}> UUID:</Text> {this.state.region1.uuid}</Text>
          <Text style={styles.infotext}><Text style={{fontWeight: "bold"}}> Major:</Text> {this.state.region1.major}</Text>
        </View>
        <ScrollView>
          {this._renderEmpty()}
          {(ranging && !!rangedBeacons.length) && this._renderRangedBeacons()}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20, // statusbarHeight
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
  infocard: {
    display: "flex",
    flexDirection: "column",
    marginHorizontal: "5%",
    padding: 10,
    marginBottom: 20,
    borderColor: 'grey',
    borderWidth: 2,
    borderRadius: 5
  },
  infocard_header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  headerTitle: {
    fontSize: 20
  },
  infotext: {
    marginTop: 10,
    textAlign:"justify"
  },



  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    width:'90%',
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight:"bold",
    marginBottom: 5
  },
  modalDesc: {
      textAlign: "center",
      marginVertical: 10
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  button: {
    backgroundColor:'#49B8F7'
},
buttonContainer: {
    marginHorizontal:'25%',
    borderRadius:10
}
});

const mapStateToProps = (state) => ({
  region: state.region.beacon
});

export default connect(mapStateToProps, {
  getRegionToSearchForIos,
  setScannerStateToNotScanning,
  setRegionToSearchForIos
})(AvailableBeaconsScreen)