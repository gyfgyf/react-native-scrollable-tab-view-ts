import React from 'react';
import { Text, TouchableHighlight } from 'react-native';
import { ScrollableTabView, ScrollableTabBar } from './lib';
 
export default class DynamicExample extends React.Component{
  
  constructor(props) {
    super(props);
    this.state = {
      tabs: [1, 2]
    }
    this.handleChangeTab = this.handleChangeTab.bind(this);
    this.renderTab = this.renderTab.bind(this);
    this.children = {};
  }
  componentDidMount() {
    this.timer =setTimeout(
      () => { this.setState({ tabs: [1, 2, 3, 4, 5, 6,7,8 ], }); },
      100
    );
  }
  componentWillUnmount() {
    clearTimeout(this.timer);
 }
  handleChangeTab({i, ref, from, }) {
    this.children[i].onEnter();
    this.children[from].onLeave();
  }

  renderTab(name, page, isTabActive, onPressHandler, onLayoutHandler) {
    return <TouchableHighlight
      key={`${name}_${page}`}
      onPress={() => onPressHandler(page)}
      onLayout={onLayoutHandler}
      style={{flex: 1, width: 100, }}
      underlayColor="#aaaaaa"
    >
      <Text>{name}</Text>
    </TouchableHighlight>
  }

  render() {
    return <ScrollableTabView
      style={{marginTop: 20, }}
      renderTabBar={() => <ScrollableTabBar renderTab={this.renderTab}/>}
      onChangeTab={this.handleChangeTab}
    >
      {this.state.tabs.map((tab, i) => {
        return <Child
          ref={(ref) => (this.children[i] = ref)}
          tabLabel={`tab${i}`}
          i={i}
          key={i}
        />;
      })}
    </ScrollableTabView>
  }
}
class Child extends React.Component{
  onEnter() {
    console.log('enter: ' + this.props.i); // eslint-disable-line no-console
  }
  onLeave() {
    console.log('leave: ' + this.props.i); // eslint-disable-line no-console
  }

  render() {
    const i = this.props.i;
    return <Text key={i}>{`tab${i}`}</Text>;
  }
};

