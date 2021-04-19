import {
    SET_REGION_TO_SEARCHFOR_IOS,
    GET_REGION_TO_SEARCHFOR_IOS
} from "./types"
import AsyncStorage from "@react-native-async-storage/async-storage";

function getRegionAndDispatch (dispatch, actionType) {
    AsyncStorage.getItem('region')
    .then(res => JSON.parse(res))
    .then(data => dispatch({
        type: actionType,
        payload: data
    }));
}

export const setRegionToSearchForIos = (region) => (dispatch) => {
    if (region == null) {
        var defaultRegion = {uuid: '', major: 0}
        defaultRegion.uuid = 'FFFFFFFF-1234-AAAA-1A2B-A1B2C3D4E5F6';
        defaultRegion.major = 1;
        try {
            AsyncStorage.setItem('region', JSON.stringify(defaultRegion));
            getRegionAndDispatch(dispatch, SET_REGION_TO_SEARCHFOR_IOS);
        } catch (err) {}
    } else {
        try {
            AsyncStorage.setItem('region', JSON.stringify(region));
            getRegionAndDispatch(dispatch, SET_REGION_TO_SEARCHFOR_IOS);
        } catch (err){}
    }
};

export const getRegionToSearchForIos = () => (dispatch) => {
    try {
        getRegionAndDispatch(dispatch, GET_REGION_TO_SEARCHFOR_IOS);
    } catch (err){}
};