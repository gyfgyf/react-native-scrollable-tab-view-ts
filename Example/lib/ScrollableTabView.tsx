import React, { Component, ReactElement } from 'react';
import {
  Dimensions,
  View,
  Animated,
  Platform,
  StyleSheet,
  ViewStyle,
  ColorValue,
  TextStyle,
  LayoutChangeEvent,
  NativeSyntheticEvent,
  NativeScrollEvent,
  PointPropType,
  ViewProps,
} from 'react-native';
import ViewPager from '@react-native-community/viewpager';
import SceneComponent from './SceneComponent';
import DefaultTabBar from './DefaultTabBar';

const AnimatedViewPagerAndroid = Animated.createAnimatedComponent(ViewPager)
const containerWidth = Dimensions.get('window').width;

interface tabBarPropsInterface {
  goToPage: Function,
  tabs: any[],
  activeTab: number,
  scrollValue: any;
  containerWidth: number;
  backgroundColor?: ColorValue;
  activeTextColor?: ColorValue;
  inactiveTextColor?: ColorValue;
  underlineStyle?: ViewStyle;
  textStyle?: TextStyle;
  style?: ViewStyle;
}

interface ScrollableTabViewProps extends ViewProps {
  tabBarPosition?: 'top' | 'bottom' | 'overlayTop' | 'overlayBottom';
  initialPage?: number;
  page?: number;
  onChangeTab?: ({ i, ref, from }: { i: number, ref: any, from: number }) => void;
  onScroll?: (offsetX: number) => void,
  renderTabBar?: any,
  tabBarUnderlineStyle?: ViewStyle,
  tabBarBackgroundColor?: ColorValue,
  tabBarActiveTextColor?: ColorValue,
  tabBarInactiveTextColor?: ColorValue,
  tabBarTextStyle?: TextStyle,
  style?: ViewStyle,
  contentProps?: object,
  scrollWithoutAnimation?: boolean,
  locked?: boolean,
  prerenderingSiblingsNumber?: number,
  children?: any;
}

interface ScrollableTabViewState {
  currentPage: number;
  scrollValue: any;
  scrollXIOS: any;
  positionAndroid: any;
  offsetAndroid: any;
  containerWidth: number;
  sceneKeys: any[];
}

