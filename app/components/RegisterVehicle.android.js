import React, { Component, PropTypes } from 'react';
import { AppRegistry,
        View,
        Picker,
        Text, TextInput,
        TouchableOpacity } from 'react-native';
import { NavigationActions } from 'react-navigation';
import renderIf from 'render-if';
import format from 'string-format';
import { formStyles, onboardingStyles, common } from '../style/style';
import constants from '../constants/c';
import realm from './realm';
import palette from '../style/palette';

export default class RegisterVehicle extends Component {
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
      headerRight: (
        <View>
          <TouchableOpacity onPress={() => params.handleDone()}>
            <Text style={onboardingStyles.headerButton}>Done</Text>
          </TouchableOpacity>
        </View>),
    };
  };

  constructor(props) {
    super(props);
    const { state } = this.props.navigation;
    this.state = {
      userId: state.params.userId,
      onBoarding: state.params.onBoarding,
      showMakePicker: false,
      showModelPicker: false,
      make: 'Not Set',
      model: 'Not Set',
      vehicles: [],
      models: [],
      showYearError: false,
      showMakeError: false,
      showModelError: false,
    };
  }

  componentDidMount() {
    this.fetchVehicles();
    this.props.navigation.setParams({ handleDone: this.registerVehicle.bind(this) });
  }

  fetchVehicles() {
    fetch(format('{}/api/vehicles', constants.BASSE_URL), {
      headers: {
        Authorization: constants.API_KEY,
      },
    })
      .then(response => response.json())
      .then((responseData) => {
        this.setState({
          isLoading: !this.state.isLoading,
          vehicles: responseData.vehicles,
        });
      })
      .done();
  }

  goBack() {
    const { goBack } = this.props.navigation;
    goBack();
  }

  validateForm() {
    let formValid = true;

    const re = /^(19|20)\d{2}$/;
    const validYear = re.test(this.state.vehicleYear);
    if (validYear) {
      this.setState({ showYearError: false });
    } else {
      this.setState({ yearError: 'Must be valid year (1900 - 2099)', showYearError: true });
      formValid = false;
    }

    if (this.state.make === 'Not Set') {
      this.setState({ showMakeError: true });
      formValid = false;
    } else {
      this.setState({ showMakeError: false });
    }

    if (this.state.model === 'Not Set') {
      this.setState({ showModelError: true });
      formValid = false;
    } else {
      this.setState({ showModelError: false });
    }
    return formValid;
  }

  registerVehicle() {
    if (this.validateForm()) {
      fetch(format('{}/api/user/vehicle', constants.BASSE_URL), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: constants.API_KEY,
        },
        body: JSON.stringify({
          user_id: this.state.userId,
          make: this.state.make,
          model: this.state.model,
          year: this.state.vehicleYear,
        }),
      })
        .then(response => response.json())
        .then((responseData) => {

          realm.write(() => {
            realm.create('Vehicle',
            { vehicleId: responseData.vehicle_id, make: this.state.make, model: this.state.model, year: this.state.vehicleYear });
          });

          if (this.state.onBoarding) {
            //store first vehicle as current by default
            realm.write(() => {
              realm.create('CurrentVehicle',
              { vehicleId: responseData.vehicle_id, make: this.state.make, model: this.state.model, year: this.state.vehicleYear });
            });

  {}        const resetAction = NavigationActions.reset({
              index: 0,
              actions: [
                NavigationActions.navigate({ routeName: 'consumerTab' }),
              ],
            });
            this.props.navigation.dispatch(resetAction);
          } else {
            this.goBack();
          }
        })
        .done();
    }
  }

  render() {
    return (
      <View style={onboardingStyles.mainContainer}>
        <View>
          <Text style={onboardingStyles.title}>Tell us about your vehicle</Text>
        </View>
        <View style={{ flexDirection: 'column', alignItems: 'flex-start', marginTop: 20, marginLeft: 20 }}>
          {renderIf(this.state.showMakeError)(
            <Text style={formStyles.error}>Field required.</Text>,
          )}
          <View style={{ flexDirection: 'row', height: 50 }}>
            <View style={{ width: 100, marginTop: 10, flex: 0.2 }}>
              <Text style={onboardingStyles.label}>Make:</Text>
            </View>
            <View style={{ width: 100, height: 50, flex: 0.8, borderWidth: 0 }}>
              <TextInput
                style={onboardingStyles.textInput}
                underlineColorAndroid="rgba(0,0,0,0)"
                autoCorrect={false}
                value={this.state.make}
                onChangeText={text => this.setState({ make: text })}
              />
              <Picker
                style={{ position: 'absolute', top: 0, width: 500, height: 500 }}
                selectedValue={this.state.make}
                onValueChange={(itemValue, itemIndex) =>
                  this.setState({ make: itemValue.make, models: itemValue.models })}
              >
                {this.state.vehicles.map((l, i) => {
                  return (
                    <Picker.Item value={l} label={l.make} key={i} />
                  );
                })}
              </Picker>
            </View>
          </View>
          <View style={onboardingStyles.line} />
          {renderIf(this.state.showModelError)(
            <Text style={formStyles.error}>Field required.</Text>,
          )}
          <View style={{ flexDirection: 'row', height: 50 }}>
            <View style={{ width: 100, marginTop: 10, flex: 0.2 }}>
              <Text style={onboardingStyles.label}>Model:</Text>
            </View>
            <View style={{ width: 100, height: 50, flex: 0.8, borderWidth: 0 }}>
              <TextInput
                style={onboardingStyles.textInput}
                underlineColorAndroid="rgba(0,0,0,0)"
                autoCorrect={false}
                value={this.state.model}
                onChangeText={text => this.setState({ model: text })}
              />
              <Picker
                style={{ position: 'absolute', top: 0, width: 1000, height: 1000 }}
                selectedValue={this.state.model}
                onValueChange={(itemValue, itemIndex) => this.setState({model: itemValue})}>
                {this.state.models.map((l, i) => {
                  return (
                    <Picker.Item value={l} label={l} key={i} />
                  );
                })}
              </Picker>
            </View>
          </View>
          <View style={onboardingStyles.line} />
          {renderIf(this.state.showYearError)(
            <Text style={formStyles.error}>{this.state.yearError}</Text>,
          )}
          <View style={{ flexDirection: 'row', height: 50 }}>
            <View style={{ width: 100, marginTop: 10, flex: 0.2 }}>
              <Text style={onboardingStyles.label}>Year:</Text>
            </View>
            <View style={{ width: 100, height: 50, flex: 0.8 }}>
              <TextInput
                keyboardType="numeric"
                returnKeyType="done"
                maxLength={4}
                placeholder="Not Set"
                placeholderTextColor={palette.WHITE}
                style={onboardingStyles.textInput}
                underlineColorAndroid="rgba(0,0,0,0)"
                autoCorrect={false}
                onChangeText={text => this.setState({ vehicleYear: text })}
              />
            </View>
          </View>
          <View style={onboardingStyles.line} />
        </View>
      </View>
    );
  }
}

RegisterVehicle.propTypes = {
  navigation: PropTypes.object.isRequired,
};

AppRegistry.registerComponent('RegisterVehicle', () => RegisterVehicle);
