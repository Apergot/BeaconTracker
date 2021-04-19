import { combineReducers } from 'redux';
import beaconsReducer from './beaconsReducer'
import scannerReducer from './scannerReducer'
import regionReducer from './regionReducer'

export default combineReducers({
    beacons: beaconsReducer,
    scanner: scannerReducer,
    region: regionReducer
});