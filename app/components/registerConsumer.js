import React, { Component } from 'react';
import { AppRegistry, Alert,
        Button,
        View,
        Text, TextInput } from 'react-native';

export default class registerConsumer extends Component {
  static navigationOptions = {
    title: 'Register Consumer',
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
    const { navigate } = this.props.navigation;
    fetch('http://192.168.86.214:3000/api/user/registration', {
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
        this.setState({
          userId: responseData.user_id,
        });
        navigate('RegisterVehicle')
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
            onPress={() => this.registerUser()}
            title="Create Account"
          />
        </View>
      </View>
    );
  }
}

AppRegistry.registerComponent('registerConsumer', () => registerConsumer);
