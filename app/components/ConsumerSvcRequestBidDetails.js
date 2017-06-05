import React, { Component } from 'react';
import { AppRegistry, Button, View, StyleSheet, Text, TextInput, TouchableHighlight } from 'react-native';
import { ListView } from 'realm/react-native';
import format from 'string-format';
import realm from './realm';
import constants from '../constants/c';
import PushController from './PushController';
import palette from '../style/palette';

export default class ConsumerSvcRequestBidDetails extends Component {
  static navigationOptions = {
    title: 'Service Request Details',
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
    this.addService = this.addService.bind(this);
    const { state } = this.props.navigation
    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
      sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
    });
    this.state = {
      dataSource: ds,
      dict: {},
      bidDetails: state.params.details,
    };
  }

  componentDidMount() {
    // const { state } = this.props.navigation
    // console.log(JSON.stringify(this.state.job));
    this.loadRequest(this.state.bidDetails);
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

   postBid() {

     let svcs = [];
     const data = this.state.dict;
    //  for (var key of data) {
    //    svcs.push({ service_id: key, bid: data[key] })
    //  }

    //  data.map((obj) => {
    //     svcs.push({ service_id: obj.key, bid: obj.value });
    //     return nil;
    //  });

     for (let value of Object.keys(data)) {
        // console.log(value);
       svcs.push({ service_id: value, bid: data[value] });
      }

     const bid = {
       service_request_id: this.state.job.service_request_id,
       services: svcs };

       console.log('POST BID');
       console.log(JSON.stringify(bid));


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

// TRY AGAIN {state.params.job.year} {state.params.job.make} {state.params.job.model}
  render() {
    const { state } = this.props.navigation;
    return (
      <View style={styles.listContainer}>
        <View style={styles.infoSection}>
          <Text style={{ textAlign: 'left', marginLeft: 10, marginTop: 10, marginBottom: 10, fontSize: 20 }}>
          "wwwww"</Text>
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
                onPress={() => this.postBid()}
                title="Accept Bid"
              />
            </View>
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
