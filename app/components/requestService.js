import React, { Component } from 'react';
import { AppRegistry, View, Text } from 'react-native';

export default class requestService extends Component {
  static navigationOptions = {
    title: 'Request Service',
  };

  render() {
    return (
      <View>
        <View>
          <Text style={{ textAlign: 'center', marginTop: 30, fontSize: 20 }}>Select service to be performed. </Text>
        </View>
      </View>
    );
  }
}

AppRegistry.registerComponent('requestService', () => requestService);
