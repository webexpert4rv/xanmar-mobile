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
      .then(response => response.json())
      .then((responseData) => {
        realm.write(() => {
          svcs.forEach((s) => {
            realm.create('MerchantServices', s);
          });
        });

        const { navigate } = this.props.navigation;
        navigate('MerchantPymt',{ fromProfile: false });

        // const resetAction = NavigationActions.reset({
        //   index: 0,
        //   actions: [
        //     NavigationActions.navigate({ routeName: 'merchantNav' }),
        //   ],
        // });
        // this.props.navigation.dispatch(resetAction);
      }).catch((error) => {
        console.log(error);
      })
      .done();
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

      // <View style={styles.listContainer}>
      //   <View style={styles.infoSection}>
      //     <Text style={{ textAlign: 'left', marginLeft: 10, marginTop: 10, marginBottom: 10, fontSize: 20 }}>
      //     {state.params.vehicle.year} {state.params.vehicle.make} {state.params.vehicle.model}</Text>
      //     {renderIf(this.state.showSvcDateError)(
      //       <Text style={formStyles.error}>Field required</Text>
      //     )}
      //     <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: 10}}>
      //       <View>
      //         <DatePicker
      //           style={{width: 200, marginLeft: 10}}
      //           date={this.state.date}
      //           mode="date"
      //           placeholder="service date"
      //           format="MM/DD/YYYY"
      //           confirmBtnText="Confirm"
      //           cancelBtnText="Cancel"
      //           iconSource={calIcon}
      //           onDateChange={(date) => { this.setState({ date: date})}}
      //         />
      //       </View>
      //       <View style={{ marginRight: 10, flexDirection: 'column', alignItems: 'flex-end' }}>
      //         <Button
      //           style={{ width: 300 }}
      //           onPress={() => this.setState({ showServicePicker: true })}
      //           title="Add service"
      //         />
      //       </View>
      //     </View>
      //   </View>
      //   <View>
      //     {renderIf(this.state.showSvcZipError)(
      //       <Text style={formStyles.error}>Zip Field required (must be 5 digits)</Text>
      //     )}
      //     <TextInput
      //       style={{ height: 60, width: 100 }}
      //       keyboardType="numeric"
      //       maxLength={5}
      //       placeholder="service zip"
      //       onChangeText={text => this.setState({ zip: text })}
      //     />
      //   </View>
      //   <Modal
      //      animationType={'slide'}
      //      transparent={true}
      //      visible={this.state.showServicePicker}
      //      onRequestClose={() => this.setState({ showServicePicker: false })}
      //      >
      //     <View style={{ margin: 50, backgroundColor: '#ffffff', padding: 20 }}>
      //       <ServicePicker currentServices={this.state.currentServices} onServicePickCompleted={this._onServicePickCompleted} />
      //       <Button
      //         style={{ width: 300 }}
      //         onPress={() => this.setState({ showServicePicker: false })}
      //         title="Done"
      //       />
      //     </View>
      //    </Modal>
      //     <View style={styles.listSection}>
      //     {renderIf(this.state.showSvcListError)(
      //       <Text style={formStyles.error}>Field required, must include at lease 1 sevice.</Text>
      //     )}
      //     <ListView
      //       dataSource={this.state.dataSource}
      //       renderRow={this.renderRow}
      //       renderSectionHeader={this.renderSectionHeader}
      //       style={{ marginTop: 10 }}
      //     />
      //     </View>
      //     <View style={styles.butSection}>
      //     <Button
      //       style={{ width: 300 }}
      //       onPress={() => this.submitRequest()}
      //       title="Submit service request"
      //     />
      //     </View>
      // </View>

    );
  }
}

RegisterMerchantServices.propTypes = {
  navigation: PropTypes.object.isRequired,
};

AppRegistry.registerComponent('RegisterMerchantServices', () => RegisterMerchantServices);
