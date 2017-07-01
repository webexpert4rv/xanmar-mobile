import React, { Component } from 'react';
import { DeviceEventEmitter, AppRegistry, Button, View, StyleSheet, Text } from 'react-native';
import { ListView } from 'realm/react-native';
import { NavigationActions } from 'react-navigation'
import format from 'string-format';
import realm from './realm';
import constants from '../constants/c';
import PushController from './PushController';
import palette from '../style/palette';
import { bidStyles } from '../style/style';
import * as events from '../broadcast/events';

export default class ConsumerSvcRequestBidDetails extends Component {
  static navigationOptions = {
    title: 'Bid Details',
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
    this.addService = this.addService.bind(this);
    const { state } = this.props.navigation
    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
      sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
    });
    this.state = {
      dataSource: ds,
      dict: {},
      bid: state.params.bid,
      srid: state.params.srid,
    };
  }

  componentDidMount() {
    // const { state } = this.props.navigation
    // console.log(JSON.stringify(this.state.job));
    this.loadRequest(this.state.bid.bid_detail);
  }

  loadRequest(svcs) {
    let serviceChecked = false;
    const servicesCategoryMap = {};
    svcs.forEach((service) => {
      // console.log('sssss');
      // console.log(JSON.stringify(service));
      if (!servicesCategoryMap[service.category]) {
        // Create an entry in the map for the category if it hasn't yet been created
        servicesCategoryMap[service.category] = [];
      }

      service.services.forEach((s) => {
        servicesCategoryMap[service.category].push(s);
        serviceChecked = true;
      });
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

   addService(s, bid) {
     this.state.dict[s.service_id] = bid;
    //  console.log('ggg');
    //  console.log(this.state.dict);
   }

   getUserId() {
     let uId = 0;
     const userPrefs = realm.objects('UserPreference');
     if (userPrefs.length > 0) {
       uId = userPrefs[0].userId;
     }
     return uId;
   }

   acceptBid() {
     const { goBack } = this.props.navigation;
     const bid = {
       service_request_id: this.state.srid,
       service_provider_id: this.state.bid.service_provider_id,
       user_id: this.getUserId(),
     };
     fetch(format('{}/api/user/bid/accept', constants.BASSE_URL), {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         Authorization: constants.API_KEY,
       },
       body: JSON.stringify(bid),
     })
       .then(response => response.json())
       .then((responseData) => {
         //DeviceEventEmitter.emit('onBidAccepted', {});
         events.sendMerchantJobAcceptedEvent(true);
         goBack();
       }).catch((error) => {
         console.log(error);
       })
       .done();
   }

  renderRow(rowData, sectionID, rowID, highlightRow){

    var bid = rowData.bid;
    return(

      <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: 10}}>
        <View>
        <Text style={styles.name}>
          {rowData.name}
        </Text>
        </View>
        <View style={{ marginRight: 10, flexDirection: 'column', alignItems: 'flex-end' }}>
        <Text style={styles.name}>
          ${bid.toFixed(2)}
        </Text>
        </View>
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

  render() {
    if (this.state.bid.accepted) {
      return (
        <View style={bidStyles.customerInfo}>
          <View>
            <Text style={{ textAlign: 'center', marginTop: 30, marginBottom: 15, fontSize: 20, fontWeight: 'bold' }}>Service Provider Contact Information </Text>
          </View>
          <View>
            <Text style={ bidStyles.customerDetail}>
             Name: {this.state.bid.business_name}
            </Text>
          </View>
          <View>
            <Text style={ bidStyles.customerDetail}>
             Phone: {this.state.bid.phone}
            </Text>
          </View>
          <View>
            <Text style={ bidStyles.customerDetail}>
             Email: {this.state.bid.email}
            </Text>
          </View>
          <View>
            <Text style={ bidStyles.customerDetail}>
             Address: {this.state.bid.address}
             {this.state.bid.city} {this.state.bid.state} {this.state.bid.zip}
            </Text>
          </View>
        </View>
      );
    } else {
      return (
        <View style={styles.listContainer}>
          <View style={styles.infoSection}>
            <Text style={{ textAlign: 'left', marginLeft: 10, marginTop: 10, marginBottom: 10, fontSize: 20 }}>
            {this.state.bid.business_name}</Text>
          </View>
          <View style={styles.listSection}>
            <ListView
              dataSource={this.state.dataSource}
              renderRow={this.renderRow.bind(this)}
              renderSectionHeader={this.renderSectionHeader}
              style={{ marginTop: 10 }}
            />
            </View>
            <View style={{ marginBottom: 15, marginLeft: 8, marginRight: 8, flex: .05, flexDirection: 'row', justifyContent: 'center' }} >
              <View style={{ width: 200}}>
                <Button
                  onPress={() => this.acceptBid()}
                  title="Accept Bid"
                />
              </View>
            </View>
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
  },
  listSection: {
    flex: 0.80,
  },
  butSection: {
    flex: 0.10,
  },
  infoSection: {
    flex: 0.10,
  },
  container: {
    flex: 1,
    height: 100,
    backgroundColor: '#F5FCFF',
    marginLeft: 8,
    marginRight: 8,
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

AppRegistry.registerComponent('ConsumerSvcRequestBidDetails', () => ConsumerSvcRequestBidDetails);
