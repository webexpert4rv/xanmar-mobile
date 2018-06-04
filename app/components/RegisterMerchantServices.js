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
import ServiceListItem from './ServiceListItem';
import ServiceListSectionItem from './ServiceListSectionItem';
import * as NetworkUtils from '../utils/networkUtils';

export default class RegisterMerchantServices extends Component {
  static navigationOptions = {
    header: null,
  };

  static getUserId() {
    let uId = 0;
    const userPrefs = realm.objects('UserPreference');
    if (userPrefs.length > 0) {
      uId = userPrefs[0].userId;
    }
    return uId;
  }

  constructor(props) {
    super(props);
    this._onServicePickCompleted = this._onServicePickCompleted.bind(this);
    this._onCompletedChange = this._onCompletedChange.bind(this);
    this._onSectionClick = this._onSectionClick.bind(this);

    this.state = {
      dataSource: [],
      currentServices: [],
      showSvcListError: false,
      selectedServices: {},
      openSections: [],
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  submitServices() {
    const userPrefs = realm.objects('UserPreference');
    let serviceProviderId;
    if (userPrefs.length > 0) {
      serviceProviderId = userPrefs[0].userId;
    }

    const r = [];
    const svcs = realm.objects('ServiceCategory');
    for (var serviceCat of svcs.values()) {
      for (var svc of serviceCat.services.values()) {
        if (svc.checked) {
          r.push(svc);
        }
      }
    }

    const mySvcs = {
      service_provider_id: serviceProviderId,
      services: r,
    };

    fetch(format('{}/api/provider/services', constants.BASSE_URL), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: constants.API_KEY,
      },
      body: JSON.stringify(mySvcs),
    })
    .then(response => {

      if (response.ok) {
        return response.json()
      } else {
        throw Error(response.statusText)
      }
    })
      .then((responseData) => {

        //const cccc = realm.objects('MerchantServices');

        // realm.write(() => {
        //   svcs.forEach((s) => {
        //     realm.create('MerchantServices', s);
        //   });
        // });

        const { navigate } = this.props.navigation;
        navigate('MerchantPymt',{ fromProfile: false });

      }).catch((error) => {
        console.log(error);
      }).catch(error => NetworkUtils.showNetworkError('Unable to submit services'));
  }

  finishSignUp() {
    if (this.validateForm()) {
      this.submitServices();
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
        <ServiceListItem
          key={rowId}
          data={rowItem}
          textColor={palette.WHITE}
          lineColor={palette.LIGHT_BLUE}
          iconColor={palette.LIGHT_BLUE}
          onCompletedChange={this._onCompletedChange} />
      </TouchableOpacity>
  );

  _renderSection = (section, sectionId) => {
    return (
      <ServiceListSectionItem
        svcs="ServiceCategory"
        key={sectionId} data={section}
        textColor={palette.WHITE}
        lineColor={palette.LIGHT_BLUE}
        iconColor={palette.LIGHT_BLUE}
        onCompletedChange={this._onSectionClick} />
    );
  };

  render() {
    const { state } = this.props.navigation;
    const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;
    const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : 0;
    const HEIGHT = APPBAR_HEIGHT + STATUSBAR_HEIGHT;
    return (

      <View style={common.merchantContainer}>

        <View
          style={{ flex: 0.10,
            backgroundColor: palette.MERCHANT_HEADER_COLOR,
            alignSelf: 'stretch',
            height: HEIGHT,
            flexDirection: 'row',
            justifyContent: 'space-between' }}
        >
          <View style={{ marginLeft: 10, justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => this.goBack()} >
              <Text style={common.headerLeftButton}>Cancel</Text>
            </TouchableOpacity>
          </View>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => this.finishSignUp()} >
              <Text style={common.headerLeftButton}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: palette.MERCHANT_HEADER_COLOR, height: 60 }}>
          <Text style={common.headerTitle}>
            What services do you provide?
          </Text>
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

RegisterMerchantServices.propTypes = {
  navigation: PropTypes.object.isRequired,
};

AppRegistry.registerComponent('RegisterMerchantServices', () => RegisterMerchantServices);
