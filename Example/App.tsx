import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
} from 'react-native';

import {
  Header,
  Colors,
} from 'react-native/Libraries/NewAppScreen';
import { ScrollableTabView, ScrollableTabBar } from './lib'
const App = () => {
  const renderTabBar = () => {
    return (
      <ScrollableTabBar/>
    )
  }
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>
          <View style={styles.body}>
            <ScrollableTabView
              initialPage={2}
              renderTabBar={renderTabBar}
            >
              <View tabLabel={'网页'} style={styles.item}></View>
              <View tabLabel={'资讯'} style={styles.item}></View>
              <View tabLabel={'视频'} style={styles.item}></View>
              <View tabLabel={'图片'} style={styles.item}></View>
              <View tabLabel={'知道'} style={styles.item}></View>
              <View tabLabel={'文库'} style={styles.item}></View>
              <View tabLabel={'贴吧'} style={styles.item}></View>
              <View tabLabel={'地图'} style={styles.item}></View>
              <View tabLabel={'采购'} style={styles.item}></View>
              <View tabLabel={'更多'} style={styles.item}></View>
              <View tabLabel={'网页'} style={styles.item}></View>
              <View tabLabel={'资讯'} style={styles.item}></View>
              <View tabLabel={'视频'} style={styles.item}></View>
              <View tabLabel={'图片'} style={styles.item}></View>
              <View tabLabel={'知道'} style={styles.item}></View>
            </ScrollableTabView>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  item: {
    paddingHorizontal:20,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});

export default App;
