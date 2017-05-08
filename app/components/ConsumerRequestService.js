import React, { Component } from 'react';
import {
  AppRegistry,
  Button,
  Modal,
  StyleSheet,
  Text,
  View,
} from 'react-native';
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
    header: {
      titleStyle: {
        color: palette.WHITE,
      },
      style: {
        backgroundColor: palette.PRIMARY_COLOR,
      },
      tintColor: palette.WHITE,
    },
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
    };
  }

  componentDidMount() {
    this.fetchData();
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
    const sc = realm.objects('ServiceCategory');
    this.setState({
      currentServices: sc,
    });
  }

  submitRequest() {
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
    console.log(new Date());
    const svcRequest = {
      service_date: new Date(this.state.date),
      make: state.params.vehicle.make,
      model: state.params.vehicle.model,
      year: parseInt(state.params.vehicle.year, 10),
      services: r,
    };

    console.log(JSON.stringify(svcRequest));
    const { navigate } = this.props.navigation;
    fetch(format('{}/api/consumer/service/request', constants.BASSE_URL), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(svcRequest),
    })
      .then(response => response.json())
      .then((responseData) => {
        console.log("done....");
        svcRequest.service_id = responseData.service_request_id;
        console.log(svcRequest.service_id);
        console.log(JSON.stringify(svcRequest));
        realm.write(() => {
          realm.create('ServiceRequest', svcRequest);
        });
        navigate('consumerTab');
      }).catch((error) => {
        console.log(error);
      })
      .done();
  }

  render() {
    const { state } = this.props.navigation;
    return (
      <View style={styles.listContainer}>
        <View style={styles.infoSection}>
          <Text style={{ textAlign: 'left', marginLeft: 10, marginTop: 10, marginBottom: 10, fontSize: 20 }}>
          {state.params.vehicle.year} {state.params.vehicle.make} {state.params.vehicle.model}</Text>
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
        <Modal
           animationType={'slide'}
           transparent={true}
           visible={this.state.showServicePicker}
           onRequestClose={() => {alert('Modal has been closed.')}}
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
            onPress={() => this.submitRequest()}
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
  },
  listSection: {
    flex: 0.70,
  },
  butSection: {
    flex: 0.10,
  },
  infoSection: {
    flex: 0.20,
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
