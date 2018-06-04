import React, { Component } from 'react';
import { StackNavigator, TabNavigator } from 'react-navigation';
import { StyleSheet } from 'react-native';
import splash from './components/Splash';

import intro from './components/Intro';
import login from './components/Login';
import registerMain from './components/registerMain';
import registerConsumer from './components/RegisterConsumer';
import registerMerchantBusiness from './components/RegisterMerchantBusiness';
import registerMerchantContactInfo from './components/RegisterMerchantContactInfo';
import registerServicesOffered from './components/RegisterMerchantServices';
import registerVehicle from './components/RegisterVehicle';
import services from './components/services';

import profile from './components/Profile';
import vehicles from './components/ConsumerVehicles';
import consumerSvcHistory from './components/ConsumerSvcHistory';
import consumerProfile from './components/ConsumerProfile';
import consumerRequestSvc from './components/ConsumerRequestService';
import consumerRequestSvcZip from './components/ConsumerRequestZip';
import consumerRequestSvcDate from './components/ConsumerRequestDate';
import consumerRequestSvcComment from './components/ConsumerRequestComment';
import consumerRequestSvcPhoto from './components/ConsumerRequestPhoto';
import consumerSvcRequestDetail from './components/ConsumerSvcRequestDetail';
import consumerSvcRequestBids from './components/ConsumerSvcRequestBids';
import consumerSvcRequestBidDetails from './components/ConsumerSvcRequestBidDetails';
import consumerSvcRequestSummary from './components/ConsumerSvcRequestSummary';

import merchantJobs from './components/MerchantJobs';
import merchantJobDetail from './components/MerchantJobDetail';
import merchantActiveBid from './components/MerchantActiveBid';
import merchantBids from './components/MerchantBids';
import merchantSvcs from './components/MerchantServices';
import merchantProfile from './components/MerchantProfile';
import merchantReviews from './components/MerchantReviews';
import merchantMap from './components/MerchantMap';
import merchantPymt from './components/MerchantPayment';
import palette from './style/palette';

//  just dumb, hack for issue
//  https://github.com/react-community/react-navigation/issues/199
// const userNavigator = StackNavigator({
//   Main: { screen: main },
//   RegisterServicesOffered: { screen: registerServicesOffered },
//   RequestService: { screen: requestService },
//   RegisterVehicle: { screen: registerVehicle },
//
// },
//   {
//     initialRouteName: 'Main',
//   },
// );

// console.log(JSON.stringify(this.state.job));

const consumerNavigator = TabNavigator(
  {
    Vehicles: { screen: vehicles },
    SvcHistory: { screen: consumerSvcHistory },
    Profile: { screen: profile },
  },
  { tabBarOptions: {
    activeTintColor: palette.TAB_ACTIVE_COLOR,
    inactiveTintColor: palette.TAB_INACTIVE_COLOR,
    labelStyle: {
      fontSize: 13,
    },
    style: {
      backgroundColor: palette.WHITE, // Main color
      borderTopColor: palette.GRAY,
      borderTopWidth: StyleSheet.hairlineWidth,
    },
    indicatorStyle: {
      backgroundColor: 'transparent',
    },
    showIcon: true,
    iconStyle: { height: 30, width: 80 },
  },
    tabBarPosition: 'bottom',
  },
);

const consumerNavigatorMain = StackNavigator({
  consumerTab: { screen: consumerNavigator },
  RegisterVehicle: { screen: registerVehicle },
  RequestService: { screen: consumerRequestSvc },
  RequestServiceZip: { screen: consumerRequestSvcZip },
  RequestServiceDate: { screen: consumerRequestSvcDate },
  RequestServiceComment: { screen: consumerRequestSvcComment },
  RequestServicePhoto: { screen: consumerRequestSvcPhoto },
  ConsumerSvcRequestDetail: { screen: consumerSvcRequestDetail },
  ConsumerSvcRequestBids: { screen: consumerSvcRequestBids },
  ConsumerSvcRequestBidDetails: { screen: consumerSvcRequestBidDetails },
  ConsumerSvcRequestSummary: { screen: consumerSvcRequestSummary },
  ConsumerProfile: { screen: consumerProfile },
  MerchantReviews: { screen: merchantReviews },
  MerchantMap: { screen: merchantMap },
  Login: { screen: login },
  }, {
    headerMode: 'screen',
  },
);

const merchantNavigator = TabNavigator({
  Jobs: { screen: merchantJobs },
  Bids: { screen: merchantBids },
  Profile: { screen: profile },
},
  { tabBarOptions: {
    activeTintColor: palette.TAB_ACTIVE_COLOR,
    inactiveTintColor: palette.TAB_INACTIVE_COLOR,
    labelStyle: {
      fontSize: 13,
    },
    style: {
      backgroundColor: palette.WHITE, // Main color
      borderTopColor: palette.GRAY,
      borderTopWidth: StyleSheet.hairlineWidth,
    },
    indicatorStyle: {
      backgroundColor: 'transparent',
    },
    showIcon: true,
    iconStyle: { height: 30, width: 80 },
  },
    tabBarPosition: 'bottom',
  },
);

const merchantNavigatorMain = StackNavigator({
  merchantTab: { screen: merchantNavigator },
  Services: { screen: merchantSvcs },
  JobDetails: { screen: merchantJobDetail },
  ActiveBid: { screen: merchantActiveBid },
  MerchantProfile: { screen: merchantProfile },
  MerchantPymt: { screen: merchantPymt },
  Login: { screen: login },
}, {
  headerMode: 'screen',
},
);

const onBoardingNavigator = StackNavigator({
  Intro: { screen: intro },
  Login: { screen: login },
  RegisterMain: { screen: registerMain },
  consumerRegister: { screen: registerConsumer },
  MerchantRegisterBusiness: { screen: registerMerchantBusiness },
  MerchantRegisterContactInfo: { screen: registerMerchantContactInfo },
  RegisterServicesOffered: { screen: registerServicesOffered },
  MerchantPymt: { screen: merchantPymt },
  consumerTab: { screen: consumerNavigator },
  merchantTab: { screen: merchantNavigator },
  RegisterVehicle: { screen: registerVehicle },
  svcs: { screen: services },
  merchantSvcs: { screen: merchantSvcs },
  RequestService: { screen: consumerRequestSvc },
  RequestServiceZip: { screen: consumerRequestSvcZip },
  RequestServiceDate: { screen: consumerRequestSvcDate },
  RequestServiceComment: { screen: consumerRequestSvcComment },
  RequestServicePhoto: { screen: consumerRequestSvcPhoto },
  JobDetails: { screen: merchantJobDetail },
  ActiveBid: { screen: merchantActiveBid },
  ConsumerSvcRequestDetail: { screen: consumerSvcRequestDetail },
  ConsumerSvcRequestBids: { screen: consumerSvcRequestBids },
  ConsumerSvcRequestBidDetails: { screen: consumerSvcRequestBidDetails },
  ConsumerSvcRequestSummary: { screen: consumerSvcRequestSummary },
},
  {
    initialRouteName: 'Intro',
    headerMode: 'screen',
  },
);

const AppNavigator = StackNavigator({
  Splash: { screen: splash },
  OnBoardingNavigator: { screen: onBoardingNavigator },
  merchantNavigatorMain: { screen: merchantNavigatorMain },
  consumerNavigatorMain: { screen: consumerNavigatorMain },
    MerchantPymt: { screen: merchantPymt },
},
  {
    initialRouteName: 'Splash',
    headerMode: 'none',
  },
);

export default class App extends React.Component {
  render() {
    return (
      <AppNavigator />
    );
  }
}

//export default AppNavigator;
