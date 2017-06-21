import React, { Component } from 'react';
import {
  AppRegistry,
  Button,
  DeviceEventEmitter,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import renderIf from 'render-if';
import { formStyles } from '../style/style';
import { NavigationActions } from 'react-navigation';
import { ListView } from 'realm/react-native';
import format from 'string-format';
import constants from '../constants/c';
import realm from './realm';
import ServicePicker from './servicePicker';
import DatePicker from 'react-native-datepicker'
import palette from '../style/palette';

const calIcon = require('../img/google_calendar.png');

export default class ConsumerRequestService extends Component {
  static navigationOptions = {
    title: 'Service Request',
    headerStyle: {
      backgroundColor: palette.PRIMARY_COLOR,
    },
    headerTitleStyle: {
      color: palette.WHITE,
    },
    headerBackTitleStyle: {
      color: palette.WHITE,
    },
    headerTintColor: palette.WHITE,
  };

  constructor(props) {
    super(props);
    this._onServicePickCompleted = this._onServicePickCompleted.bind(this);
    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
      sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
    });
    this.state = {
      dataSource: ds,
      showServicePicker: false,
      servicesPicked: [],
      currentServices: [],
      showSvcDateError: false,
      showSvcListError: false,
      showSvcZipError: false,
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  validateForm() {
    let formValid = true;
    // // email
    // const re = /.+@.+/;
    // const validEmail = re.test(this.state.email);
    // if (validEmail) {
    //   this.setState({ showEmailError: false });
    // } else {
    //   this.setState({ emailError: 'invalid email.', showEmailError: true });
    //   formValid = false;
    // }

    //service date
    if (this.state.date === undefined) {
      this.setState({ showSvcDateError: true });
      formValid = false;
    } else {
      this.setState({ showSvcDateError: false });
    }

    //service list
    console.log(this.state.dataSource.getRowCount());
    if (this.state.dataSource.getRowCount() === 0) {
      this.setState({ showSvcListError: true });
      formValid = false;
    } else {
      this.setState({ showSvcListError: false });
    }

    // service zip
    if (this.state.zip === undefined || this.state.zip.length < 5) {
      this.setState({ showSvcZipError: true });
      formValid = false;
    } else {
      this.setState({ showSvcZipError: false });
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

  renderRow(rowData, sectionID, rowID, highlightRow){
    // console.log('row data');
    // console.log(JSON.stringify(rowData));
    let d;
    if (rowData) {
      if (rowData.checked) {
        d = rowData.name;
      } else {
        d = 'not checked-'.concat(rowData.name);
      }
      // d = rowData;
    } else {
      d = 'No svc defined';
    }
    return(
      <View>
      <Text style={styles.name}>
        {d}
      </Text>
      </View>
    );
  }

  renderSectionHeader(sectionData, category) {
    return (
      <View style={{ backgroundColor: '#6495ed'}}>
        <Text style={{ color: '#ffffff', marginLeft: 5, fontSize: 23 }}>{category}</Text>
      </View>
    )
}

  renderSeparator(sectionID, rowID, adjacentRowHighlighted){
    return(
      <View
        key={`${sectionID}-${rowID}`}
        style={{
          height: adjacentRowHighlighted ? 4 : 1,
          backgroundColor: adjacentRowHighlighted ? '#3B5998' : '#CCCCCC',
        }}
      />
    );
  }

  fetchData() {
    console.log('fetch data on request svc page');
    const sc = realm.objects('ServiceCategory');
    this.setState({
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
    const { state } = this.props.navigation;
    return (
      <View style={styles.listContainer}>
        <View style={styles.infoSection}>
          <Text style={{ textAlign: 'left', marginLeft: 10, marginTop: 10, marginBottom: 10, fontSize: 20 }}>
          {state.params.vehicle.year} {state.params.vehicle.make} {state.params.vehicle.model}</Text>
          {renderIf(this.state.showSvcDateError)(
            <Text style={formStyles.error}>Field required</Text>
          )}
          <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: 10}}>
            <View>
              <DatePicker
                style={{width: 200, marginLeft: 10}}
                date={this.state.date}
                mode="date"
                placeholder="service date"
                format="MM/DD/YYYY"
                confirmBtnText="Confirm"
                cancelBtnText="Cancel"
                iconSource={calIcon}
                onDateChange={(date) => { this.setState({ date: date})}}
              />
            </View>
            <View style={{ marginRight: 10, flexDirection: 'column', alignItems: 'flex-end' }}>
              <Button
                style={{ width: 300 }}
                onPress={() => this.setState({ showServicePicker: true })}
                title="Add service"
              />
            </View>
          </View>
        </View>
        <View>
          {renderIf(this.state.showSvcZipError)(
            <Text style={formStyles.error}>Zip Field required (must be 5 digits)</Text>
          )}
          <TextInput
            style={{ height: 60, width: 100 }}
            placeholder="service zip"
            onChangeText={text => this.setState({ zip: text })}
          />
        </View>
        <Modal
           animationType={'slide'}
           transparent={true}
           visible={this.state.showServicePicker}
           onRequestClose={() => this.setState({ showServicePicker: false })}
           >
          <View style={{ margin: 50, backgroundColor: '#ffffff', padding: 20 }}>
            <ServicePicker currentServices={this.state.currentServices} onServicePickCompleted={this._onServicePickCompleted} />
            <Button
              style={{ width: 300 }}
              onPress={() => this.setState({ showServicePicker: false })}
              title="Done"
            />
          </View>
         </Modal>
          <View style={styles.listSection}>
          {renderIf(this.state.showSvcListError)(
            <Text style={formStyles.error}>Field required, must include at lease 1 sevice.</Text>
          )}
          <ListView
            dataSource={this.state.dataSource}
            renderRow={this.renderRow}
            renderSectionHeader={this.renderSectionHeader}
            style={{ marginTop: 10 }}
          />
          </View>
          <View style={styles.butSection}>
          <Button
            style={{ width: 300 }}
            onPress={() => this.validateForm()}
            title="Submit service request"
          />
          </View>
      </View>

    );
  }
}

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
    marginLeft: 10,
  },
  listSection: {
    flex: 0.65,
  },
  butSection: {
    flex: 0.10,
  },
  infoSection: {
    flex: 0.25,
  },
  name: {
    fontSize: 20,
    textAlign: 'left',
    margin: 10,
    color: '#6495ed',
  },
  desc: {
    textAlign: 'left',
    color: '#333333',
    marginBottom: 5,
    margin: 10
  },
  separator: {
       height: 1,
       backgroundColor: '#dddddd'
   },
   loading: {
       flex: 1,
       alignItems: 'center',
       justifyContent: 'center'
   },
   row: {
    paddingVertical: 20,
    backgroundColor: '#C70039',
  },
});

AppRegistry.registerComponent('ConsumerRequestService', () => ConsumerRequestService);
