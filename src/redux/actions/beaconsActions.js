import {
  ADD_TO_ASSOCIATED_BEACONS,
  REMOVE_FROM_ASSOCIATED_BEACONS,
  RETRIEVE_ASSOCIATED_BEACONS,
} from "./types";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const retrieveAssociatedBeacons = () => (dispatch) => {
  try {
    AsyncStorage.getItem('beacons')
    .then(res => JSON.parse(res))
    .then(data => dispatch({
        type: RETRIEVE_ASSOCIATED_BEACONS,
        payload: data
    }));
  } catch (err) {
      //TODO: Error handling
  }
};

export const removeAssociatedBeacon = (address) => (dispatch) => {
  try {
    AsyncStorage.getItem('beacons')
    .then(res => JSON.parse(res))
    .then(data => {
      var removeIndex = data.map(function(item){return item.address}).indexOf(address);
      data.splice(removeIndex, 1);
      setBeaconsAndDispatch(dispatch, data, REMOVE_FROM_ASSOCIATED_BEACONS);
    });
  } catch (err) {
    //TODO: error handling
  }
};

async function setAsyncStorageKey (key, value) {
    await AsyncStorage.setItem(key, JSON.stringify(value));
}

function setBeaconsAndDispatch (dispatch, arrayWithNewBeaconAdded, actionType) {
    setAsyncStorageKey('beacons', arrayWithNewBeaconAdded);
    AsyncStorage.getItem('beacons')
    .then(res => JSON.parse(res))
    .then(data => dispatch({
        type: actionType,
        payload: data
    }));
}

export const addToAssociatedBeacons = (targetBeacon) => async (dispatch) => {
  try {
    AsyncStorage.getItem('beacons')
    .then(res => JSON.parse(res))
    .then(data => {
        if (data != null) {
            if (data.some(beacon => beacon.address === targetBeacon.address)) {
                //TODO: this should never happen here, we should check on device selection
            } else {
                data.push(targetBeacon);
                setBeaconsAndDispatch(dispatch, data, ADD_TO_ASSOCIATED_BEACONS);
            }
        } else {
            var newArrayOfAssociatedBeacons = new Array();
            newArrayOfAssociatedBeacons.push(targetBeacon);
            setBeaconsAndDispatch(dispatch, newArrayOfAssociatedBeacons, ADD_TO_ASSOCIATED_BEACONS);
        }
    });
    
  } catch (err) {
      //TODO: error handling
  }
};
