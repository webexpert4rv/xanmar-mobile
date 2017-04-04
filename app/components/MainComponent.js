import React, { Component } from 'react';
import { AppRegistry, Button, View, Text } from 'react-native';

export default class mainComponent extends Component {
  static navigationOptions = {
    title: 'Xanmar',
  };

  render() {
    const { navigate } = this.props.navigation;
    return (
      <View>
        <View>
          <Text style={{ textAlign: 'center', marginTop: 30, fontSize: 20 }}>Main Page, Vechicles already registered show here </Text>
        </View>
      </View>
    );
  }
}

AppRegistry.registerComponent('mainComponent', () => mainComponent);
