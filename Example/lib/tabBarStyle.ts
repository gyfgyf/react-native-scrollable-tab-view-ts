import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  ScrollableTabBar: {
    borderWidth: 0,
  },
  tabStyle: {
    paddingLeft: 16,
    paddingRight: 16,
    flexShrink: 0,
  },
  tabBarUnderlineStyle: {
    height: 3,
    borderRadius: 3,
    backgroundColor: '#9CD3CF',
  },
  tabsContainerStyle: {
    height: 40,
  },
});