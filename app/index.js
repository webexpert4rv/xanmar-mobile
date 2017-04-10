import { StackNavigator } from 'react-navigation';
import splash from './components/Splash';
import registerMain from './components/registerMain';
import registerConsumer from './components/registerConsumer';
import registerAutoService from './components/registerMechanic';
import registerServicesOffered from './components/RegisterServices';
import registerVehicle from './components/RegisterVehicle';
import main from './components/MainComponent';

const userNavigator = StackNavigator({
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
  ConsumerRegister: { screen: registerConsumer },
  AutoServiceRegister: { screen: registerAutoService },
  RegisterServicesOffered: { screen: registerServicesOffered },
  RegisterVehicle: { screen: registerVehicle },
  userNavigator: { screen: userNavigator },
});

const AppNavigator = StackNavigator({
  Splash: { screen: splash },
  OnBoardingNavigator: { screen: OnBoardingNavigator },
  userNavigator: { screen: userNavigator },
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
