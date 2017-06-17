import React, { Component } from 'react';
import { AppRegistry, Button, View, Text } from 'react-native';
import palette from '../style/palette';

export default class registerMain extends Component {
  static navigationOptions = {
    title: 'Registration Main',
    headerStyle: {
      backgroundColor: palette.PRIMARY_COLOR,
    },
    headerTitleStyle: {
      color: palette.WHITE,
    },
    headerBackTitleStyle: {
      color: palette.WHITE,
    },
    headerTintColor: palette.WHITE,
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
            color={palette.PRIMARY_COLOR}
            onPress={() => navigate('consumerRegister')}
            title="Register as Consumer"
          />
          <Button
            style={{ width: 800 }}
            color={palette.PRIMARY_COLOR_DARK}
            onPress={() => navigate('merchantRegister')}
            title="Register as Mechanic"
          />
        </View>
      </View>
    );
  }
}

AppRegistry.registerComponent('registerMain', () => registerMain);
