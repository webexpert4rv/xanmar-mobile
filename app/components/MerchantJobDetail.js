import React, { Component } from 'react';
import { Alert, AppRegistry, Button, View, StyleSheet, Text, TextInput, TouchableHighlight } from 'react-native';
import { ListView } from 'realm/react-native';
import format from 'string-format';
import realm from './realm';
import constants from '../constants/c';
import PushController from './PushController';
import palette from '../style/palette';

export default class MerchantJobDetail extends Component {
  static navigationOptions = {
    title: 'Service Request Details',
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
      job: state.params.job,
    };
  }

  componentDidMount() {
    // const { state } = this.props.navigation
    // console.log(JSON.stringify(this.state.job));
    this.loadRequest(this.state.job.services);
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
     this.state.dict[s.service_id] = parseInt(bid);
   }

   getUserId() {
     let uId = 0;
     const userPrefs = realm.objects('UserPreference');
     if (userPrefs.length > 0) {
       uId = userPrefs[0].userId;
     }
     return uId;
   }

  validateBid() {
    const data = this.state.dict;
    const size = Object.keys(data).length;
    const rows = this.state.dataSource.getRowCount();
    let bidValid = true;

    if (size === 0 || rows !== size) {
      bidValid = false;
    }

    for (let value of Object.keys(data)) {
      if (data[value] === 0) {
        bidValid = false;
      }
    }

    return bidValid;
  }

  postBid() {
    if (this.validateBid()) {
      let svcs = [];
      const data = this.state.dict;

      for (let value of Object.keys(data)) {
        // console.log(value);
       svcs.push({ service_id: value, bid: data[value] });
      }

      const bid = {
        service_request_id: this.state.job.service_request_id,
        services: svcs };


      const { goBack } = this.props.navigation;
      fetch(format('{}/api/provider/bid/{}', constants.BASSE_URL, this.getUserId()), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bid),
      })
       .then(response => response.json())
       .then((responseData) => {
        //  const uId = responseData.user_id;
        //  realm.write(() => {
        //    realm.create('UserPreference', { onboarded: true, userId: uId, role: 'consumer' });
        //  });
         goBack();
       })
       .done();
    } else {
      Alert.alert(
      'Error',
      'Zero bids are not allowed',
        [
          { text: 'OK' },
        ],
      { cancelable: false }
    );
    }
  }

  renderRow(rowData, sectionID, rowID, highlightRow){
    return (
      <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: 10}}>
        <View>
        <Text style={styles.name}>
          {rowData.name}
        </Text>
        </View>
        <View style={{ marginRight: 10, flexDirection: 'column', alignItems: 'flex-end' }}>
          <TextInput
            keyboardType="numeric"
            onChangeText={text => this.addService(rowData, text)}
            style={{ height: 60, width: 100 }}
            placeholder="0"
          />
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

// TRY AGAIN
  render() {
    const { state } = this.props.navigation;

    if (this.state.job.accepted) {
       return (
         <View style={styles.customerInfo}>
           <View>
             <Text style={{ textAlign: 'center', marginTop: 30, marginBottom: 15, fontSize: 20, fontWeight: 'bold' }}>Customer Contact Information </Text>
           </View>
           <View>
             <Text style={ styles.customerDetail}>
              Name: {this.state.job.customer_info.name}
             </Text>
           </View>
           <View>
             <Text style={ styles.customerDetail}>
              Phone: {this.state.job.customer_info.phone}
             </Text>
           </View>
           <View>
             <Text style={ styles.customerDetail}>
              Email: {this.state.job.customer_info.email}
             </Text>
           </View>
         </View>
       );
     } else {
       return (
         <View style={styles.listContainer}>
           <View style={styles.infoSection}>
             <Text style={{ textAlign: 'left', marginLeft: 10, marginTop: 10, marginBottom: 10, fontSize: 20 }}>
             {state.params.job.year} {state.params.job.make} {state.params.job.model}</Text>
           </View>
           <View style={styles.listSection}>
             <ListView
               dataSource={this.state.dataSource}
               renderRow={this.renderRow.bind(this)}
               renderSectionHeader={this.renderSectionHeader}
               style={{ marginTop: 10 }}
             />
             </View>
             <View style={styles.butSection}>
             <Button
               style={{ width: 300 }}
               onPress={() => this.postBid()}
               title="Submit Bid"
             />
             </View>
         </View>
       );
     }
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
  vehicle: {
    padding: 10,
  },
  customerInfo: {
    paddingLeft: 10,
  },
  customerDetail: {
    fontSize: 15,
    fontWeight: 'bold',
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

AppRegistry.registerComponent('MerchantJobDetail', () => MerchantJobDetail);
