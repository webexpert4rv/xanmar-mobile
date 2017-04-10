import React, { Component } from 'react';
import { AppRegistry, Button, View, Text } from 'react-native';

export default class registerMain extends Component {
  static navigationOptions = {
    title: 'Registration Main',
  };

  render() {
    const { navigate } = this.props.navigation;
    return (
      <View>
        <View>
          <Text style={{ textAlign: 'center', marginTop: 30, fontSize: 20 }}>Register as one of the following </Text>
        </View>
        <View style={{ height: 200, flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around' }}>
          <Button
            style={{ width: 800 }}
            onPress={() => navigate('ConsumerRegister')}
            title="Register as Consumer"
          />
          <Button
            style={{ width: 800 }}
            onPress={() => navigate('AutoServiceRegister')}
            title="Register as Mechanic"
          />
        </View>
      </View>
    );
  }
}

AppRegistry.registerComponent('registerMain', () => registerMain);
