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
import DatePicker from 'react-native-datepicker';
import renderIf from 'render-if';
import { common, serviceRequest, formStyles } from '../style/style';
import { NavigationActions } from 'react-navigation';
import format from 'string-format';
import constants from '../constants/c';
import realm from './realm';
import palette from '../style/palette';
import * as events from '../broadcast/events';



export default class ConsumerRequestDate extends Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    const { state } = this.props.navigation;
    this.state = {
      zip: state.params.zip,
      showSvcDateError: false,
    };
  }



  validateForm() {
    let formValid = true;

    // service date
    if (this.state.date === undefined) {
      this.setState({ showSvcDateError: true });
      formValid = false;
    } else {
      this.setState({ showSvcDateError: false });
    }
    return formValid;
  }

  gotoPhoto() {
    const { navigate } = this.props.navigation;
    if (this.validateForm()) {
      navigate('RequestServicePhoto',
        {
          // svcsRequested: this.state.svcsRequested,
          zip: this.state.zip,
          svcDate: this.state.date,
        }
      );
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
            <TouchableOpacity onPress={() => this.gotoPhoto()} >
              <Text style={common.headerLeftButton}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ marginTop: 40 }}>
          <Text style={serviceRequest.title}>When do you need</Text>
        </View>
        <View style={{ marginTop: 5 }}>
          <Text style={serviceRequest.title}>the service to start?</Text>
        </View>
        <View>
          <Text style={serviceRequest.subTitle}>Enter your desired service date</Text>
        </View>
        <View style={{ marginTop: 30 }}>
          {renderIf(this.state.showSvcDateError)(
            <View style={common.center}>
              <Text style={formStyles.error}>Date requird</Text>
            </View>
          )}
          <DatePicker
            style={{ marginLeft: 10, width: 400 }}
            date={this.state.date}
            mode="date"
            placeholder="choose date"
            format="MM/DD/YYYY"
            confirmBtnText="Confirm"
            cancelBtnText="Cancel"
            showIcon={false}
            onDateChange={(date) => { this.setState({ date: date})}}
            customStyles={{
              dateInput: {
                borderWidth: 0,
              },
              placeholderText: {
                fontSize: 20,
                color: palette.WHITE,
                fontStyle: 'italic',
              },
              dateText: {
                color: palette.WHITE,
                fontSize: 20,
              },
            }}
          />
        </View>
        <View style={serviceRequest.line} />
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


ConsumerRequestDate.propTypes = {
  navigation: PropTypes.object.isRequired,
};

AppRegistry.registerComponent('ConsumerRequestDate', () => ConsumerRequestDate);
