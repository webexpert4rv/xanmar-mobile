import React, { Component } from 'react';
import { Alert,
        AppRegistry,
        Button,
        View,
        Picker,
        ScrollView, Text, TextInput } from 'react-native';
import realm from './realm';

export default class registerMerchant extends Component {
  static navigationOptions = {
    title: 'Register As Auto Service Shop',
  };

  postMerchant() {
    const { navigate } = this.props.navigation;
    fetch('http://192.168.86.214:3000/api/provider', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: this.state.email,
        pwd: this.state.pwd,
        business: {
          name: this.state.name,
          address: this.state.address,
          city: this.state.city,
          st: this.state.st,
          zip: this.state.zip,
        }
      }),
    })
      .then(response => response.json())
      .then((responseData) => {
        console.log(JSON.stringify(responseData));
        const uId = responseData.service_provider_id;
        realm.write(() => {
          realm.create('UserPreference', { onboarded: true, userId: uId, role: 'merchant' });
        });
        this.setState({
          userId: uId,
        });
        navigate('svcs');
      })
      .done();
  }

  render() {
    const { navigate } = this.props.navigation;
    return (
      <View>
        <ScrollView>
          <View>
            <Text style={{ marginLeft: 20, textAlign: 'left', marginTop: 30, fontSize: 20 }}>Account </Text>
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
          <View>
            <Text style={{ marginLeft: 20, textAlign: 'left', marginTop: 30, fontSize: 20 }}>Business Information </Text>
          </View>
          <View style={{ flexDirection: 'column', alignItems: 'flex-start', marginTop: 20, marginLeft: 20 }}>
            <TextInput
              style={{ height: 60, width: 300 }}
              placeholder="Business Name"
              onChangeText={text => this.setState({ name: text })}
            />
            <TextInput
              style={{ height: 60, width: 300 }}
              placeholder="Address"
              onChangeText={text => this.setState({ address: text })}
            />
            <TextInput
              style={{ height: 60, width: 300 }}
              placeholder="City"
              onChangeText={text => this.setState({ city: text })}
            />
          </View>
          <View style={{ flexDirection: 'row', marginTop: 20, marginLeft: 20 }}>
            <TextInput
              style={{ height: 60, width: 100 }}
              placeholder="State"
            />
            <TextInput
              style={{ height: 60, width: 100 }}
              placeholder="zip"
            />
          </View>

          <View style={{ marginTop: 20, marginBottom: 10, height: 50, flexDirection: 'column', alignItems: 'center' }}>
            <Button
              style={{ width: 800 }}
              onPress={() => this.postMerchant()}
              title="Select services offered"
            />
          </View>
        </ScrollView>
      </View>
    );
  }
}

AppRegistry.registerComponent('registerMerchant', () => registerMerchant);
