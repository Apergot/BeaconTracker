import React from 'react';
import {TouchableOpacity, StyleSheet} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons'

const FloatingButton = ({onPress}) => {
    return (
        <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.floatingButtonContainer}>
            <FontAwesomeIcon icon={faPlus} size={20} color={"white"} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    floatingButtonContainer: {
        display: "flex",
        justifyContent:"center",
        alignItems: "center",
        elevation:90,
        position: "absolute",
        bottom: 25,
        right: 25,
        backgroundColor: "#49B8F7",
        height:50,
        width:50,
        borderRadius:50,
        zIndex:3
    },

    floatingButtonText: {
        fontSize:30,
        color:"#ffffff"
    }
});

export default FloatingButton;