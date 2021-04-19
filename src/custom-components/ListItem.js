import React from 'react';
import { View, Text, StyleSheet, Alert, Platform, TouchableOpacity, ActionSheetIOS} from 'react-native';

import PopupMenu from './PopupMenu';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { removeAssociatedBeacon } from '../redux/actions/beaconsActions';
import { setScannerStateToNotScanning } from '../redux/actions/scannerActions'
import { useDispatch } from 'react-redux'
import DistanceTracker from './DistanceTracker'

const ListItem = ({item}) => {

    const dispatch = useDispatch();

    const removingBeaconAlert = () => {
        Alert.alert(
            "Removing associated beacon",
            "You are about to remove a paired beacon from the list of associated beacons. Are you sure?",
            [
              {
                text: "Cancel",
                onPress: () => console.log("Cancel Pressed"),
                style: "cancel"
              },
              { text: "OK", onPress: () => {
                  dispatch(removeAssociatedBeacon(item.address));
                  dispatch(setScannerStateToNotScanning());
                }}
            ],
            { cancelable: true }
        );
    }

    const onPopupEvent = (eventName, index) => {
        if(eventName !== 'itemSelected') return
        if(index === 0) removingBeaconAlert()
        else removingBeaconAlert()
    }

    return (
        <View style={styles.container}>
            <Text style={styles.textStyle}>{item.name}</Text>
            <View style={styles.actionsContainer}>
                <DistanceTracker distance={item.currentdistance} exceeded={item.exceeded} name={item.name}/>
                {Platform.OS === 'android' ? 
                    <PopupMenu actions={['Edit', 'Remove']} onPress={onPopupEvent}/> 
                    : 
                    <TouchableOpacity onPress={() => {
                        ActionSheetIOS.showActionSheetWithOptions(
                            {
                                options: ['Cancel', 'Remove'],
                                cancelButtonIndex: 0
                            },
                            buttonIndex => {
                                if (buttonIndex === 0) {
                                    //cancel
                                } else if (buttonIndex === 1) {
                                    removingBeaconAlert();
                                }
                            }
                        );
                    }}>
                        <Icon
                            name='more-vert'
                            size={30}
                            color={'grey'}/>
                    </TouchableOpacity>
                }
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        alignItems:'center'
    },
    textStyle: {
        fontSize: 20
    },
    actionsContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems:'center',
        width:'25%'
    }
});

export default ListItem;