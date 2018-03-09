import React, { Component, PropTypes } from 'react';
import { AppRegistry, Image, View, Text, TouchableOpacity } from 'react-native';
import { onboardingStyles, common } from '../style/style';
import palette from '../style/palette';

const userIcon = require('../img/onboarding/user.png');
const mechanicIcon = require('../img/onboarding/mechanic.png');

export default class RegisterMain extends Component {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    return {
      headerStyle: common.header,
      headerTitleStyle: {
        color: palette.WHITE,
      },
      headerBackTitleStyle: {
        color: palette.WHITE,
      },
      headerTintColor: palette.WHITE,
    };
  };

  render() {
    const { navigate } = this.props.navigation;
    return (
      <View style={onboardingStyles.mainContainer}>
        <View>
          <Text style={{ textAlign: 'center',  marginTop: 5,fontSize: 25,color: palette.WHITE }}>Let&apos;s Get Started </Text>
        </View>
        <View>
          <Text style={onboardingStyles.subTitle}>To get started, tell us who you are </Text>
        </View>
        <View style={onboardingStyles.imageCenter}>
          <TouchableOpacity onPress={() => navigate('consumerRegister')}>
            <Image source={userIcon} />
          </TouchableOpacity>
        </View>
        <View style={onboardingStyles.imageCenter}>
          <TouchableOpacity onPress={() => navigate('MerchantRegisterBusiness')}>
            <Image source={mechanicIcon} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

RegisterMain.propTypes = {
  navigation: PropTypes.object.isRequired,
};

AppRegistry.registerComponent('RegisterMain', () => RegisterMain);
