import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import { Input, Card, Slider, Button } from 'react-native-elements';
import { connect } from 'react-redux';
import { addToAssociatedBeacons } from '../redux/actions/beaconsActions';
import { setScannerStateToNotScanning } from '../redux/actions/scannerActions'

class RegisterBeacon extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            targetBeacon: props.route.params.beacon,
            value: 0,
            name: ''
        }
    }

    async _storeTargetBeacon(){
        this.props.addToAssociatedBeacons({
            address: this.state.targetBeacon.address,
            name: this.state.name,
            track: true,
            spamavoider: false,
            currentdistance: null,
            maxdistance: this.state.value,
            exceeded: false,
            region: {
                identifier: this.state.name,
                uuid: this.state.targetBeacon.uuid,
                major: this.state.targetBeacon.major,
                minor: this.state.targetBeacon.minor
            }
        });
        this.props.setScannerStateToNotScanning();
        this.props.navigation.navigate('Home');
    }

     render () {
        return (
            <View>
                <Card>
                    <Card.Title>{this.state.targetBeacon.uuid}</Card.Title>
                    <Card.Divider/>
                    <View>
                    <Text>Proximity: {this.state.targetBeacon.proximity}</Text>
                    <Text>Address: {this.state.targetBeacon.address} </Text>
                    </View>
                </Card>
                <View style={styles.container}>
                    <Text style={styles.textInput}>Provide a name for your beacon</Text>
                    <Input
                    placeholder='Enter a name'
                    onChangeText= {name => this.setState({name})}
                    />
                    <Text style={styles.textInput}> Set a maximum distance from you: { this.state.value } m</Text>
                    <Slider
                        value={this.state.value}
                        onValueChange={(value => this.setState({value}))}
                        maximumValue={20}
                        minimumValue={1}
                        step={1}
                        trackStyle={{ height: 10, backgroundColor: 'transparent' }}
                        thumbStyle={{ height: 15, width: 15, backgroundColor:'#121212'}}
                        trackStyle={{backgroundColor:'#fff'}}
                    />
                    <Button 
                        title='Pair beacon' 
                        raised 
                        buttonStyle={styles.button} 
                        containerStyle={styles.buttonContainer} onPress={() => this._storeTargetBeacon()}/>
                </View>
            </View>
        );
     }
    
};

const styles = StyleSheet.create({
    container: {
        display:'flex',
        height:'100%',
        flexDirection:'column',
        padding:16,
        marginHorizontal:10,
        marginTop: '10%'
    },
    textInput:{
        fontSize: 16
    },
    button: {
        backgroundColor:'#49B8F7'
    },
    buttonContainer: {
        marginHorizontal:'25%',
        marginTop:'15%',
        borderRadius:10
    }
});

const mapStateToProps = (state) => ({
    isScanning: state.scanner.isScanning
  });

export default connect(mapStateToProps, {addToAssociatedBeacons, setScannerStateToNotScanning})(RegisterBeacon)

