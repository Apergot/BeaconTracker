import {
    SET_REGION_TO_SEARCHFOR_IOS,
    GET_REGION_TO_SEARCHFOR_IOS
} from '../actions/types'

const initialState = {
    beacon: {uuid: 'FFFFFFFF-1234-AAAA-1A2B-A1B2C3D4E5F6', major: 1}
};

export default function (state = initialState, action) {
    switch (action.type) {
        case SET_REGION_TO_SEARCHFOR_IOS:
            return {
                ...state,
                beacon: action.payload
            };
        case GET_REGION_TO_SEARCHFOR_IOS:
            return {
                ...state,
                beacon: action.payload
            };
        default:
            return state;
    }
}