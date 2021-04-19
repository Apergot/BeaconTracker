import { 
    SET_SCANNER_TO_NOT_SCANNING, 
    SET_SCANNER_TO_SCANNING 
} from '../actions/types';

const initialState = {
    isScanning: false
};

export default function (state = initialState, action) {
    switch (action.type) {
        case SET_SCANNER_TO_SCANNING:
            return {
                ...state,
                isScanning: action.payload
            };
        case SET_SCANNER_TO_NOT_SCANNING:
            return {
                ...state,
                isScanning: action.payload
            };
        default:
            return state;
    }
}