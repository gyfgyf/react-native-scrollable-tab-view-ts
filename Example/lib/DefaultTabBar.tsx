'use strict';
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  ColorValue,
  TextStyle,
  ViewStyle,
}  from 'react-native';

import Button from './Button';

interface DefaultTabBarProps{
  goToPage?: Function,
  activeTab?: number,
  tabs?: string[],
  backgroundColor?: ColorValue,
  activeTextColor?: ColorValue,
  inactiveTextColor?: ColorValue,
  textStyle?: TextStyle,
  tabStyle?: ViewStyle,
  renderTab?: Function,
  underlineStyle?: ViewStyle,
  containerWidth?: number;
  scrollValue?: any;
}

class DefaultTabBar extends React.Component<DefaultTabBarProps,any>{
  static defaultProps = {
    activeTextColor: 'navy',
    inactiveTextColor: 'black',
  } 
  constructor(props:DefaultTabBarProps) {
    super(props);
    this.renderTab = this.renderTab.bind(this);
  }
  renderTabOption(name:string, page:number) {
  }
  renderTab(name:string, page:number, isTabActive:boolean, onPressHandler:Function) {
    const { activeTextColor, inactiveTextColor, textStyle, } = this.props;
    const textColor = isTabActive ? activeTextColor : inactiveTextColor;
    const fontWeight = isTabActive ? 'bold' : 'normal';
    return <Button
      style={{flex: 1, }}
      key={name}
      accessible={true}
      accessibilityLabel={name}
      accessibilityTraits='button'
      onPress={() => onPressHandler(page)}
    >
      <View style={[styles.tab, this.props.tabStyle, ]}>
        <Text style={[{ color: textColor, fontWeight, }, textStyle,]}>
          {name}
        </Text>
      </View>
    </Button>;
  }

  render() {
    const containerWidth = this.props.containerWidth||0;
    const numberOfTabs =this.props.tabs && this.props.tabs.length||0;
    const tabUnderlineStyle:ViewStyle = {
      position: 'absolute',
      width: containerWidth / numberOfTabs,
      height: 4,
      backgroundColor: 'navy',
      bottom: 0,
    };

    const translateX = this.props.scrollValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0,  containerWidth / numberOfTabs],
    });

    return (
      <View style={[styles.tabs, {backgroundColor: this.props.backgroundColor, }, this.props.style, ]}>
        {this.props.tabs && this.props.tabs.map((name, page) => {
          const isTabActive = this.props.activeTab === page;
          const renderTab = this.props.renderTab || this.renderTab;
          return renderTab(name, page, isTabActive, this.props.goToPage);
        })}
        <Animated.View
          style={[tabUnderlineStyle,
            {
              transform: [
                { translateX },
              ]
            },
            this.props.underlineStyle,
          ]}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 10,
  },
  tabs: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderColor: '#ccc',
  },
});

export default DefaultTabBar;
