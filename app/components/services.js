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
import realm from './realm';
import ServicePicker from './servicePicker';
import palette from '../style/palette';

export default class services extends Component {
  static navigationOptions = {
    title: 'Services you offer',
    header: {
      titleStyle: {
        color: palette.WHITE,
      },
      style: {
        backgroundColor: palette.PRIMARY_COLOR_DARK,
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

    // let servicesCategoryMap = {};
    // svcs.forEach((service) => {
    //   if (!servicesCategoryMap[service.name]) {
    //     // Create an entry in the map for the category if it hasn't yet been created
    //     servicesCategoryMap[service.name] = [];
    //   }
    //   service.services.forEach((s) => {
    //     // servicesCategoryMap[service.category].push(s.name);
    //     servicesCategoryMap[service.name].push(s);
    //   });
    // });

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
    console.log(JSON.stringify(sc));
    // this.setState({
    //   isLoading: false,
    //   currentServices: sc,
    // });

    const servicesCategoryMap = {};
    sc.forEach((service) => {
      if (!servicesCategoryMap[service.name]) {
        // Create an entry in the map for the category if it hasn't yet been created
        servicesCategoryMap[service.name] = [];
      }
      var serviceChecked = false;
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

    this.setState({
      dataSource: this.state.dataSource.cloneWithRowsAndSections(servicesCategoryMap),
      isLoading: false,
      currentServices: sc,
    });
  }

  render() {

    // if (this.state.isLoading) {
    //        return this.renderLoadingView();
    // }

    return (

      <View>
        <View style={{ marginRight: 10, marginTop: 20, flexDirection: 'column', alignItems: 'flex-end' }}>
          <Button
            style={{ width: 300 }}
            color={palette.PRIMARY_COLOR}
            onPress={() => this.setState({ showServicePicker: true })}
            title="Add service"
          />
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

        <ListView
          dataSource={this.state.dataSource}
          renderRow={this.renderRow}
          renderSectionHeader={this.renderSectionHeader}
          style={{ marginTop: 10 } }
        />
      </View>

    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
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

AppRegistry.registerComponent('services', () => services);
