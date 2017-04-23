import { StackNavigator } from 'react-navigation';
import splash from './components/Splash';
import registerMain from './components/registerMain';
import registerConsumer from './components/registerConsumer';
import registerMerchant from './components/registerMerchant';
import registerServicesOffered from './components/RegisterServices';
import registerVehicle from './components/RegisterVehicle';
import main from './components/MainComponent';
import requestService from './components/requestService';
import services from './components/services';

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

const OnBoardingNavigator = StackNavigator({
  RegisterMain: { screen: registerMain },
  consumerRegister: { screen: registerConsumer },
  merchantRegister: { screen: registerMerchant },
  RegisterServicesOffered: { screen: registerServicesOffered },
  userNav: { screen: userNavigatorForOnBoarding },
  RegisterVehicle: { screen: registerVehicle },
  svcs: { screen: services },
},
  {
    initialRouteName: 'RegisterMain',
    headerMode: 'screen',
  },
);

const AppNavigator = StackNavigator({
  Splash: { screen: splash },
  userNavigator: { screen: userNavigator },
  OnBoardingNavigator: { screen: OnBoardingNavigator },

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
