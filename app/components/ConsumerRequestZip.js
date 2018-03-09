import React, { Component, PropTypes } from 'react';
import {
  AppRegistry,
  Text,
  TextInput,
  Platform,
  TouchableOpacity,
  View,
} from 'react-native';
import { HeaderBackButton } from 'react-navigation';
import renderIf from 'render-if';
import ExpandableList from 'react-native-expandable-section-list';
import { common, serviceRequest, formStyles } from '../style/style';
import { NavigationActions } from 'react-navigation';
import { ListView } from 'realm/react-native';
import format from 'string-format';
import constants from '../constants/c';
import realm from './realm';
import palette from '../style/palette';
import * as events from '../broadcast/events';



export default class ConsumerRequestZip extends Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    const { state } = this.props.navigation;
    this.state = {
      svcsRequested: state.params.svcsRequested,
      showSvcZipError: false,
    };
  }

  componentDidMount() {
    const { state } = this.props.navigation;
    this.state = {
      svcsRequested: state.params.svcsRequested,
    };
  }

  validateForm() {
    let formValid = true;

    // service zip
    if (this.state.zip === undefined || this.state.zip.length < 5) {
      this.setState({ showSvcZipError: true });
      formValid = false;
    } else {
      this.setState({ showSvcZipError: false });
    }

    return formValid;
  }

  gotoDate() {
    const { navigate } = this.props.navigation;
    if (this.validateForm()) {
      navigate('RequestServiceDate', { svcsRequested: this.state.svcsRequested, zip: this.state.zip });
    }
  }

  goBack() {
    const { goBack } = this.props.navigation;
    goBack();
  }

  submitRequest() {
    if (this.validateForm()) {
      const svcs = this.state.currentServices;
      let serviceChecked = false;
      const servicesCategoryMap = {};
      svcs.forEach((service) => {
        if (!servicesCategoryMap[service.name]) {
          // Create an entry in the map for the category if it hasn't yet been created
          servicesCategoryMap[service.name] = [];
        }

        service.services.forEach((s) => {
          if (s.checked) {
            servicesCategoryMap[service.name].push(s);
            serviceChecked = true;
          }
        });

        if (!serviceChecked) {
          delete servicesCategoryMap[service.name];
        }
        serviceChecked = false;
      });

      const r = [];
      Object.keys(servicesCategoryMap).forEach((key) => {
        const sv = servicesCategoryMap[key];
        sv.forEach((s) => {
          r.push(s);
        });
      });

      const { state } = this.props.navigation;
      const svcRequest = {
        user_id: this.getUserId(),
        service_date: new Date(this.state.date),
        service_zip: this.state.zip,
        make: state.params.vehicle.make,
        model: state.params.vehicle.model,
        year: parseInt(state.params.vehicle.year, 10),
        services: r,
      };

      // const { navigate } = this.props.navigation;
      const { goBack } = this.props.navigation;
      fetch(format('{}/api/consumer/service/request', constants.BASSE_URL), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: constants.API_KEY,
        },
        body: JSON.stringify(svcRequest),
      })
        .then(response => response.json())
        .then((responseData) => {
          svcRequest.service_id = responseData.service_request_id;

          // save request locally
          const rSvcRequest = {
            service_id: svcRequest.service_id,
            user_id: svcRequest.user_id,
            service_date: svcRequest.service_date,
            service_zip: svcRequest.service_zip,
            make: svcRequest.make,
            model: svcRequest.model,
            year: svcRequest.year,
          };
          realm.write(() => {
            realm.create('ServiceRequest', rSvcRequest);
          });

          //send service request events
          events.sendSvcRequestEvent(rSvcRequest);

          // reset services and categories
          const localSvc = realm.objects('Service');
          localSvc.forEach((s) => {
            realm.write(() => {
             s.checked = false;
            });
          });

          const resetAction = NavigationActions.reset({
            index: 0,
            actions: [
              NavigationActions.navigate({ routeName: 'consumerTab' }),
            ],
          });
          this.props.navigation.dispatch(resetAction);
        }).catch((error) => {
          console.log(error);
        })
        .done();
    }
  }







  render() {
    const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;
    const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : 0;
    const HEIGHT = APPBAR_HEIGHT + STATUSBAR_HEIGHT;
    return (

      <View style={common.consumerSvcRequestContainer}>

        <View
          style={{
            backgroundColor: palette.HEADER_BLUE,
            alignSelf: 'stretch',
            height: HEIGHT,
            flexDirection: 'row',
            justifyContent: 'space-between' }}
        >
          <HeaderBackButton tintColor={palette.WHITE} onPress={() => this.goBack()} />
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={common.headerTitle}>
              Request a New Service
            </Text>
          </View>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => this.gotoDate()} >
              <Text style={common.headerLeftButton}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ marginTop: 40 }}>
          <Text style={serviceRequest.title}>Where do you need services?</Text>
        </View>
        <View>
          <Text style={serviceRequest.subTitle}>Enter your zip code</Text>
        </View>
        {renderIf(this.state.showSvcZipError)(
          <View style={[common.center, { marginTop: 15 }]}>
            <Text style={formStyles.error}>Zip Field required (must be 5 digits)</Text>
          </View>
        )}
        <TextInput
          style={serviceRequest.textInput}
          underlineColorAndroid="rgba(0,0,0,0)"
          autoCorrect={false}
          keyboardType="numeric"
          maxLength={5}
          onChangeText={text => this.setState({ zip: text })}
        />
        <View style={serviceRequest.line} />
      </View>
    );
  }
}


ConsumerRequestZip.propTypes = {
  navigation: PropTypes.object.isRequired,
};

AppRegistry.registerComponent('ConsumerRequestZip', () => ConsumerRequestZip);
