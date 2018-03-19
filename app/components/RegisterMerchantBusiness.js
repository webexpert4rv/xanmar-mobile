import React, { Component, PropTypes } from 'react';
import {
  AppRegistry,
  KeyboardAvoidingView,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  View,
} from 'react-native';
import renderIf from 'render-if';
import { HeaderBackButton } from 'react-navigation';
import { formStyles, onboardingStyles, common } from '../style/style';
import palette from '../style/palette';

export default class RegisterMerchantBusiness extends Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = {

      showBizNameError: false,
      showAddressError: false,
      showCityError: false,
      showStateError: false,
      showZipError: false,
    };
  }

  gotoContact() {
    if (this.validateForm()) {
      const { navigate } = this.props.navigation;
      navigate('MerchantRegisterContactInfo',
        {
          bizName: this.state.name,
          address: this.state.address,
          city: this.state.city,
          st: this.state.st,
          zip: this.state.zip,
        });
    }
  }

  goBack() {
    const { goBack } = this.props.navigation;
    goBack();
  }
  validateForm() {
    let formValid = true;

    // biz  name
    if (this.state.name === undefined || this.state.name.length === 0) {
      this.setState({ showBizNameError: true });
      formValid = false;
    } else {
      this.setState({ showBizNameError: false });
    }

    // address
    if (this.state.address === undefined || this.state.address.length === 0) {
      this.setState({ showAddressError: true });
      formValid = false;
    } else {
      this.setState({ showAddressError: false });
    }

    // city
    if (this.state.city === undefined || this.state.city.length === 0) {
      this.setState({ showCityError: true });
      formValid = false;
    } else {
      this.setState({ showCityError: false });
    }

    // state
    if (this.state.st === undefined || this.state.st.length === 0) {
      this.setState({ showStateError: true });
      formValid = false;
    } else {
      this.setState({ showStateError: false });
    }

    // zip
    if (this.state.zip === undefined || this.state.zip.length < 5) {
      this.setState({ showZipError: true });
      formValid = false;
    } else {
      this.setState({ showZipError: false });
    }
    return formValid;
  }

  render() {
    const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;
    const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : 0;
    const HEIGHT = APPBAR_HEIGHT + STATUSBAR_HEIGHT;
    return (

      <View style={common.merchantContainer}>

        <View
          style={{ flex: 0.10,
            backgroundColor: palette.MERCHANT_HEADER_COLOR,
            alignSelf: 'stretch',
            height: HEIGHT,
            flexDirection: 'row',
            justifyContent: 'space-between' }}
        >
          <HeaderBackButton tintColor={palette.WHITE} onPress={() => this.goBack()} />
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => this.gotoContact()} >
              <Text style={common.headerLeftButton}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>


        <KeyboardAvoidingView behavior='padding' style={{ flex: 0.90 }}>
        <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: palette.MERCHANT_HEADER_COLOR, height: 50 }}>
          <Text style={common.headerTitle}>
            Tell us about your business
          </Text>
        </View>
          <View style={{ flexDirection: 'column', alignItems: 'flex-start', marginTop: 20, marginLeft: 20 }}>
            {renderIf(this.state.showBizNameError)(
              <Text style={formStyles.error}>Field required</Text>
            )}
            <View style={{ flexDirection: 'row', height: 50 }}>
              <View style={{ width: 100, marginTop: 10, flex: 0.5 }}>
                <Text style={onboardingStyles.label}>Business Name:</Text>
              </View>
              <TextInput
                style={[onboardingStyles.textInput, { height: 50, flex: 0.5 }]}
                underlineColorAndroid="rgba(0,0,0,0)"
                autoCorrect={false}
                onChangeText={text => this.setState({ name: text })}
              />
            </View>
            <View style={onboardingStyles.line} />
            {renderIf(this.state.showAddressError)(
              <Text style={formStyles.error}>Field required</Text>
            )}
            <View style={{ flexDirection: 'row', height: 50 }}>
              <View style={{ width: 100, marginTop: 10, flex: 0.3 }}>
                <Text style={onboardingStyles.label}>Address:</Text>
              </View>
              <TextInput
                style={[onboardingStyles.textInput, { height: 50, flex: 0.7 }]}
                underlineColorAndroid="rgba(0,0,0,0)"
                autoCorrect={false}
                onChangeText={text => this.setState({ address: text })}
              />
            </View>
            <View style={onboardingStyles.line} />
            {renderIf(this.state.showCityError)(
              <Text style={formStyles.error}>Field required</Text>
            )}
            <View style={{ flexDirection: 'row', height: 50 }}>
              <View style={{ width: 100, marginTop: 10, flex: 0.2 }}>
                <Text style={onboardingStyles.label}>City:</Text>
              </View>
              <TextInput
                style={[onboardingStyles.textInput, { height: 50, flex: 0.8 }]}
                underlineColorAndroid="rgba(0,0,0,0)"
                autoCorrect={false}
                onChangeText={text => this.setState({ city: text })}
              />
            </View>
            <View style={onboardingStyles.line} />
            {renderIf(this.state.showStateError)(
              <Text style={formStyles.error}>Field required</Text>
            )}
            <View style={{ flexDirection: 'row', height: 50 }}>
              <View style={{ width: 100, marginTop: 10, flex: 0.3 }}>
                <Text style={onboardingStyles.label}>State:</Text>
              </View>
              <TextInput
                style={[onboardingStyles.textInput, { height: 50, flex: 0.7 }]}
                underlineColorAndroid="rgba(0,0,0,0)"
                autoCorrect={false}
                onChangeText={text => this.setState({ st: text })}
              />
            </View>
            <View style={onboardingStyles.line} />
            {renderIf(this.state.showZipError)(
              <Text style={formStyles.error}>Field required (must be 5 digits)</Text>
            )}
            <View style={{ flexDirection: 'row', height: 50 }}>
              <View style={{ width: 200, marginTop: 10, flex: 0.2 }}>
                <Text style={onboardingStyles.label}>Zip:</Text>
              </View>
              <TextInput
                style={[onboardingStyles.textInput, { height: 50, flex: 0.8 }]}
                underlineColorAndroid="rgba(0,0,0,0)"
                autoCorrect={false}
                keyboardType="numeric"
                maxLength={5}
                onChangeText={text => this.setState({ zip: text })}
              />
            </View>
            <View style={onboardingStyles.line} />
          </View>
        </KeyboardAvoidingView>

      </View>


    );
  }
}

RegisterMerchantBusiness.propTypes = {
  navigation: PropTypes.object.isRequired,
};

AppRegistry.registerComponent('RegisterMerchantBusiness', () => RegisterMerchantBusiness);
