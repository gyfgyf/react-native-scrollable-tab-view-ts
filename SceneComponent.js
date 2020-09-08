import React from 'react';
import { View } from 'react-native';
import StaticContainer from './StaticContainer';

function SceneComponent (Props){
  const { shouldUpdated, ...props } = Props;
  return <View {...props}>
      <StaticContainer shouldUpdate={shouldUpdated}>
        {props.children}
      </StaticContainer>
  </View>;
};

export default SceneComponent;
