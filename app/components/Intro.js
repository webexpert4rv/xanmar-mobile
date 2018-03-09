import React, { Component, PropTypes } from 'react';
import { AppRegistry, Image, View, Text, TouchableOpacity } from 'react-native';
import { onboardingStyles, common } from '../style/style';
import {PagerTabIndicator, IndicatorViewPager, PagerTitleIndicator, PagerDotIndicator} from 'rn-viewpager';
import palette from '../style/palette';

const userIcon = require('../img/onboarding/user.png');
const serviceIntro = require('../img/tour/tourService.png');
const serviceProviderIntro = require('../img/tour/tourServiceProvider.png');
const tourComment = require('../img/tour/tourComment.png');
const tourMerchantBid = require('../img/tour/tourMerchantBid.png');
const tourRating = require('../img/tour/tourRating.png');
const tourWelcome = require('../img/tour/logo.png');
const tourMerchantServices = require('../img/tour/tourMerchantServices.png');


export default class Intro extends Component {
  static navigationOptions = {
    header: null,
  };
  _renderDotIndicator() {
      return <PagerDotIndicator pageCount={6} />;
  }

  render() {
    const { navigate } = this.props.navigation;
    return (
      <View style={onboardingStyles.mainContainer}>
        <View style={{flex:.9 }}>
            <IndicatorViewPager
                style={{flex:1, backgroundColor: palette.DARK_BLUE }}
                indicator={this._renderDotIndicator()}>

                <View style = {{ flexDirection: 'column',justifyContent: 'center',alignItems: 'center'}}>
                  <View>
                      <Image style={{ marginTop:10 }} source={tourWelcome} />
                  </View>
                  <View>
                    <Text style={{ marginTop: 20, marginBottom:10, marginLeft: 10, marginRight: 10, color: '#c5c5c5', fontSize:15, textAlign: 'center' }}>
                    This app builds unrivaled partnerships between people and auto service providers by providing a faster,
                    more convenient and affordable way to shop for auto services.</Text>
                  </View>
                  <View>
                    <Text style={{ marginTop: 20, marginBottom:10, marginLeft: 10, marginRight: 10, color: '#c5c5c5', fontSize:15, textAlign: 'center' }}>
                    SEE HOW IT WORKS</Text>
                  </View>
                </View>

                <View style = {{ flexDirection: 'column',justifyContent: 'center'}}>
                  <View style={{ backgroundColor: palette.LIGHT_BLUE, flexDirection: 'row', paddingBottom:20 }}>
                    <View style={{ flex: 1, flexDirection: 'row',justifyContent: 'center'}}>
                        <Image style={{ marginTop:10, width: 220, height:400 }} source={tourMerchantServices} />
                    </View>
                  </View>
                  <View style={{ flex: .3}}>
                    <Text style={{ marginTop: 20, marginBottom:10, marginLeft: 10, marginRight: 10, color: palette.WHITE, fontSize:17, textAlign: 'center' }}>
                      When app users need auto services they simply log in and select the service(s) needed.
                    </Text>
                  </View>
                </View>

                <View style = {{ flexDirection: 'column',justifyContent: 'center'}}>
                  <View style={{ backgroundColor: palette.LIGHT_BLUE, flexDirection: 'row', paddingBottom:20 }}>
                    <View style={{ flex: 1, flexDirection: 'row',justifyContent: 'center'}}>
                        <Image style={{ marginTop:10, width: 220, height:400 }} source={tourComment} />
                    </View>
                  </View>
                  <View style={{ flex: .3}}>
                    <Text style={{ marginTop: 20, marginBottom:10, marginLeft: 10, marginRight: 10,
                      color: palette.WHITE, fontSize:17, textAlign: 'center' }}>
                      Add additional information to help describe your service needs.
                    </Text>
                  </View>
                </View>

                <View style = {{ flexDirection: 'column',justifyContent: 'center'}}>
                  <View style={{ backgroundColor: palette.LIGHT_BLUE, flexDirection: 'row', paddingBottom:20 }}>
                    <View style={{ flex: 1, flexDirection: 'row',justifyContent: 'center'}}>
                        <Image style={{ marginTop:10, width: 220, height:400 }} source={serviceIntro} />
                    </View>
                  </View>
                  <View style={{ flex: .3}}>
                    <Text style={{ marginTop: 20, marginBottom:10, marginLeft: 10, marginRight: 10, color: palette.WHITE, fontSize:17, textAlign: 'center' }}>
                    Schedule appointments on the exact day and time that&#39;s convenient for you.</Text>
                  </View>
                </View>

                <View style = {{ flexDirection: 'column',justifyContent: 'center'}}>
                  <View style={{ backgroundColor: palette.LIGHT_BLUE, flexDirection: 'row', paddingBottom:20 }}>
                    <View style={{ flex: 1, flexDirection: 'row',justifyContent: 'center'}}>
                        <Image style={{ marginTop:10, width: 220, height:400 }} source={serviceProviderIntro} />
                    </View>
                  </View>
                  <View style={{ flex: .3}}>
                    <Text style={{ marginTop: 20, marginBottom:10, marginLeft: 10, marginRight: 10, color: palette.WHITE, fontSize:17, textAlign: 'center' }}>
                    Choose service providers based on ratings, availability or BEST OFFER!</Text>
                  </View>
                </View>

                <View style = {{ flexDirection: 'column',justifyContent: 'center'}}>
                  <View style={{ backgroundColor: palette.LIGHT_BLUE, flexDirection: 'row', paddingBottom:20 }}>
                    <View style={{ flex: 1, flexDirection: 'row',justifyContent: 'center'}}>
                        <Image style={{ marginTop:10, width: 220, height:400 }} source={tourRating} />
                    </View>
                  </View>
                  <View style={{ flex: .3}}>
                    <Text style={{ marginTop: 20, marginBottom:10, marginLeft: 10, marginRight: 10,
                      color: palette.WHITE, fontSize:17, textAlign: 'center' }}>
                      Once the job is complete you can rate your experience.
                    </Text>
                  </View>
                </View>

            </IndicatorViewPager>
        </View>

        <View style={{
          flex: .10,
          flexDirection: 'row',
          justifyContent: 'space-around',
          marginTop: 10,
          marginBottom: 20,
        }}>
        <View style={{ height:50, paddingLeft: 50, paddingRight: 50, borderWidth: 0.5, borderColor: palette.LIGHT_BLUE, backgroundColor: palette.DARK_BLUE,
        justifyContent: 'center',borderBottomLeftRadius: 10, borderBottomRightRadius: 10, borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
          <TouchableOpacity onPress={() => navigate('Login')}>
            <Text style={{ fontSize: 18, textAlign: 'center', color: palette.WHITE }}>
              Log In
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ height:50, paddingLeft: 50, paddingRight: 50, backgroundColor: palette.LIGHT_BLUE,
        justifyContent: 'center',borderBottomLeftRadius: 10, borderBottomRightRadius: 10, borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
          <TouchableOpacity onPress={() => navigate('RegisterMain')}>
            <Text style={{ fontSize: 18, textAlign: 'center', backgroundColor: palette.LIGHT_BLUE, color: palette.WHITE }}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
        </View>


      </View>
    );
  }
}

Intro.propTypes = {
  navigation: PropTypes.object.isRequired,
};

AppRegistry.registerComponent('Intro', () => Intro);
