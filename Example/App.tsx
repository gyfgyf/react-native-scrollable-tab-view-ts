import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, ScrollView, View, Text, StatusBar } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { ScrollableTabView, ScrollableTabBar } from './lib';
import Button from './lib/Button';
import DynamicExample from './DynamicExample';
import FacebookTabBar from './FacebookTabBar';

const App = () => {
  const [type, setType] = useState('ScrollableTabBar')
  
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <View style={styles.buttonGroup}>
          <Button onPress={() => setType('ScrollableTabBar')}>
            <Text>ScrollableTabBar</Text>
          </Button>
          <Button onPress={() => setType('DefaultTabBar')}>
            <Text>DefaultTabBar</Text>
          </Button>
          <Button onPress={() => setType('DynamicExample')}>
            <Text>Dynamic</Text>
          </Button>
          <Button onPress={() => setType('FacebookTabBar')}>
            <Text>FacebookTabBar</Text>
          </Button>
        </View>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>
          <View style={styles.body}>
            {type == 'DynamicExample' && <DynamicExample />}
            {type == 'ScrollableTabBar' &&<ScrollableTabBarExample />}
            {type == 'DefaultTabBar' && (
              <ScrollableTabView>
                <View tabLabel={'网页'} style={styles.item}></View>
                <View tabLabel={'资讯'} style={styles.item}></View>
                <View tabLabel={'视频'} style={styles.item}></View>
              </ScrollableTabView>
            )}
            {type == 'FacebookTabBar' && (
              <ScrollableTabView renderTabBar={()=><FacebookTabBar/>}>
                <View tabLabel={'sc-github'} style={styles.item}></View>
                <View tabLabel={'sc-google-plus'} style={styles.item}></View>
                <View tabLabel={'sc-facebook'} style={styles.item}></View>
              </ScrollableTabView>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};
function ScrollableTabBarExample() {
  const renderTabBar = () => {
    return (
      <ScrollableTabBar tabUnderlineWidth={40} />
    )
  }
  return (
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
  )
}
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
    paddingHorizontal: 20,
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
  buttonGroup: {
    flexDirection: 'row',
    padding: 15,
    justifyContent:'space-between',
  }
});

export default App;
