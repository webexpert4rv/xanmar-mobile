import React, { Component, PropTypes } from 'react';
import { Alert,
  AppRegistry,
  Text,
  Platform,
  TouchableOpacity,
  View,
} from 'react-native';
import { ListView } from 'realm/react-native';
import format from 'string-format';
import { HeaderBackButton, NavigationActions } from 'react-navigation';
import ExpandableList from 'react-native-expandable-section-list';
import { common } from '../style/style';
import constants from '../constants/c';
import realm from './realm';
import palette from '../style/palette';
import * as events from '../broadcast/events';
import ServiceListItem from './ServiceListItem';
import ServiceListSectionItem from './ServiceListSectionItem';

export default class ConsumerRequestService extends Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    this._onServicePickCompleted = this._onServicePickCompleted.bind(this);
    this._onCompletedChange = this._onCompletedChange.bind(this);
    this._onSectionClick = this._onSectionClick.bind(this);

    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
      sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
    });
    this.state = {
      dataSource: [],
      showServicePicker: false,
      servicesPicked: [],
      currentServices: [],
      showSvcDateError: false,
      showSvcListError: false,
      showSvcZipError: false,


      selectedServices: {},
      openSections: [0, 1, 2, 3, 4, 5, 6],
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  gotoZip() {
    if (this.validateForm()) {
      const { navigate } = this.props.navigation;
      navigate('RequestServiceZip', { svcsRequested: this.state.selectedServices });
    } else {
      Alert.alert(
        'Error',
        'You must select at least one services.',
        [
          { text: 'OK' },
        ],
        { cancelable: false }
      );
    }
  }

  goBack() {
    const { goBack } = this.props.navigation;
    goBack();
  }
  validateForm() {
    let formValid = false;

    //service list
    const sc = realm.objects('ServiceCategory');
    for (var serviceCat of sc.values()) {
      for (var svc of serviceCat.services.values()) {
        if (svc.checked) {
          formValid = true;
          break;
        }
      }
      if (formValid) {
        break
      }
    }

    return formValid;
  }

  _onServicePickCompleted(svcs) {
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
        delete servicesCategoryMap[service.name]
      }
    });

    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
      sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
    });
    this.setState({
      dataSource: ds.cloneWithRowsAndSections(servicesCategoryMap),
      currentServices: svcs,
    });
  }

  fetchData() {
    const sc = realm.objects('ServiceCategory');
    const dd = [];
    sc.forEach((service) => {
      dd.push({ category: {
        category_id: service.category_id,
        name: service.name,
        checked: service.checked },
        svc: service.services });
    });

    this.setState({
      dataSource: dd,
      currentServices: sc,
    });
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

  _onCompletedChange(item) {
    if (item.checked) {
      this.state.selectedServices[item.service_id] = item;
    } else {
      delete this.state.selectedServices[item.service_id];
    }
  }

  _onSectionClick(item) {
    // update database for all checked services
    let allServicesChecked;
    const services = realm.objects('ServiceCategory');
    const exactCat = services.filtered(format('category_id == {}', item.category_id));

    if (item.checked) {
      allServicesChecked = true;
    } else {
      allServicesChecked = false;
    }

    exactCat[0].services.forEach((s) => {
      realm.write(() => {
        s.checked = allServicesChecked;
      });
    });

    this.fetchData();
  }

    _renderRow = (rowItem, rowId, sectionId) => (
      <TouchableOpacity key={rowId} onPress={() => {}}>
        <ServiceListItem key={rowId} data={rowItem} onCompletedChange={this._onCompletedChange} />
      </TouchableOpacity>
  );

  _renderSection = (section, sectionId) => {
    return (
      <ServiceListSectionItem svcs="ServiceCategory" key={sectionId} data={section} onCompletedChange={this._onSectionClick} />
    );
  };

  render() {
    const { state } = this.props.navigation;
    const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;
    const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : 0;
    const HEIGHT = APPBAR_HEIGHT + STATUSBAR_HEIGHT;
    return (

      <View style={common.consumerContainer}>

        <View
          style={{ flex: 0.10,
            backgroundColor: palette.HEADER_BLUE,
            alignSelf: 'stretch',
            height: HEIGHT,
            flexDirection: 'row',
            justifyContent: 'space-between' }}
        >
          <HeaderBackButton tintColor={palette.WHITE} onPress={() => this.goBack()} />
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={common.headerTitle}>
              Select A new Service
            </Text>
          </View>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => this.gotoZip()} >
              <Text style={common.headerLeftButton}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ExpandableList
          style={{ flex: 0.90 }}
          dataSource={this.state.dataSource}
          headerKey="category"
          memberKey="svc"
          renderRow={this._renderRow}
          renderSectionHeaderX={this._renderSection}
          openOptions={this.state.openSections}
        />
      </View>
    );
  }
}

ConsumerRequestService.propTypes = {
  navigation: PropTypes.object.isRequired,
};

AppRegistry.registerComponent('ConsumerRequestService', () => ConsumerRequestService);
