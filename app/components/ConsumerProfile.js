import React, { Component } from 'react';
import { AppRegistry,
        Button,
        Image,
        View,
        Text, TextInput } from 'react-native';
import format from 'string-format';
import constants from '../constants/c';
import realm from './realm';

const profileIcon = require('../img/profile_icon.png');

export default class ConsumerProfile extends Component {
  static navigationOptions = {
    title: 'My Profile',
    header: {
      visible: false,
    },
    tabBar: {
      icon: ({ tintColor }) => (
        <Image
          source={profileIcon}
          style={{ width: 26, height: 26, tintColor: tintColor }}
        />
     ),
    },
  };

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      vehicles: [],
      models: [],
    };
  }

  updateProfile() {
    const { navigate } = this.props.navigation;
    fetch(format('{}/api/user/registration', constants.BASSE_URL), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: this.state.email,
        pwd: this.state.pwd,
      }),
    })
      .then(response => response.json())
      .then((responseData) => {
        const uId = responseData.user_id;
        realm.write(() => {
          realm.create('UserPreference', { onboarded: true, userId: uId, role: 'consumer' });
        });
        this.setState({
          userId: uId,
        });
        navigate('RegisterVehicle');
      })
      .done();
  }

  render() {
    const { navigate } = this.props.navigation;
    return (
      <View>
        <View>
          <Text style={{ marginLeft: 20, textAlign: 'left', marginTop: 30, fontSize: 20 }}>Account Information</Text>
        </View>
        <View style={{ flexDirection: 'column', alignItems: 'flex-start', marginTop: 20, marginLeft: 20 }}>
          <TextInput
            style={{ height: 60, width: 300 }}
            placeholder="email"
            onChangeText={text => this.setState({ email: text })}
          />
          <TextInput
            style={{ height: 60, width: 300 }}
            placeholder="password"
            onChangeText={text => this.setState({ pwd: text })}
          />
          <TextInput
            style={{ height: 60, width: 300 }}
            placeholder="confirm password"
          />
        </View>
        <View style={{ marginTop: 50, marginBottom: 10, height: 50, flexDirection: 'column', alignItems: 'center' }}>
          <Button
            style={{ width: 800 }}
            onPress={() => this.updateProfile()}
            title="Create Account"
          />
        </View>
      </View>
    );
  }
}

AppRegistry.registerComponent('ConsumerProfile', () => ConsumerProfile);
