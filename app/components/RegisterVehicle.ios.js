import React, { Component, PropTypes } from 'react';
import { ActivityIndicator, AppRegistry,
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
import * as NetworkUtils from '../utils/networkUtils';
import {trackWithProperties, trackableEvents} from '../utils/analytics'

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
      headerRight: params.isRegistering ? (
        <ActivityIndicator size="small" color={palette.LIGHT_BLUE} style={{ paddingRight: 20 }} />
      ) : (
        <View>
          <TouchableOpacity onPress={() => params.handleDone()}>
            <Text style={onboardingStyles.headerButton}>{params.rightHeaderText}</Text>
          </TouchableOpacity>
        </View>
      ),
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
      loading: true,
    };
  }

  componentDidMount() {
    this.fetchVehicles();
    this.props.navigation.setParams(
      { handleDone: this.registerVehicle.bind(this),
        isRegistering: false,
        rightHeaderText: ''  });
  }

  fetchVehicles() {
    fetch(format('{}/api/vehicles', constants.BASSE_URL), {
      headers: {
        Authorization: constants.API_KEY,
      },
    })
      .then(response => {
        if (response.ok) {
          return response.json()
        } else {
          throw Error(response.statusText)
        }
      })
      .then((responseData) => {
        this.setState({
          vehicles: responseData.vehicles,
          loading: false,
        });
        this.props.navigation.setParams(
          { handleDone: this.registerVehicle.bind(this),
            isRegistering: false,
            rightHeaderText: 'Done'  });
      }).catch(error => NetworkUtils.showNetworkError('Unable to get vehicles'));
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
      this.props.navigation.setParams({ isRegistering: true });
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
        .then(response => {
          if (response.ok) {
            return response.json()
          } else {
            throw Error(response.statusText)
          }
        })
        .then((responseData) => {
          realm.write(() => {
            realm.create('Vehicle',
            { vehicleId: responseData.vehicle_id, make: this.state.make, model: this.state.model, year: this.state.vehicleYear });
          });
          trackWithProperties(trackableEvents.VEHICLE_ADDED, {   make: this.state.make, model: this.state.model, year: this.state.vehicleYear})
          if (this.state.onBoarding) {

            realm.write(() => {
              realm.create('CurrentVehicle',
              { vehicleId: responseData.vehicle_id, make: this.state.make, model: this.state.model, year: this.state.vehicleYear });
            });

            const resetAction = NavigationActions.reset({
              index: 0,
              actions: [
                NavigationActions.navigate({ routeName: 'consumerTab' }),
              ],
            });
            this.props.navigation.dispatch(resetAction);
          } else {
            this.goBack();
          }
        }).catch(error => NetworkUtils.showNetworkError('Unable to register vehicles'));
    }
  }

  render() {
    return (
      <View style={onboardingStyles.mainContainer}>

        {renderIf(this.state.loading)(
          <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>
            <ActivityIndicator size="large" color={palette.LIGHT_BLUE} />
            <Text style={{ marginTop: 8, fontSize:20, color: palette.WHITE }}>Loading vechicles.</Text>
          </View>
        )}
        {renderIf(!this.state.loading)(
          <View>
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
              <TouchableOpacity style={{ flex: 0.8 }}
                onPress={() => this.setState({ showMakePicker: true, showModelPicker: false })}
              >
                <Text
                  style={[onboardingStyles.textInput, { paddingTop: 10 }]}
                  onChangeText={text => this.setState({ make: text })}
                >
                  {this.state.make}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={onboardingStyles.line} />
            {renderIf(this.state.showModelError)(
              <Text style={formStyles.error}>Field required.</Text>,
            )}
            <View style={{ flexDirection: 'row', height: 50 }}>
              <View style={{ width: 100, marginTop: 10, flex: 0.2 }}>
                <Text style={onboardingStyles.label}>Model:</Text>
              </View>
              <TouchableOpacity style={{ flex: 0.8 }}
                onPress={() => this.setState({ showModelPicker: true, showMakePicker: false })}
              >
                <Text
                  style={[onboardingStyles.textInput, { paddingTop: 10 }]}
                  onChangeText={text => this.setState({ model: text })}
                >
                  {this.state.model}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={onboardingStyles.line} />
            {renderIf(this.state.showYearError)(
              <Text style={formStyles.error}>{this.state.yearError}</Text>,
            )}
            <View style={{ flexDirection: 'row', height: 50 }}>
              <View style={{ width: 100, marginTop: 10, flex: 0.2 }}>
                <Text style={onboardingStyles.label}>Year:</Text>
              </View>
              <TextInput
                keyboardType="numeric"
                returnKeyType="done"
                maxLength={4}
                placeholder="Not Set"
                placeholderTextColor={palette.WHITE}
                style={[onboardingStyles.textInput, { height: 50, flex: 0.8 }]}
                underlineColorAndroid="rgba(0,0,0,0)"
                autoCorrect={false}
                onChangeText={text => this.setState({ vehicleYear: text })}
              />
            </View>
            <View style={onboardingStyles.line} />
          </View>

          {renderIf(this.state.showMakePicker)(
            <Picker
              style={{ backgroundColor: palette.WHITE,
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0 }}
              selectedValue={this.state.make}
              onValueChange={(itemValue, itemIndex) =>
                this.setState({ make: itemValue.make, models: itemValue.models, showMakePicker: false })}
            >
              {this.state.vehicles.map((l, i) => {
                return (
                  <Picker.Item value={l} label={l.make} key={i} />
                );
              })}
            </Picker>,
          )}
          {renderIf(this.state.showModelPicker)(
            <Picker
              style={{ backgroundColor: palette.WHITE,
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0 }}
              selectedValue={this.state.model}
              onValueChange={(itemValue, itemIndex) => this.setState({model: itemValue, showModelPicker: false})}>
              {this.state.models.map((l, i) => {
                return (
                  <Picker.Item value={l} label={l} key={i} />
                );
              })}
            </Picker>,
          )}
          </View>
        )}
      </View>
    );
  }
}

RegisterVehicle.propTypes = {
  navigation: PropTypes.object.isRequired,
};

AppRegistry.registerComponent('RegisterVehicle', () => RegisterVehicle);
