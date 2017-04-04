import React, { Component } from 'react';
import { Alert,
        AppRegistry,
        Button,
        View,
        Picker,
        ScrollView, Text, TextInput } from 'react-native';

export default class registerMechanic extends Component {
  static navigationOptions = {
    title: 'Register As Auto Service Shop',
  };

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
            />
            <TextInput
              style={{ height: 60, width: 300 }}
              placeholder="password"
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
            />
            <TextInput
              style={{ height: 60, width: 300 }}
              placeholder="Address"
            />
            <TextInput
              style={{ height: 60, width: 300 }}
              placeholder="City"
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
              onPress={() => navigate('RegisterServicesOffered')}
              title="Select services offered"
            />
          </View>
        </ScrollView>
      </View>
    );
  }
}

AppRegistry.registerComponent('registerMechanic', () => registerMechanic);
