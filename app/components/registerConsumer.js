import React, { Component } from 'react';
import { NavigationActions } from 'react-navigation';
import { AppRegistry,
        Button,
        View,
        Text, TextInput } from 'react-native';
import format from 'string-format';
import realm from './realm';
import palette from '../style/palette';
import constants from '../constants/c';


export default class registerConsumer extends Component {
  static navigationOptions = {
    title: 'Register Consumer',
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

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      vehicles: [],
      models: [],
    };
  }

  registerUser() {
    // const resetAction = NavigationActions.reset({
    //   type: NavigationActions.RESET,
    //   index: 0,
    //   key: 'AppNavigator',
    //   actions: [
    //     NavigationActions.navigate({ routeName: 'userNavigator' }),
    //   ],
    // });
    // this.props.navigation.dispatch(resetAction);
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
            secureTextEntry={true}
            onChangeText={text => this.setState({ pwd: text })}
          />
          <TextInput
            style={{ height: 60, width: 300 }}
            secureTextEntry={true}
            placeholder="confirm password"
          />
        </View>
        <View style={{ marginTop: 50, marginBottom: 10, height: 50, flexDirection: 'column', alignItems: 'center' }}>
          <Button
            style={{ width: 800 }}
            color={palette.PRIMARY_COLOR_DARK}
            onPress={() => this.registerUser()}
            title="Create Account"
          />
        </View>
      </View>
    );
  }
}

AppRegistry.registerComponent('registerConsumer', () => registerConsumer);
