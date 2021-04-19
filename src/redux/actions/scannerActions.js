import { 
    SET_SCANNER_TO_NOT_SCANNING, 
    SET_SCANNER_TO_SCANNING 
} from "./types";

export const setScannerStateToNotScanning = () => (dispatch) => {
    dispatch({
        type: SET_SCANNER_TO_NOT_SCANNING,
        payload: false
    });
};

export const setScannerStateToScanning = () => (dispatch) => {
    dispatch({
        type: SET_SCANNER_TO_SCANNING,
        payload: true
    });
};

