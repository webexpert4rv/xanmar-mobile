import React, { Component, PropTypes } from 'react';
import { AppRegistry, Button, Dimensions, Image, Platform, View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { ListView } from 'realm/react-native';
import { NavigationActions } from 'react-navigation';
import format from 'string-format';
import renderIf from 'render-if';
import { Dropdown } from 'react-native-material-dropdown';
import df from 'dateformat';
import { common, serviceRequest, dashboard } from '../style/style';
import realm from './realm';
import palette from '../style/palette';
import PushController from './PushController';

const vehicleIcon = require('../img/tabbar/vehicle_on.png');
const carImage = require('../img/default_car.png');

export default class ConsumerVehicles extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Vehicles',
      header: null,
      tabBarIcon: ({ tintColor }) => (
        <Image
          source={vehicleIcon}
          style={{ width: 26, height: 26, tintColor }}
        />
      ),
    };
  };

  constructor(props) {
    super(props);
    this._onNotificationReceived = this._onNotificationReceived.bind(this);
    this.onChangeText = this.onChangeText.bind(this);

    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    const currentVechicles = realm.objects('Vehicle');
    const currentVechicle = realm.objects('CurrentVehicle');
    let sortedSvcRequests = [];
    let dashboardAvailable = false;
    let activeVeh = '';
    if (currentVechicle && currentVechicle.length > 0) {
      let svcRequest = realm.objects('ServiceRequest');
      let srs = svcRequest.filtered(format('vehicle_id == {}', currentVechicle[0].vehicleId));
      sortedSvcRequests = srs.sorted('service_date', true)

      if (srs.length > 0) {
        dashboardAvailable = true;
      }
      activeVeh = currentVechicle[0].make.concat(" ", currentVechicle[0].model)
    }

    this.state = {
      dataSource: ds.cloneWithRows(sortedSvcRequests),
      dashboardAvailable: dashboardAvailable,
      currentVechicles: currentVechicles,
      activeVehicle: activeVeh,
    };
  }

  componentWillMount() {
    this._updateData();
  }

  componentDidMount(){
    this._sub = this.props.navigation.addListener('didFocus', this._updateData);
  }

  _updateData = () => {
    const currentVechicles = realm.objects('Vehicle');
    this.setState({
      currentVechicles: currentVechicles,
    });
    this.loadDashboardWithCurrentVehcile();
  };

  componentWillUnmount() {
    this._sub.remove();
  }

  loadDashboardWithCurrentVehcile() {
    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    //const currentVechicles = realm.objects('Vehicle');
    const currentVechicle = realm.objects('CurrentVehicle');

    let svcRequest = realm.objects('ServiceRequest');
    let srs = svcRequest.filtered(format('vehicle_id == {}', currentVechicle[0].vehicleId));
    let sortedSvcRequests = srs.sorted('service_date', true)

    let dashboardAvailable = false;
    if (srs.length > 0) {
      dashboardAvailable = true;
    }
    this.setState({
      dataSource: ds.cloneWithRows(sortedSvcRequests),
      dashboardAvailable: dashboardAvailable,
      //currentVechicles: currentVechicles,
      activeVehicle: currentVechicle[0].make.concat(" ", currentVechicle[0].model),
    });
  }

  renderRow(rowData, sectionID, rowID, highlightRow){
    //this is stupid query because realm doesn't support filter on the contents of a to-many relationship
    const sc = realm.objects('ServiceCategory');
    let category;
    let found;
    for (let cat of sc.values()) {
      for (let svc of cat.services.values()) {
        if (svc.service_id === rowData.services[0].service_id) {
          category = cat.name;
          found = true;
          break;
        }
      }
      if (found){
        break;
      }
    }

    const sd = df(rowData.service_date, 'dddd mmmm dS, yyyy');
    var status;
    var s;
    var buttonText;
    if (rowData.status === 'new') {
      s = dashboard.statusRequested;
      status = 'REQUESTED';
    }
    if (rowData.status === 'bidding') {
      s = dashboard.statusRequested;
      status = 'REQUESTED';
    }
    if (rowData.status === 'in progress') {
      s = dashboard.statusInProgress;
      status = 'IN PROGRESS';
    }
    if (rowData.status === 'completed') {
      s = dashboard.statusCompleted;
      status = 'COMPLETED';
    }
    if (rowData.status === 'canceled') {
      s = dashboard.statusCanceled;
      status = 'CANCELED';
    }

    return(
      <View style={dashboard.container}>
        <View style={{ marginLeft: 8, marginBottom: 4 }}>
          <Text style={{ color: palette.GRAY, fontSize: 15 }}>
            {category.toUpperCase()}
          </Text>
        </View>
        <View style={{ marginLeft: 8, marginBottom: 7 }}>
          <Text style={{ fontSize: 18, color: palette.BLACK }}>
             { rowData.comment }
          </Text>
        </View>
        <View style={{ marginLeft: 8, flex: 1, flexDirection: 'row', justifyContent: 'flex-start' }} >
          <Text style={[s,{fontSize: 15}]}>
            {status}
          </Text>
          <Text style={{ marginLeft: 10, fontSize: 15 }}>
            { df(rowData.service_date, 'm/d/yy') }
          </Text>
        </View>
        <View style={dashboard.line} />
      </View>
    );
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

  rowPressed (vehicle) {
    const { navigate } = this.props.navigation;
    navigate('ff');
  }

  _onNotificationReceived(n) {
    console.log('Notification recieved...sne to history page');
    // this.props.navigation.navigate('SvcHistory');
    // this.state = {
    //   gotoSvcHistory: true,
    // };
  }

  addVehicle() {
    const navigateAction = NavigationActions.navigate({
      routeName: 'RegisterVehicle',
      params: { onBoarding: false, userId: this.getUserId() },
    });

  this.props.navigation.dispatch(navigateAction);

  }

  getUserId() {
    let uId = 0;
    const userPrefs = realm.objects('UserPreference');
    if (userPrefs.length > 0) {
      uId = userPrefs[0].userId;
    }
    return uId;
  }

  onChangeText(value, index, data) {
    const vehicle = data[index].v;
    const cv = realm.objects('CurrentVehicle');
    if (cv.length > 0) {
      realm.write(() => {
        cv[0].vehicleId = parseInt(vehicle.vehicleId);
        cv[0].make = vehicle.make;
        cv[0].model = vehicle.model;
        cv[0].year = vehicle.year;
      });
    }

    this.loadDashboardWithCurrentVehcile();
  }

  render() {
    const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;
    const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : 0;
    const HEIGHT = APPBAR_HEIGHT + STATUSBAR_HEIGHT;
    const { navigate } = this.props.navigation;
    const  {_width, height} = Dimensions.get('window');
    const wordingWidth = _width - 100;
    let customerVehicles = [];
    for (i = 0; i < this.state.currentVechicles.length; i++) {
        customerVehicles.push({
          value: this.state.currentVechicles[i].make.concat(" ", this.state.currentVechicles[i].model),
          v: this.state.currentVechicles[i]
        });
    }

    return (
      <View style={common.dashboardContainer}>
        <PushController onNotificationReceived={this._onNotificationReceived} />
        <View
          style={{ backgroundColor: palette.HEADER_BLUE,
            alignSelf: 'stretch',
            height: HEIGHT,
            flexDirection: 'row',
            justifyContent: 'space-between' }}
        >
          <View style={{ width: 50 }} />
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Dropdown containerStyle={{ width: 200, backgroundColor: palette.HEADER_BLUE }}
              pickerStyle={{ height: 300, marginTop:65 }}
              inputContainerStyle={{ borderBottomColor: 'transparent' }}
              value={this.state.activeVehicle}
              label=""
              labelHeight={17}
              fontSize={20}
              textColor="rgb(255,255,255)"
              baseColor="rgb(255,255,255)"
              itemColor="rgb(0,0,0)"
              selectedItemColor="rgb(0,0,0)"
              onChangeText={this.onChangeText}
              data={customerVehicles}
            />

          </View>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => this.addVehicle()} >
              <Text style={common.blueAddHeaderButton}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Image style={{ width:_width, backgroundColor: palette.LIGHT_BLUE}} source={carImage} />
        {renderIf(this.state.dashboardAvailable)(
          <ListView
            style={{ marginTop: 10 }}
            dataSource={this.state.dataSource}
            removeClippedSubviews={false}
            renderRow={this.renderRow.bind(this)}
          />
        )}
        {renderIf(!this.state.dashboardAvailable)(
          <View>
            <View style={{ flexDirection: 'column', width:wordingWidth, justifyContent: 'center', alignItems:'center'}}>
              <Text style={{ color: palette.BLACK, fontSize: 20, marginTop: 10, marginLeft: 10, marginRight: 10 }}>
                Welcome to Xanmar Auto!
              </Text>
              <View style={{ flexDirection: 'row', marginLeft: 10, marginRight: 10, marginTop:10 }}>
                <Text style={{ fontSize: 18, color: palette.GRAY, marginRight: 5 }}>
                  To get started, tap on
                </Text>
                <Text style={{ fontSize: 18, color: palette.BLACK, marginRight: 5 }}>
                  Services
                </Text>
                <Text style={{ fontSize: 18, color: palette.GRAY }}>
                  tab to request
                </Text>
              </View>
              <Text style={{ fontSize: 18, color: palette.GRAY }}>
              a new service for your {this.state.activeVehicle}
              </Text>
            </View>

          </View>
        )}
      </View>




    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 100,
    backgroundColor: '#F5FCFF',
    marginLeft: 8,
    marginRight: 8,
  },
  icon: {
    width: 26,
    height: 26,
  },
  vehicle: {
    padding: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  footnote: {
    fontSize: 12,
    fontStyle: 'italic'
  },
  name: {
    fontSize: 20,
    textAlign: 'left',
    margin: 10,
  },
  desc: {
    textAlign: 'left',
    color: '#333333',
    marginBottom: 5,
    margin: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#dddddd',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    paddingVertical: 20,
  },
});

ConsumerVehicles.propTypes = {
  navigation: PropTypes.object.isRequired,
};

AppRegistry.registerComponent('ConsumerVehicles', () => ConsumerVehicles);
