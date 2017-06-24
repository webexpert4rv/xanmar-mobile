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
import { NavigationActions } from 'react-navigation';
import format from 'string-format';
import constants from '../constants/c';
import realm from './realm';
import ServicePicker from './servicePicker';
import palette from '../style/palette';

export default class RegisterServices extends Component {
  static navigationOptions = {
    title: 'Services',
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
    const userPrefs = realm.objects('UserPreference');
    let serviceProviderId;
    if (userPrefs.length > 0) {
      serviceProviderId = userPrefs[0].userId;
    }
    const svcs = this.state.currentServices;
    // console.log(JSON.stringify(svcs));
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

// console.log('rrrrrr');
// console.log('servicesCategoryMap');
    const r = [];
    Object.keys(servicesCategoryMap).forEach((key) => {
      const sv = servicesCategoryMap[key];
      sv.forEach((s) => {
        r.push(s);
      });
    });

    // console.log(JSON.stringify(r));

    const { navigate } = this.props.navigation;
    const mySvcs = {
      service_provider_id: serviceProviderId,
      services: r,
    };

    // const backAction = NavigationActions.back();
    // this.props.navigation.dispatch(backAction);


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
        const resetAction = NavigationActions.reset({
          index: 0,
          actions: [
            NavigationActions.navigate({ routeName: 'merchantNav' }),
          ],
        });
        this.props.navigation.dispatch(resetAction);
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
          <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: 10}}>
            <View/>
            <View style={{ marginRight: 10, flexDirection: 'column', alignItems: 'flex-end' }}>
              <Button
                style={{ width: 300 }}
                color={palette.PRIMARY_COLOR}
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
              color={palette.PRIMARY_COLOR_DARK}
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
            color={palette.PRIMARY_COLOR}
            onPress={() => this.submitRequest()}
            title="Submit Services"
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

AppRegistry.registerComponent('RegisterServices', () => RegisterServices);
