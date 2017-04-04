import React, { Component } from 'react';
import { AppRegistry,
        ListView,
        View, Text } from 'react-native';

export default class registerServiceOffered extends Component {
  static navigationOptions = {
    title: 'Register - Services offered',
  };

  formatData() {
    const services = [
      { category: 'category1', service: 'c1s1' },
      { category: 'category1', service: 'c1s2' },
      { category: 'category1', service: 'c1s3' },
      { category: 'category1', service: 'c1s4' },
      { category: 'category1', service: 'c1s5' },
      { category: 'category1', service: 'c1s6' },
      { category: 'category1', service: 'c1s7' },
      { category: 'category1', service: 'c1s8' },
      { category: 'category1', service: 'c1s9' },
      { category: 'category1', service: 'c1s10' },
      { category: 'category2', service: 'c1s1' },
      { category: 'category2', service: 'c1s2' },
      { category: 'category2', service: 'c1s3' },
      { category: 'category2', service: 'c1s4' },
      { category: 'category2', service: 'c1s5' },
      { category: 'category2', service: 'c1s6' },
      { category: 'category2', service: 'c1s7' },
      { category: 'category2', service: 'c1s8' },
      { category: 'category2', service: 'c1s9' },
      { category: 'category2', service: 'c1s10' },
    ];

    const c1services = [
      { service: 'c1s1' },
      { service: 'c1s2' },
      { service: 'c1s3' },
      { service: 'c1s4' },
      { service: 'c1s5' },
      { service: 'c1s6' },
      { service: 'c1s7' },
      { service: 'c1s8' },
      { service: 'c1s9' },
      { service: 'c1s10' },
    ];

    const c2services = [
      { service: 'c2s1' },
      { service: 'c2s2' },
      { service: 'c2s3' },
      { service: 'c2s4' },
      { service: 'c2s5' },
      { service: 'c2s6' },
      { service: 'c2s7' },
      { service: 'c2s8' },
      { service: 'c2s9' },
      { service: 'c2s10' },
    ];

    let i;
    let j;
    let service;
    const dataBlob = {};
    const sectionIds = [];
    const rowIds = [];
    const categoryOne = 'category1';
    const categoryTwo = 'category2';
    // sectionIds.push(categoryOne);
    // sectionIds.push(categoryTwo);

    for (i = 0; i < c1services.length; i += 1) {
      sectionIds.push(categoryOne);
      service = c1services[i];
      //dataBlob['category1'] = 'Category 1';
      rowIds.push([]);
      const rowId = `${categoryOne}:${service.service}`;
      //console.log('rId-' + rowId)
      rowIds[rowIds.length - 1].push(rowId);
      dataBlob[rowId] = service.service;
    }

    for (j = 0; j < c2services.length; j += 1) {
      sectionIds.push(categoryTwo);
      service = c2services[j];
      //dataBlob['category1'] = 'Category 1';
      rowIds.push([]);
      const rowId = `${categoryTwo}:${service.service}`;
      //console.log('rId-' + rowId)
      rowIds[rowIds.length - 1].push(rowId);
      dataBlob[rowId] = service.service;
    }
    console.log("db: " + JSON.stringify(dataBlob));
    console.log("db: " + JSON.stringify(sectionIds));
    console.log("db: " + JSON.stringify(rowIds));

    this.setState({
      dataSource: this.state.dataSource.cloneWithRowsAndSections(dataBlob, sectionIds, rowIds),
      loaded: true,
    });

    //return { dataBlob, sectionIds, rowIds };
  }

  constructor(props) {
    super(props);

    const getSectionHeaderData = (dataBlob, sectionId) => 'vv';
    const getRowData = (dataBlob, sectionId, rowID) => dataBlob[`${rowID}`];

    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
      sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
      getSectionHeaderData,
      getRowData,
    });
    this.state = {
      isLoading: true,
      dataSource: ds,
    };
  }

  componentDidMount() {
    this.formatData();
  }

  renderRow(rowData, sectionID, rowID, highlightRow) {
    return (
      <Text style={{ height: 50 }}>{ rowData }</Text>
    );
  }

  renderSectionHeader(sectionData, sectionID) {
    return (
      <Text style={{ height: 40 }}>{ sectionID }</Text>
    );
  }

  render() {
    return (
      <View>
        <View>
          <Text style={{ marginLeft: 20, textAlign: 'left', marginTop: 30, fontSize: 20 }}>Pick services offered </Text>
        </View>
        <View style={{ marginLeft: 20 }}>
          <ListView
            dataSource={this.state.dataSource}
            renderRow={this.renderRow}
            renderSectionHeader={this.renderSectionHeader}
          />
        </View>
      </View>
    );
  }
}

AppRegistry.registerComponent('registerServiceOffered', () => registerServiceOffered);
