import { 
    ADD_TO_ASSOCIATED_BEACONS, 
    RETRIEVE_ASSOCIATED_BEACONS, 
    REMOVE_FROM_ASSOCIATED_BEACONS 
} from '../actions/types';

const initialState = {
    associated: []
};

export default function (state = initialState, action) {
    switch (action.type) {
        case RETRIEVE_ASSOCIATED_BEACONS:
            return {
                ...state,
                associated: action.payload
            };
        case REMOVE_FROM_ASSOCIATED_BEACONS:
            return {
                ...state,
                associated: action.payload
            };
        case ADD_TO_ASSOCIATED_BEACONS:
            return {
                ...state,
                associated: action.payload
            };
        default:
            return  state;
    }
}