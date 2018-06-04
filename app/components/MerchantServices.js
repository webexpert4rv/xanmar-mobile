import React, { Component } from 'react';
import {
  AppRegistry,
  Button,
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { ListView } from 'realm/react-native';
import { NavigationActions } from 'react-navigation';
import realm from './realm';
import ServicePicker from './servicePicker';
import palette from '../style/palette';
import ExpandableList from 'react-native-expandable-section-list';
import CheckBox from './CheckBox';
import ServiceListItem from './ServiceListItem';
import ServiceListSectionItem from './ServiceListSectionItem';
import format from 'string-format';
import * as NetworkUtils from '../utils/networkUtils';

export default class MerchantServices extends Component {
  static navigationOptions = {
    title: 'Services',
    header: null,
  };

  constructor(props) {
    super(props);
    this._onServicePickCompleted = this._onServicePickCompleted.bind(this);
    this._onCompletedChange = this._onCompletedChange.bind(this);
    this._onSectionClick = this._onSectionClick.bind(this);

    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
      sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
    });
    this.state = {
      // dataSource: ds,
      showServicePicker: false,
      servicesPicked: [],
      currentServices: [],
      selectedServices: {},
      openSections: [],
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  _onServicePickCompleted(svcs) {
    let serviceChecked = false;
    const servicesCategoryMap = {};
    const ms = [];
    svcs.forEach((s) => {
      ms.push(s);
    });
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
      //dataSource: ds.cloneWithRowsAndSections(servicesCategoryMap),
      currentServices: svcs,
    });


    // realm.write(() => {
    //   realm.delete(realm.objects('MerchantServices'));
    // });
    realm.write(() => {
      svcs.forEach((s) => {
        //console.log('updating.....');
        //console.log(JSON.stringify(s.services));
        const service = realm.create('MerchantServices', { category_id: s.category_id }, true);
        // s.services.forEach((ss) => {
        //   service.services.pop();
        // });
        s.services.forEach((ss) => {
          service.services.push(realm.create('Service', { service_id: ss.service_id, checked: ss.checked }, true));
        });
        //realm.create('MerchantServices', { category_id: s.category_id, services: s.services }, true);
      });
    });
  }

  renderRow(rowData, sectionID, rowID, highlightRow){
    console.log('rowData');
    console.log(JSON.stringify(rowData));

    var header = (
      <View style={styles.name}>
        <Text>{rowData.name}</Text>
      </View>
    );

      var subCat = "";
      rowData.services.forEach((service) => {
          subCat.concat('<Text>', service.name, '</Text>');

      });
    var content = (
        {subCat}
    );

    return (
          <Accordion
            underlayColor="transparent"
            header={header}
            content={content}
            easing="easeOutCubic"
          />
        );

    // let d;
    // if (rowData) {
    //   if (rowData.checked) {
    //     d = rowData.name;
    //   } else {
    //     d = 'not checked-'.concat(rowData.name);
    //   }
    //   // d = rowData;
    // } else {
    //   d = 'No svc defined';
    // }
    // return (
    //   <View>
    //     <Text style={styles.name}>
    //       {d}
    //     </Text>
    //   </View>
    // );
  }

  _onCompletedChange(item) {
    //console.log(JSON.stringify(item));
    if (item.checked) {
      this.state.selectedServices[item.service_id] = item;
    } else {
      delete this.state.selectedServices[item.service_id];
    }
  }

  _onSectionClick(item) {
    // console.log(JSON.stringify(item));
    // console.log(item.category_id);
    //update database for all checked services
    let allServicesChecked;
    const cccc = realm.objects('MerchantServices');
    let exactCat = cccc.filtered(format('category_id == {}', item.category_id));
    //console.log(JSON.stringify(exactCat));
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
    //item.checked = !item.checked;


    this.fetchData();
  }

  renderSectionHeader(sectionData, category) {
    return (
      <View style={{ backgroundColor: '#6495ed'}}>
        <Text style={{ color: '#ffffff', marginLeft: 5, fontSize: 23 }}>{category}</Text>
      </View>
    )
}

  renderSeparator(sectionID, rowID, adjacentRowHighlighted){
    return (
      <View
        key={`${sectionID}-${rowID}`}
        style={{
          height: adjacentRowHighlighted ? 4 : 1,
          backgroundColor: adjacentRowHighlighted ? '#3B5998' : '#CCCCCC',
        }}
      />
    );
  }

  _renderRow = (rowItem, rowId, sectionId) => (
    <TouchableOpacity key={rowId} onPress={() => {}}>
      <ServiceListItem key={rowId} data={rowItem} onCompletedChange={this._onCompletedChange} />
    </TouchableOpacity>
);

_renderSection = (section, sectionId)  => {
  return (
    <ServiceListSectionItem key={sectionId} data={section} onCompletedChange={this._onSectionClick} />
  );
};


  fetchData() {
    const sc = realm.objects('MerchantServices');
    console.log("ms");
    console.log(JSON.stringify(sc));
    const servicesCategoryMap = {};
    let dd = [];
    sc.forEach((service) => {
      dd.push({ category: {category_id: service.category_id, name: service.name, checked: service.checked},
                svc: service.services});

    });

    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
      sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
    });
    this.setState({
      dataSource: dd,
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

    const r = [];
    Object.keys(servicesCategoryMap).forEach((key) => {
      const sv = servicesCategoryMap[key];
      sv.forEach((s) => {
        r.push(s);
      });
    });

    const { navigate } = this.props.navigation;
    const mySvcs = {
      service_provider_id: serviceProviderId,
      services: r,
    };

    const backAction = NavigationActions.back();
    navigate.dispatch(backAction);
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
                onPress={() => console.log(JSON.stringify(this.state.selectedServices))}
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

          <ExpandableList
            dataSource={this.state.dataSource}
            headerKey="category"
            memberKey="svc"
            renderRow={this._renderRow}
            renderSectionHeaderX={this._renderSection}
            openOptions={this.state.openSections}
          />
          </View>
      </View>

    );
  }
}

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF'
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

AppRegistry.registerComponent('MerchantService', () => MerchantService);
