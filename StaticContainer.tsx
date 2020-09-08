import React from 'react';

interface StaticContainerProps{
  shouldUpdate: any;
}
class StaticContainer extends React.Component<StaticContainerProps> {

  shouldComponentUpdate(nextProps: any): boolean {
    return !!nextProps.shouldUpdate;
  }

  render() {
    var child = this.props.children;
    if (child === null || child === false) {
      return null;
    }
    return React.Children.only(child);
  }

}
export default StaticContainer;
