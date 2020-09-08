
import React, { ReactElement } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  ScrollView,
  Text,
  Platform,
  Dimensions,
  ColorValue,
  ViewStyle,
  TextStyle,
  LayoutChangeEvent,
  TouchableWithoutFeedback,
} from 'react-native';

import tabBarStyle from './tabBarStyle';

const WINDOW_WIDTH = Dimensions.get('window').width;

interface ScrollableTabBarProps{
  activeTab?: number;
  tabs?: string[];
  backgroundColor?: ColorValue;
  activeTextColor?: ColorValue;
  inactiveTextColor?: ColorValue;
  scrollOffset?: number;
  style?: ViewStyle;
  tabStyle?: ViewStyle;
  tabsContainerStyle?: ViewStyle;
  textStyle?: TextStyle;
  renderTab?: (name:string, page:number, isTabActive:boolean, onPressHandler:Function, onLayoutHandler:Function)=>void;
  goToPage?: (name:number, page:number, isTabActive:boolean, onPressHandler:Function, onLayoutHandler:Function)=>void;
  underlineStyle?: ViewStyle;
  onScroll?: Function;
  tabUnderlineWidth?: number;
  scrollValue?: any;
  topView?: ReactElement;
}
interface ScrollableTabBarState{
  _leftTabUnderline: any,
  _widthTabUnderline: any,
  _containerWidth: null,
}
class ScrollableTabBar extends React.PureComponent<ScrollableTabBarProps,ScrollableTabBarState> {
  static defaultProps = {
    scrollOffset: 52,
    activeTextColor: 'navy',
    inactiveTextColor: 'black',
    backgroundColor: null,
    style: tabBarStyle.ScrollableTabBar,
    tabStyle: tabBarStyle.tabStyle,
    tabsContainerStyle: tabBarStyle.tabsContainerStyle,
    underlineStyle: tabBarStyle.tabBarUnderlineStyle,
    tabUnderlineWidth: 16, 
  }
  private _tabsMeasurements: { left: number, right: number, width: number, height: number }[];
  private _tabContainerMeasurements: any;
  private _containerMeasurements: any;
  private _scrollView: any;
  constructor(props:ScrollableTabBarProps) {
    super(props);
    this._tabsMeasurements = [];
    this.state = {
      _leftTabUnderline: new Animated.Value(0),
      _widthTabUnderline: new Animated.Value(0),
      _containerWidth: null,
    }
  }
  componentDidMount() {
    this.props.scrollValue.addListener(this.updateView);
  }
  updateView = (offset:any) => {
    const position = Math.floor(offset.value);
    const pageOffset = offset.value % 1;
    const tabCount =this.props.tabs && this.props.tabs.length|| 0;
    const lastTabPosition = tabCount - 1;

    if (tabCount === 0 || offset.value < 0 || offset.value > lastTabPosition) {
      return;
    }

    if (this.necessarilyMeasurementsCompleted(position, position === lastTabPosition)) {
      this.updateTabPanel(position, pageOffset);
      this.updateTabUnderline(position, pageOffset, tabCount);
    }
  }
  necessarilyMeasurementsCompleted(position:number, isLastTab:boolean) {
    return this._tabsMeasurements[position] &&
      (isLastTab || this._tabsMeasurements[position + 1]) &&
      this._tabContainerMeasurements &&
      this._containerMeasurements;
  }
  updateTabPanel(position:number, pageOffset:number) {
    const containerWidth = this._containerMeasurements.width;
    const tabWidth = this._tabsMeasurements[position].width;
    const nextTabMeasurements = this._tabsMeasurements[position + 1];
    const nextTabWidth = nextTabMeasurements && nextTabMeasurements.width || 0;
    const tabOffset = this._tabsMeasurements[position].left;
    const absolutePageOffset = pageOffset * tabWidth;
    let newScrollX = tabOffset + absolutePageOffset;

    // center tab and smooth tab change (for when tabWidth changes a lot between two tabs)
    newScrollX -= (containerWidth - (1 - pageOffset) * tabWidth - pageOffset * nextTabWidth) / 2;
    newScrollX = newScrollX >= 0 ? newScrollX : 0;

    if (Platform.OS === 'android') {
      this._scrollView && this._scrollView.scrollTo({ x: newScrollX, y: 0, animated: false, });
    } else {
      const rightBoundScroll = this._tabContainerMeasurements.width - (this._containerMeasurements.width);
      newScrollX = newScrollX > rightBoundScroll ? rightBoundScroll : newScrollX;
      this._scrollView && this._scrollView.scrollTo({ x: newScrollX, y: 0, animated: false, });
    }

  }
  updateTabUnderline(position:number, pageOffset:number, tabCount:number) {
    const lineLeft = this._tabsMeasurements[position].left;
    const lineRight = this._tabsMeasurements[position].right;

    let fillValue = 0;
    const { tabUnderlineWidth } = this.props; 
    if (!tabUnderlineWidth) {
      return null;
    }
    if (tabUnderlineWidth) { 
      fillValue = this._tabsMeasurements[position].width / 2 - (tabUnderlineWidth / 2); // 我添加的
    }
    if (position < tabCount - 1) {
      const nextTabLeft = this._tabsMeasurements[position + 1].left;
      const nextTabRight = this._tabsMeasurements[position + 1].right;

      let newLineLeft = (pageOffset * nextTabLeft + (1 - pageOffset) * lineLeft); 

      if (tabUnderlineWidth) { 

        newLineLeft = (pageOffset * nextTabLeft + (1 - pageOffset) * lineLeft) + fillValue; 
      }

      const newLineRight = (pageOffset * nextTabRight + (1 - pageOffset) * lineRight);

      this.state._leftTabUnderline.setValue(newLineLeft);
      if (!tabUnderlineWidth) {
        this.state._widthTabUnderline.setValue(newLineRight - newLineLeft); 
      } else {
        this.state._widthTabUnderline.setValue(tabUnderlineWidth); 
      }
    } else {
      if (!tabUnderlineWidth) {
        this.state._leftTabUnderline.setValue(lineLeft);
        this.state._widthTabUnderline.setValue(lineRight - lineLeft); 
      } else {
        this.state._leftTabUnderline.setValue(lineLeft + fillValue);
        this.state._widthTabUnderline.setValue(tabUnderlineWidth);
      }
    }
  }
  renderTab = (name:string, page:number, isTabActive:boolean, onPressHandler:Function, onLayoutHandler:any) => {
    const { activeTextColor, inactiveTextColor, textStyle, renderTab } = this.props;
    if (renderTab) {
      renderTab(name, page, isTabActive, onPressHandler, onLayoutHandler);
    }
    const textColor = isTabActive ? activeTextColor : inactiveTextColor;
    const fontWeight = isTabActive ? 'bold' : 'normal';
    return <TouchableWithoutFeedback
      key={`${name}_${page}`}
      accessible={true}
      accessibilityLabel={name}
      accessibilityTraits='button'
      onPress={() => onPressHandler(page)}
      onLayout={onLayoutHandler}
    >
      <View style={[styles.tab, this.props.tabStyle,]}>
        <Text style={[{ color: textColor, fontWeight, }, textStyle,]}>
          {name}
        </Text>
      </View>
    </TouchableWithoutFeedback>
  }
  measureTab(page:number, event:any) {
    const { x, width, height, } = event.nativeEvent.layout;
    this._tabsMeasurements[page] = { left: x, right: x + width, width, height, };
    this.updateView({ value: this.props.scrollValue.__getValue(), });
  }
  render() {

    const tabUnderlineStyle:ViewStyle = {
      position: 'absolute',
      height: 4,
      backgroundColor: 'navy',
      bottom: 0,
    };

    const dynamicTabUnderline = {
      left: this.state._leftTabUnderline,
      width: this.state._widthTabUnderline,
    };
    const style:ViewStyle = {
      ...styles.container,
      backgroundColor: this.props.backgroundColor,
      ...this.props.style,
    }
    const animatedViewStyle:ViewStyle = {
      ...tabUnderlineStyle,
      ...dynamicTabUnderline,
      ...this.props.underlineStyle,
    }
    const tabContainerStyle:ViewStyle = {
      ...styles.tabs,
      width: this.state._containerWidth|| 0,
     ...this.props.tabsContainerStyle
    }
    return (
      <View>
        {this.props.topView && this.props.topView}
        <View
          style={style}
          onLayout={this.onContainerLayout}
        >
          <ScrollView
            ref={(scrollView) => { this._scrollView = scrollView; }}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            directionalLockEnabled={true}
            bounces={false}
            scrollsToTop={false}
          >
            <View
              style={tabContainerStyle}
              ref={'tabContainer'}
              onLayout={this.onTabContainerLayout}
            >
              {this.props.tabs && this.props.tabs.map((name:string, page:number) => {
                const isTabActive = this.props.activeTab === page;
                // @ts-ignore: Unreachable code error
                return this.renderTab(name, page, isTabActive, this.props.goToPage, this.measureTab.bind(this, page));
              })}
              <Animated.View style={animatedViewStyle} />
            </View>
          </ScrollView>
        </View>
      </View>
    )
  }
  componentDidUpdate(prevProps:ScrollableTabBarProps) {
    // If the tabs change, force the width of the tabs container to be recalculated
    if (JSON.stringify(prevProps.tabs) !== JSON.stringify(this.props.tabs) && this.state._containerWidth) {
      this.setState({ _containerWidth: null, });
    }
  }

  onTabContainerLayout = (e:LayoutChangeEvent) => {
    this._tabContainerMeasurements = e.nativeEvent.layout;
    let width = this._tabContainerMeasurements.width;
    if (width < WINDOW_WIDTH) {
      width = WINDOW_WIDTH;
    }
    this.setState({ _containerWidth: width, });
    this.updateView({ value: this.props.scrollValue.__getValue(), });
  }

  onContainerLayout = (e:LayoutChangeEvent) => {
    this._containerMeasurements = e.nativeEvent.layout;
    this.updateView({ value: this.props.scrollValue.__getValue(), });
  }
}

export default ScrollableTabBar;

const styles = StyleSheet.create({
  tab: {
    height: 49,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 20,
    paddingRight: 20,
  },
  container: {
    height: 50,
    borderWidth: 1,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderColor: '#ccc',
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});