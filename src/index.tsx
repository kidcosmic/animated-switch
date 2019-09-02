import * as React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import {
  Transition,
  Transitioning,
  TransitioningView
} from "react-native-reanimated";
import {
  createNavigator,
  NavigationContainer,
  NavigationDescriptor,
  NavigationRoute,
  NavigationRouteConfigMap,
  NavigationRouter,
  NavigationScreenProp,
  NavigationSwitchRouterConfig,
  SceneView,
  ScreenProps,
  SwitchRouter,
  NavigationParams
} from "react-navigation";
type SwitchRouterCreator = (
  routeConfigs: NavigationRouteConfigMap,
  config: NavigationSwitchRouterConfig
) => NavigationRouter<any, any>;

// @ts-ignore
const createSwitchRouter: SwitchRouterCreator = SwitchRouter;

const DEFAULT_TRANSITION = (
  <Transition.Together>
    <Transition.Out type="fade" durationMs={200} interpolation="easeIn" />
    <Transition.In type="fade" durationMs={200} />
  </Transition.Together>
);

interface Props {
  navigation: NavigationScreenProp<
    NavigationRoute<NavigationParams>,
    NavigationParams
  > & {
    navigationConfig: { transition?: React.ReactNode };
  };
  descriptors: { [key: string]: NavigationDescriptor };
  screenProps?: ScreenProps;
}

class AnimatedSwitchView extends React.Component<Props, {}> {
  containerRef = React.createRef<TransitioningView>();

  componentDidUpdate(prevProps: Props) {
    const { state: prevState } = prevProps.navigation;
    const prevActiveKey = prevState.routes[prevState.index].key;
    const { state } = this.props.navigation;
    const activeKey = state.routes[state.index].key;

    if (activeKey !== prevActiveKey && this.containerRef.current) {
      this.containerRef.current.animateNextTransition();
    }
  }

  render() {
    const { state, navigationConfig } = this.props.navigation;
    const activeKey = state.routes[state.index].key;
    const descriptor = this.props.descriptors[activeKey];
    const ChildComponent = descriptor.getComponent();

    const transition =
      (navigationConfig && navigationConfig.transition) || DEFAULT_TRANSITION;
    const transitionViewStyle = navigationConfig && navigationConfig.transition;

    return (
      <Transitioning.View
        ref={this.containerRef}
        transition={transition}
        style={[styles.container, transitionViewStyle]}
      >
        <SceneView
          component={ChildComponent}
          navigation={descriptor.navigation}
          screenProps={this.props.screenProps!}
        />
      </Transitioning.View>
    );
  }
}

export interface AnimatedSwitchNavigatorConfig
  extends NavigationSwitchRouterConfig {
  transition?: React.ReactNode;
  transitionViewStyle?: ViewStyle;
}

export default function createAnimatedSwitchNavigator(
  routeConfigMap: NavigationRouteConfigMap,
  switchConfig: NavigationSwitchRouterConfig & {
    transition?: React.ReactNode;
  }
): NavigationContainer {
  const router = createSwitchRouter(routeConfigMap, switchConfig);
  //@ts-ignore
  const Navigator = createNavigator(AnimatedSwitchView, router, switchConfig);

  return Navigator;
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
