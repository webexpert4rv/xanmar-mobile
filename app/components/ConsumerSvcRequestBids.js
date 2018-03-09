import React, { Component } from 'react';
import { DeviceEventEmitter, AppRegistry, Button, View, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableHighlight } from 'react-native';
import { HeaderBackButton, NavigationActions } from 'react-navigation';
import { ListView } from 'realm/react-native';
import renderIf from 'render-if';
import format from 'string-format';
import Stars from 'react-native-stars'
import realm from './realm';
import constants from '../constants/c';
import PushController from './PushController';
import palette from '../style/palette';
import { bidStyles } from '../style/style';
import * as events from '../broadcast/events';
import { common, inbox, formStyles } from '../style/style';

export default class ConsumerSvcRequestBids extends Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    const { state } = this.props.navigation
    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
      sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
    });

    console.log(JSON.stringify(state.params.svcRequest));
    this.state = {
      dataSource: ds.cloneWithRows(state.params.svcRequest.bids),
      dict: {},
      srid: state.params.svcRequest.service_request_id,
      svcRequest: state.params.svcRequest,
    };
  }
  // componentWillMount() {
  //   DeviceEventEmitter.addListener('onBidAccepted', this.fetchData.bind(this));
  // }
  componentDidMount() {
    //this.fetchData();
    events.getMerchantJobAcceptedEvents().subscribe((value) => {
      //this.fetchData();
    });
  }

  goBack() {
    const { goBack } = this.props.navigation;
    goBack();
  }

  fetchData() {
    fetch(format('{}/api/user/bids/{}', constants.BASSE_URL, this.state.srid), {
      headers: {
        Authorization: constants.API_KEY,
      },
    })
      .then(response => response.json())
      .then((responseData) => {
        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.setState({
          dataSource: ds.cloneWithRows(responseData.bids),
          isLoading: false,
        });
      })
      .done();
  }

  getUserId() {
    let uId = 0;
    const userPrefs = realm.objects('UserPreference');
    if (userPrefs.length > 0) {
      uId = userPrefs[0].userId;
    }
    return uId;
  }

  cancelRequest() {
    const cancelReq = {
      service_request_id: this.state.srid,
      user_id: this.getUserId(),
    };
    fetch(format('{}/api/svcreq/cancel', constants.BASSE_URL), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: constants.API_KEY,
      },
      body: JSON.stringify(cancelReq),
    })
      .then(response => response.json())
      .then((responseData) => {

        // update status to complete
        let svcRequest = realm.objects('ServiceRequest');
        let sr = svcRequest.filtered(format('service_id == {}', this.state.srid));
        realm.write(() => {
          sr[0].status = 'canceled';
        });

        //go back to home page but forece a reload.
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

   renderRow(rowData, sectionID, rowID, highlightRow){
     var status;
     var s;
     var buttonText;
     if (rowData.accepted) {
       status = 'Accepted';
       s = bidStyles.statusAccepted;
       buttonText = "View merchant information";
     } else {
       status = 'Open';
       s = bidStyles.statusOpen;
       buttonText = "View bid details";
     }

     var total = rowData.bid_total;
     return(
       <TouchableOpacity activeOpacity={1} onPress={() => { this.props.navigation.navigate('ConsumerSvcRequestBidDetails',
        { bid: rowData, srid: this.state.srid, services: this.state.svcRequest.services })}} >
         <View style={{ flexDirection: 'row' }} >
           <View style={{ flex: 0.8 }}>
             <View style={{ marginLeft: 30, marginBottom: 2 }} >
               <Text style={styles.title}>
                 {rowData.business_name}
               </Text>
               <View style={{ flexDirection: 'row', marginTop: 5 }} >
                 <Stars
                    value={parseFloat(rowData.rating)}
                    spacing={8}
                    count={5}
                    starSize={15}
                    fullStar= {require('../img/starFilled.png')}
                    emptyStar= {require('../img/starEmpty.png')}/>
                    <Text style={{ marginLeft:10, color: palette.GRAY }}>
                      ({rowData.review_count}) Reviews
                    </Text>
               </View>
               <View style={{ flexDirection: 'row' }} >
                <View >
                  <Text style={{ marginTop: 5, color: palette.GRAY, color: palette.BLACK }}>
                    Mechanic comment would go here when captured.
                  </Text>
                </View>
                <View>
                  <Text style={{ marginLeft: 40, marginTop:-15, fontSize: 40, color: palette.SUBMITTED_BID }}>
                    &rsaquo;
                  </Text>
                </View>
               </View>

             </View>
           </View>
           <View style={{ flex: 0.2 }}>
             <Text style={styles.title}>
               ${total.toFixed(2)}
             </Text>
           </View>
         </View>
       </TouchableOpacity>

      //  <View style={styles.container}>
      //    <View style={styles.vehicle}>
      //      <Text style={styles.title}>
      //        {rowData.business_name}
      //      </Text>
      //      <Text style={styles.title}>
      //        ${total.toFixed(2)}
      //      </Text>
      //      <Text style={s}>
      //        {status}
      //      </Text>
      //    </View>
      //    <View style={{ marginBottom: 8, marginLeft: 8, marginRight: 8, flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }} >
      //      <Button
      //        onPress={() => { this.props.navigation.navigate('ConsumerSvcRequestBidDetails', { bid: rowData, srid: this.state.srid })}}
      //        title={buttonText}
      //      />
      //    </View>
      //  </View>
     );
   }

   renderSeparator(sectionID, rowID, adjacentRowHighlighted){
     return(
       <View
         key={`${sectionID}-${rowID}`}
         style={{
           marginTop: 15,
           height: adjacentRowHighlighted ? 4 : 1,
           backgroundColor: adjacentRowHighlighted ? '#3B5998' : '#CCCCCC',
         }}
       />
     );
   }


// TRY AGAIN
  render() {
    const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;
    const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : 0;
    const HEIGHT = APPBAR_HEIGHT + STATUSBAR_HEIGHT;
    return (
      <View style={{ backgroundColor: palette.WHITE, flex: 1 }}>

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
              Service Request
            </Text>
          </View>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          </View>
        </View>
        <TouchableOpacity style={{ backgroundColor: palette.HEADER_BLUE, height: 75 }}
                  activeOpacity={1}
                  onPress={() => { this.cancelRequest() }} >
          <Text style={{ color: palette.WHITE, textAlign: 'left', marginLeft:20, height: 33, marginBottom: 5 }}>
          {this.state.svcRequest.comment}
          </Text>
          <Text style={{ color: palette.LIGHT_BLUE, textAlign: 'right', fontSize: 10, marginRight: 20 }}>CANCEL THIS REQUEST</Text>
        </TouchableOpacity>
        {renderIf(this.state.dataSource.getRowCount() > 0)(
          <ListView
            style={{ marginTop: 10 }}
            dataSource={this.state.dataSource}
            renderRow={this.renderRow.bind(this)}
            renderSeparator={this.renderSeparator}
          />
        )}
        {renderIf(this.state.dataSource.getRowCount() == 0)(
          <View>
            <Text style={{ textAlign: 'center', marginTop: 60, fontSize: 20 }}>No one has bidded on your service request. </Text>
          </View>
        )}

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 120,
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

AppRegistry.registerComponent('ConsumerSvcRequestBids', () => ConsumerSvcRequestBids);
