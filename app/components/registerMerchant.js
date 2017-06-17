import React, { Component } from 'react';
import { Alert,
        AppRegistry,
        Button,
        View,
        Picker,
        ScrollView, Text, TextInput } from 'react-native';
import format from 'string-format';
import constants from '../constants/c';
import realm from './realm';
import palette from '../style/palette';

export default class registerMerchant extends Component {
  static navigationOptions = {
    title: 'Register As Auto Service Shop',
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

  // getDeviceToken() {
  //   let token = 'not defined';
  //   const userPrefs = realm.objects('UserPreference');
  //   if (userPrefs.length > 0) {
  //     token = userPrefs[0].deviceToken;
  //   }
  //   return token;
  // }

  postMerchant() {
    const { navigate } = this.props.navigation;
    fetch(format('{}/api/provider', constants.BASSE_URL), {
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
        navigate('RegisterServicesOffered', { businessName: this.state.name, businessId: uId });
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
              secureTextEntry={true}
              onChangeText={text => this.setState({ pwd: text })}
            />
            <TextInput
              style={{ height: 60, width: 300 }}
              placeholder="confirm password"
              secureTextEntry={true}
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
              onChangeText={text => this.setState({ st: text })}
            />
            <TextInput
              style={{ height: 60, width: 100 }}
              keyboardType="numeric"
              maxLength={5}
              placeholder="zip"
              onChangeText={text => this.setState({ zip: text })}
            />
          </View>

          <View style={{ marginTop: 20, marginBottom: 10, height: 50, flexDirection: 'column', alignItems: 'center' }}>
            <Button
              style={{ width: 800 }}
              color={palette.PRIMARY_COLOR}
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