class ScrollableTabView extends Component<ScrollableTabViewProps, ScrollableTabViewState>{
  scrollOnMountCalled = false;
  private scrollView: any;
  private timer: any;
  static defaultProps = {
    tabBarPosition: 'top',
    initialPage: 0,
    page: -1,
    onChangeTab: ({ i, ref, from }: { i: number, ref: any, from: number }) => { },
    onScroll: () => { },
    contentProps: {},
    scrollWithoutAnimation: false,
    locked: false,
    prerenderingSiblingsNumber: 0,
  }
  constructor(props: ScrollableTabViewProps) {
    super(props);
    const {
      scrollValue,
      scrollXIOS,
      positionAndroid,
      offsetAndroid,
    } = this.init();
    this.state = {
      // @ts-ignore: Unreachable code error
      currentPage: this.props.initialPage,
      scrollValue,
      scrollXIOS,
      positionAndroid,
      offsetAndroid,
      containerWidth,
      sceneKeys: this.newSceneKeys({ currentPage: this.props.initialPage, }),
    }
    this.renderTabBar = this.renderTabBar.bind(this);
    this.renderScrollableContent = this.renderScrollableContent.bind(this);
    this.newSceneKeys = this.newSceneKeys.bind(this);
    this._composeScenes = this._composeScenes.bind(this);
    this.updateSceneKeys = this.updateSceneKeys.bind(this);
    this._children = this._children.bind(this);
    this._handleLayout = this._handleLayout.bind(this);
    this.goToPage = this.goToPage.bind(this);
    this._shouldRenderSceneKey = this._shouldRenderSceneKey.bind(this);
    this._keyExists = this._keyExists.bind(this);
    this._onMomentumScrollBeginAndEnd = this._onMomentumScrollBeginAndEnd.bind(this);
    this._onScroll = this._onScroll.bind(this);
    this._updateSelectedPage = this._updateSelectedPage.bind(this);
  }
  init() {
    let scrollValue;
    let scrollXIOS;
    let positionAndroid;
    let offsetAndroid;
    if (Platform.OS === 'ios') {
      // @ts-ignore: Unreachable code error
      scrollXIOS = new Animated.Value(this.props.initialPage * containerWidth);
      const containerWidthAnimatedValue = new Animated.Value(containerWidth);
      // Need to call __makeNative manually to avoid a native animated bug. See
      // https://github.com/facebook/react-native/pull/14435
      // @ts-ignore: Unreachable code error
      containerWidthAnimatedValue.__makeNative();
      scrollValue = Animated.divide(scrollXIOS, containerWidthAnimatedValue);

      const callListeners = this._polyfillAnimatedValue(scrollValue);
      scrollXIOS.addListener(
        ({ value, }) => callListeners(value / this.state.containerWidth)
      );
    } else {
      // @ts-ignore: Unreachable code error
      positionAndroid = new Animated.Value(this.props.initialPage);
      offsetAndroid = new Animated.Value(0);
      scrollValue = Animated.add(positionAndroid, offsetAndroid);

      const callListeners = this._polyfillAnimatedValue(scrollValue);
      let positionAndroidValue = this.props.initialPage;
      let offsetAndroidValue = 0;
      // @ts-ignore: Unreachable code error
      positionAndroid.addListener(({ value, }) => {
        positionAndroidValue = value;
        // @ts-ignore: Unreachable code error
        callListeners(positionAndroidValue + offsetAndroidValue);
      });
      offsetAndroid.addListener(({ value, }) => {
        offsetAndroidValue = value;
        // @ts-ignore: Unreachable code error
        callListeners(positionAndroidValue + offsetAndroidValue);
      });
    }
    return {
      scrollValue,
      scrollXIOS,
      positionAndroid,
      offsetAndroid,
    }
  }
  componentDidUpdate(prevProps: ScrollableTabViewProps) {
    if (this.props.children !== prevProps.children) {
      this.updateSceneKeys({ page: this.state.currentPage, children: this.props.children, });
    }
    // @ts-ignore: Unreachable code error
    if (this.props.page >= 0 && this.props.page !== this.state.currentPage) {
      // @ts-ignore: Unreachable code error
      this.goToPage(this.props.page);
    }
    if (this.props.initialPage !== prevProps.initialPage) {
      const {
        scrollXIOS,
        scrollValue,
      } = this.init();
      if (!this.props.renderTabBar) {
        this.setState({scrollXIOS})
      }
      // @ts-ignore: Unreachable code error
      this.setState({
        scrollValue,
        currentPage: this.props.initialPage,
      }, () => {
        // @ts-ignore: Unreachable code error
        this.goToPage(this.state.currentPage);
      });

    }
  }
  componentWillUnmount() {
    if (Platform.OS === 'ios') {
      this.state.scrollXIOS.removeAllListeners();
    } else {
      this.state.positionAndroid.removeAllListeners();
      this.state.offsetAndroid.removeAllListeners();
    }
    cancelAnimationFrame(this.timer);
  }
  goToPage(pageNumber: number) {
    if (Platform.OS === 'ios') {
      const offset = pageNumber * this.state.containerWidth;
      if (this.scrollView) {
        this.scrollView.scrollTo({ x: offset, y: 0, animated: !this.props.scrollWithoutAnimation, });
      }
    } else {
      if (this.scrollView) {
        if (this.props.scrollWithoutAnimation) {
          this.scrollView.setPageWithoutAnimation(pageNumber);
        } else {
          this.scrollView.setPage(pageNumber);
        }
      }
    }

    const currentPage = this.state.currentPage;
    this.updateSceneKeys({
      page: pageNumber,
      callback: this._onChangeTab.bind(this, currentPage, pageNumber),
    });
  }
  renderTabBar(tabBarProps: tabBarPropsInterface) {
    if (this.props.renderTabBar === false) {
      return null;
    } else if (this.props.renderTabBar) {
      return React.cloneElement(this.props.renderTabBar(tabBarProps), tabBarProps);
    } else {
      return <DefaultTabBar {...tabBarProps} />;
    }
  }
  updateSceneKeys({ page = 0, children = this.props.children, callback = () => { }, }) {
    let newKeys = this.newSceneKeys({ previousKeys: this.state.sceneKeys as any, currentPage: page, children, });
    this.setState({ currentPage: page, sceneKeys: newKeys, }, callback);
  }
  newSceneKeys({ previousKeys = [], currentPage = 0, children = this.props.children, }) {
    let newKeys: string[] = [];
    this._children().forEach((child: ReactElement, idx: number) => {
      let key = this._makeSceneKey(child, idx);
      if (this._keyExists(previousKeys, key) ||
        this._shouldRenderSceneKey(idx, currentPage)) {
        newKeys.push(key);
      }
    });
    return newKeys;
  }
  // Animated.add and Animated.divide do not currently support listeners so
  // we have to polyfill it here since a lot of code depends on being able
  // to add a listener to `scrollValue`. See https://github.com/facebook/react-native/pull/12620.
  _polyfillAnimatedValue(animatedValue: any) {

    const listeners = new Set();
    const addListener = (listener: Animated.ValueListenerCallback) => {
      listeners.add(listener);
    };

    const removeListener = (listener: Animated.ValueListenerCallback) => {
      listeners.delete(listener);
    };

    const removeAllListeners = () => {
      listeners.clear();
    };

    animatedValue.addListener = addListener;
    animatedValue.removeListener = removeListener;
    animatedValue.removeAllListeners = removeAllListeners;

    return (value: number) => listeners.forEach((listener: any) => listener({ value, }));
  }
  _shouldRenderSceneKey(idx: number, currentPageKey: number) {
    let numOfSibling = this.props.prerenderingSiblingsNumber || 0;
    return (idx < (currentPageKey + numOfSibling + 1) &&
      idx > (currentPageKey - numOfSibling - 1));
  }
  _keyExists(sceneKeys: string[], key: string) {
    return sceneKeys.find((sceneKey) => key === sceneKey);
  }

