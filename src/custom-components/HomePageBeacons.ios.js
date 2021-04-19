import React from "react";
import {
  StyleSheet,
  View,
  Text
} from "react-native";
import { connect } from 'react-redux';
import { retrieveAssociatedBeacons } from '../redux/actions/beaconsActions'

import FloatingButton from "./FloatingButton";
import BeaconScanner from './BeaconScanner'

class HomePageBeacons extends React.Component {

  render() {
    return (
      <View style={styles.screenContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.mainHeader}>BeaconTracker</Text>
          {this.props.beacons != null ? (
            <Text style={styles.subHeader}>List of associated beacons</Text>
          ) : (
            <Text style={styles.subHeader}>No beacons added yet</Text>
          )}
        </View>
        <BeaconScanner beacons={this.props.beacons}/>
        <FloatingButton
          onPress={() => this.props.navigation.navigate("AvailableBeacons")}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  screenContainer: {
    display: "flex",
    height: "100%",
    backgroundColor: "#49B8F7",
    flexDirection: "column",
  },
  titleContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    height: "20%",
    marginLeft: "5%",
  },
  mainHeader: {
    fontSize: 35,
    color: "#fff",
    fontWeight: "700",
  },
  subHeader: {
    fontSize: 17.5,
    color: "#fff",
    padding: 0,
  },
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
  region: state.region.beacon
});

export default connect(mapStateToProps, {
  retrieveAssociatedBeacons
})(HomePageBeacons);
