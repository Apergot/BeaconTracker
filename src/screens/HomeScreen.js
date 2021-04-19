import React from 'react';
import {View, PermissionsAndroid, Platform} from 'react-native';

import HomePageBeacons from '../custom-components/HomePageBeacons';
import { NavigationEvents } from 'react-navigation';

const requestLocationForegroundPermission = async () => {
    try {
      const granted = await PermissionsAndroid.requestMultiple(
        [
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION
        ]
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
};
  
  

class HomeScreen extends React.Component {

    constructor(props){
        super(props);
    }

    async componentDidMount(){
      if (Platform.OS === 'android') {
        await requestLocationForegroundPermission();
      }
    }

    render() {
        <NavigationEvents />
        return (
            <View>
                <HomePageBeacons navigation={this.props.navigation}/> 
            </View>
        );
    }
}

export default HomeScreen;