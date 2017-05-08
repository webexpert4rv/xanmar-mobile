import { StackNavigator, TabNavigator } from 'react-navigation';
import splash from './components/Splash';
import registerMain from './components/registerMain';
import registerConsumer from './components/registerConsumer';
import registerMerchant from './components/registerMerchant';
import registerServicesOffered from './components/RegisterServices';
import registerVehicle from './components/RegisterVehicle';
import main from './components/MainComponent';
import requestService from './components/requestService';
import services from './components/services';

import vehicles from './components/ConsumerVehicles';
import consumerSvcHistory from './components/ConsumerSvcHistory';
import consumerProfile from './components/ConsumerProfile';
import consumerRequestSvc from './components/ConsumerRequestService';

import merchantJobs from './components/MerchantJobs';
import merchantSvcs from './components/MerchantServices';
import merchantProfile from './components/MerchantProfile';
import palette from './style/palette';

//  just dumb, hack for issue
//  https://github.com/react-community/react-navigation/issues/199
const userNavigator = StackNavigator({
  Main: { screen: main },
  RegisterServicesOffered: { screen: registerServicesOffered },
  RequestService: { screen: requestService },
  RegisterVehicle: { screen: registerVehicle },

},
  {
    initialRouteName: 'Main',
  },
);

const consumerNavigator = TabNavigator({
  Vehicles: { screen: vehicles },
  SvcHistory: { screen: consumerSvcHistory },
  Profile: { screen: consumerProfile },
}, { tabBarOptions: {
  activeTintColor: palette.WHITE,
  inactiveTintColor: palette.WHITE,
  labelStyle: {
    fontSize: 15,
  },
  style: {
    backgroundColor: palette.PRIMARY_COLOR, // Main color
  },
},
},
);


const consumerNavigatorMain = StackNavigator({
  consumerTab: { screen: consumerNavigator },
  RegisterVehicle: { screen: registerVehicle },
  RequestService: { screen: consumerRequestSvc },
}, {
  headerMode: 'screen',
},
);


const consumerNavigatorForOnBoarding = StackNavigator({
  consumerTab: { screen: consumerNavigator },
  RegisterVehicle: { screen: registerVehicle },
  RequestService: { screen: consumerRequestSvc },
},
  {
    headerMode: 'screen',
  },
);

const merchantNavigator = TabNavigator({
  Jobs: { screen: merchantJobs },
  Services: { screen: merchantSvcs },
  Profile: { screen: merchantProfile },
},
  { tabBarOptions: {
    activeTintColor: palette.WHITE,
    inactiveTintColor: palette.WHITE,
    labelStyle: {
      fontSize: 15,
    },
    style: {
      backgroundColor: palette.PRIMARY_COLOR_DARK, // Main color
    },
  },
  },
);

const merchantNavigatorForOnBoarding = TabNavigator({
  Jobs: { screen: merchantJobs },
  Services: { screen: merchantSvcs },
  Profile: { screen: merchantProfile },
},
  {
    headerMode: 'screen',
  },
  { tabBarOptions: {
    activeTintColor: palette.WHITE,
    inactiveTintColor: palette.WHITE,
    labelStyle: {
      fontSize: 15,
    },
    style: {
      backgroundColor: palette.PRIMARY_COLOR_DARK, // Main color
    },
  },
  },
);

const userNavigatorForOnBoarding = StackNavigator({
  Main: { screen: main },
  RegisterServicesOffered: { screen: registerServicesOffered },
  RegisterVehicle: { screen: registerVehicle },
},
  {
    initialRouteName: 'Main',
    headerMode: 'none',
  },
);

const onBoardingNavigator = StackNavigator({
  RegisterMain: { screen: registerMain },
  consumerRegister: { screen: registerConsumer },
  merchantRegister: { screen: registerMerchant },
  RegisterServicesOffered: { screen: registerServicesOffered },
  consumerTab: { screen: consumerNavigator },
  merchantNav: { screen: merchantNavigator },
  RegisterVehicle: { screen: registerVehicle },
  svcs: { screen: services },
  merchantSvcs: { screen: merchantSvcs },
  RequestService: { screen: consumerRequestSvc },
},
  {
    initialRouteName: 'RegisterMain',
    headerMode: 'screen',
  },
);

const AppNavigator = StackNavigator({
  Splash: { screen: splash },
  userNavigator: { screen: userNavigator },
  OnBoardingNavigator: { screen: onBoardingNavigator },
  // consumerNavigator: { screen: consumerNavigator },
  merchantNavigator: { screen: merchantNavigator },
  consumerNavigatorMain: { screen: consumerNavigatorMain },
},
  {
    initialRouteName: 'Splash',
    headerMode: 'none',
  },
);

// class xanmar extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {};
//   }
//
//   render() {
//     const { nav } = this.props.navigation;
//     return (
//       <View>
//         <Button
//           onPress={() => nav.navigate('First')}
//           title="Go to next screen"
//         />
//       </View>
//     )
//   }
// }
//
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center'
//   }
// });

export default AppNavigator;