  _makeSceneKey(child: ReactElement, idx: number) {
    return child.props && child.props.tabLabel + '_' + idx;
  }
  renderScrollableContent() {
    if (Platform.OS === 'ios') {
      const scenes = this._composeScenes();
      return (
        <Animated.ScrollView
          horizontal
          pagingEnabled
          automaticallyAdjustContentInsets={false}
          // @ts-ignore: Unreachable code error
          contentOffset={{ x: this.props.initialPage * this.state.containerWidth, } as PointPropType}
          ref={(ref: React.RefObject<unknown>) => { this.scrollView = ref; }}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: this.state.scrollXIOS, }, }, },],
            { useNativeDriver: true, listener: this._onScroll, }
          )}
          onMomentumScrollBegin={this._onMomentumScrollBeginAndEnd}
          onMomentumScrollEnd={this._onMomentumScrollBeginAndEnd}
          scrollEventThrottle={16}
          scrollsToTop={false}
          showsHorizontalScrollIndicator={false}
          scrollEnabled={!this.props.locked}
          directionalLockEnabled
          alwaysBounceVertical={false}
          keyboardDismissMode="on-drag"
          {...this.props.contentProps}
        >
          {scenes}
        </Animated.ScrollView>
      )
    } else {
      const scenes = this._composeScenes();
      return <AnimatedViewPagerAndroid
        key={this._children().length}
        style={styles.scrollableContentAndroid}
        initialPage={this.props.initialPage}
        onPageSelected={this._updateSelectedPage}
        keyboardDismissMode="on-drag"
        scrollEnabled={!this.props.locked}
        onPageScroll={Animated.event(
          [{
            nativeEvent: {
              position: this.state.positionAndroid,
              offset: this.state.offsetAndroid,
            },
          },],
          {
            useNativeDriver: true,
            listener: this._onScroll,
          },
        )}
        ref={(ref: ((instance: unknown) => void) | React.RefObject<unknown> | ((instance: ViewPager | Animated.LegacyRef<ViewPager> | null) => void) | React.RefObject<ViewPager | Animated.LegacyRef<ViewPager>> | null | undefined) => { this.scrollView = ref; }}
        {...this.props.contentProps}
      >
        {scenes}
      </AnimatedViewPagerAndroid>;
    }
  }
  _composeScenes() {
    return this._children().map((child: ReactElement, idx: number) => {
      let key = this._makeSceneKey(child, idx);
      return (
        <SceneComponent
          key={child.key}
          shouldUpdated={this._shouldRenderSceneKey(idx, this.state.currentPage)}
          style={{ width: this.state.containerWidth, }}
        >
          {this._keyExists(this.state.sceneKeys, key) ? child : <View />}
        </SceneComponent>
      )
    });
  }

  _onMomentumScrollBeginAndEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const offsetX = e.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / this.state.containerWidth);
    if (this.state.currentPage !== page) {
      this._updateSelectedPage(page);
    }
  }

  _updateSelectedPage(nextPage: any) {
    let localNextPage = nextPage;
    if (typeof localNextPage === 'object') {
      localNextPage = nextPage.nativeEvent.position;
    }

    const currentPage = this.state.currentPage;
    this.updateSceneKeys({
      page: localNextPage,
      callback: this._onChangeTab.bind(this, currentPage, localNextPage),
    });
  }

  _onChangeTab(prevPage: number, currentPage: number) {
    this.props.onChangeTab && this.props.onChangeTab({
      i: currentPage,
      ref: this._children()[currentPage],
      from: prevPage,
    });
  }

  _onScroll(e: any) {
    if (Platform.OS === 'ios') {
      const offsetX = e.nativeEvent.contentOffset.x;
      if (offsetX === 0 && !this.scrollOnMountCalled) {
        this.scrollOnMountCalled = true;
      } else {
        this.props.onScroll && this.props.onScroll(offsetX / this.state.containerWidth);
      }
    } else {
      const { position, offset, } = e.nativeEvent;
      this.props.onScroll && this.props.onScroll(position + offset);
    }
  }

  _handleLayout(e: LayoutChangeEvent) {
    const { width, } = e.nativeEvent.layout;

    if (!width || width <= 0 || Math.round(width) === Math.round(this.state.containerWidth)) {
      return;
    }

    if (Platform.OS === 'ios') {
      const containerWidthAnimatedValue = new Animated.Value(width);
      // Need to call __makeNative manually to avoid a native animated bug. See
      // https://github.com/facebook/react-native/pull/14435
      // @ts-ignore: Unreachable code error
      containerWidthAnimatedValue.__makeNative();
      const scrollValue = Animated.divide(this.state.scrollXIOS, containerWidthAnimatedValue);
      this.setState({ containerWidth: width, scrollValue, });
    } else {
      this.setState({ containerWidth: width, });
    }

    this.timer = requestAnimationFrame(() => {
      this.goToPage(this.state.currentPage);
    });
  }

  _children(children = this.props.children) {
    return React.Children.map(children, (child: ReactElement) => child);
  }

  render() {
    let overlayTabs = (this.props.tabBarPosition === 'overlayTop' || this.props.tabBarPosition === 'overlayBottom');
    let tabBarProps: tabBarPropsInterface = {
      goToPage: this.goToPage,
      tabs: this._children().map((child: ReactElement) => child.props.tabLabel),
      activeTab: this.state.currentPage,
      scrollValue: this.state.scrollValue,
      containerWidth: this.state.containerWidth,
    };

    if (this.props.tabBarBackgroundColor) {
      tabBarProps.backgroundColor = this.props.tabBarBackgroundColor;
    }
    if (this.props.tabBarActiveTextColor) {
      tabBarProps.activeTextColor = this.props.tabBarActiveTextColor;
    }
    if (this.props.tabBarInactiveTextColor) {
      tabBarProps.inactiveTextColor = this.props.tabBarInactiveTextColor;
    }
    if (this.props.tabBarTextStyle) {
      tabBarProps.textStyle = this.props.tabBarTextStyle;
    }
    if (this.props.tabBarUnderlineStyle) {
      tabBarProps.underlineStyle = this.props.tabBarUnderlineStyle;
    }
    if (overlayTabs) {
      tabBarProps.style = {
        position: 'absolute',
        left: 0,
        right: 0,
        [this.props.tabBarPosition === 'overlayTop' ? 'top' : 'bottom']: 0,
      };
    }
    const style: ViewStyle = {
      ...styles.container,
      ...this.props.style,
    }
    return (
      <View style={style} onLayout={this._handleLayout}>
        {this.props.tabBarPosition === 'top' && this.renderTabBar(tabBarProps)}
        {this.renderScrollableContent()}
        {(this.props.tabBarPosition === 'bottom' || overlayTabs) && this.renderTabBar(tabBarProps)}
      </View>
    )
  }
}

export default ScrollableTabView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollableContentAndroid: {
    flex: 1,
  },
});
