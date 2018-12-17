import React, { Component, PropTypes } from 'react';
import {
  AppRegistry,
  Text,
  TextInput,
  Platform,
  TouchableOpacity,
  View,
} from 'react-native';
import format from 'string-format';
import { HeaderBackButton, NavigationActions } from 'react-navigation';
import { common, serviceRequest } from '../style/style';
import constants from '../constants/c';
import realm from './realm';
import palette from '../style/palette';
import * as events from '../broadcast/events';
import * as NetworkUtils from '../utils/networkUtils';
import {
  AdMobInterstitial,
} from 'react-native-admob'
import {trackWithProperties, trackableEvents} from '../utils/analytics'
export default class ConsumerRequestComment extends Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    const { state } = this.props.navigation;
    this.state = {
      zip: state.params.zip,
      svcDate: state.params.svcDate,
      photo: state.params.photo,
      comment: '',
    };
  }

  componentWillUnmount() {
    AdMobInterstitial.removeAllListeners();
  }

  componentDidMount() {
    this.prepareAd();
  }

  prepareAd(){
    AdMobInterstitial.setAdUnitID(constants.AD_UNIT_ID);
    AdMobInterstitial.setTestDevices([AdMobInterstitial.simulatorId]);
    AdMobInterstitial.addEventListener('adLoaded',
      () => console.log('AdMobInterstitial adLoaded')
    );
    AdMobInterstitial.addEventListener('adFailedToLoad',
      (error) => console.warn(error)
    );
    AdMobInterstitial.addEventListener('adOpened',
      () => console.log('AdMobInterstitial => adOpened')
    );
    AdMobInterstitial.addEventListener('adClosed',
      () => {
        console.log('AdMobInterstitial => adClosed');
        AdMobInterstitial.requestAd().catch(error => console.warn(error));
      }
    );
    AdMobInterstitial.addEventListener('adLeftApplication',
      () => console.log('AdMobInterstitial => adLeftApplication')
    );

    AdMobInterstitial.requestAd().catch(error => console.warn(error));
  }

  showAd(){
    // Display an interstitial
    AdMobInterstitial.showAd().catch(error => console.warn(error));
  }

  goBack() {
    const { goBack } = this.props.navigation;
    goBack();
  }

  getCurrentVechicle() {
    const currentVechicle = realm.objects('CurrentVehicle');
    const vehicleId = currentVechicle[0].vehicleId;
    const make = currentVechicle[0].make;
    const model = currentVechicle[0].model;
    const year = currentVechicle[0].year;
    return { vehicleId, make, model, year };
  }

  getUserId() {
    let uId = 0;
    const userPrefs = realm.objects('UserPreference');
    if (userPrefs.length > 0) {
      uId = userPrefs[0].userId;
    }
    return uId;
  }

  submitRequest() {
    const r = [];
    const sc = realm.objects('ServiceCategory');
    for (var serviceCat of sc.values()) {
      for (var svc of serviceCat.services.values()) {
        if (svc.checked) {
          r.push(svc);
        }
      }
    }

    const currentVehicle = this.getCurrentVechicle();

    const svcRequest = {
      user_id: this.getUserId(),
      vehicle_id: currentVehicle.vehicleId,
      service_date: new Date(this.state.svcDate),
      service_zip: this.state.zip,
      make: currentVehicle.make,
      model: currentVehicle.model,
      year: parseInt(currentVehicle.year, 10),
      comment: this.state.comment,
      status: 'new',
      photo_data: this.state.photo,
      services: r,
    };

    const data = new FormData();
    data.append('user_id', this.getUserId());
    data.append('vehicle_id', currentVehicle.vehicleId);
    data.append('service_date', this.state.svcDate);
    data.append('service_zip', this.state.zip);
    data.append('make', currentVehicle.make);
    data.append('model', currentVehicle.model);
    data.append('year', parseInt(currentVehicle.year, 10));
    data.append('comment', this.state.comment);
    data.append('status', 'new');
    data.append('services', JSON.stringify(r));
    if (this.state.photo != null) {
      data.append('svcPhoto', {
        uri: this.state.photo.uri,
        type: 'image/jpeg', // or photo.type
        name: 'testPhotoName.jpg'
      });
    }


    fetch(format('{}/api/consumer/service/request', constants.BASSE_URL), {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: constants.API_KEY,
      },
      //body: JSON.stringify(svcRequest),
      body: data,
    })
      .then(response => {
        if (response.ok) {
          return response.json()
        } else {
          throw Error(response.statusText)
        }
      })
      .then((responseData) => {
        svcRequest.service_request_id = responseData.service_request_id;
        // save request locally
        const rSvcRequest = {
          vehicle_id: svcRequest.vehicle_id,
          service_request_id: svcRequest.service_request_id,
          user_id: svcRequest.user_id,
          service_date: svcRequest.service_date,
          service_zip: svcRequest.service_zip,
          make: svcRequest.make,
          model: svcRequest.model,
          year: svcRequest.year,
          comment: svcRequest.comment,
          status: svcRequest.status,
          services: svcRequest.services
        };

        realm.write(() => {
          realm.create('ServiceRequest', rSvcRequest);
        });

        //send service request events
        events.sendSvcRequestEvent(rSvcRequest);

        const localSvc = realm.objects('ServiceCategory');
        for (var serviceCat of localSvc.values()) {
          realm.write(() => {
           serviceCat.checked = false;
           for (var svc of serviceCat.services.values()) {
             svc.checked = false;
           }
          });
        }
        trackWithProperties(
          trackableEvents.CONSUMER_SUBMIT_SERVICE_REQUEST, 
          {
            make: svcRequest.make,
            model: svcRequest.model,
            year: svcRequest.year,
            zip: this.state.zip,
            services: svcRequest.services,
            photoAdded: this.state.photo != null,
            commentAdded: this.state.comment > 0,

          }
        )
        this.showAd();
        const resetAction = NavigationActions.reset({
          index: 0,
          actions: [
            NavigationActions.navigate({ routeName: 'consumerTab' }),
          ],
        });
        this.props.navigation.dispatch(resetAction);
      }).catch(error => NetworkUtils.showNetworkError('Unable to submit service request.'));
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
              Add Comments
            </Text>
          </View>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => this.submitRequest()} >
              <Text style={common.headerLeftButton}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ marginTop: 40 }}>
          <Text style={serviceRequest.title}>Add comments to help</Text>
        </View>
        <View style={{ marginTop: 5 }}>
          <Text style={serviceRequest.title}>technician with the problem</Text>
        </View>
        <View>
          <Text style={serviceRequest.subTitle}>(Optional)</Text>
        </View>
        <View style={{ marginTop: 30 }}>
          <View style={common.center}>
            <TextInput
              style={{ fontSize:27, width: 300, height: 300, backgroundColor: palette.WHITE, padding:10 }}
              textAlignVertical={'top'}
              multiline
              numberOfLines={5}
              blurOnSubmit={false}
              editable
              onChangeText={(txt) => {
                this.setState({ comment: txt });
              }}
              value={this.state.comment}
              onSubmitEditing={() => {
                if (!this.state.comment.endsWith('\n')) {
                  let comment = this.state.comment;
                  comment = comment + "\n";
                  this.setState({ comment })
                }
              }}
            />
          </View>
        </View>
      </View>
    );
  }
}


ConsumerRequestComment.propTypes = {
  navigation: PropTypes.object.isRequired,
};

AppRegistry.registerComponent('ConsumerRequestComment', () => ConsumerRequestComment);
