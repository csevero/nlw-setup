import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
interface ProgressBarProps {
  progress?: number;
}

export function ProgressBar({ progress = 0 }: ProgressBarProps) {
  //to animate some component that change depending of some value, we need to use the useSharedValue to create an state to use with animation
  const sharedProgress = useSharedValue(progress);

  //to create an animation style we can use the useAnimatedStyle and inside of it define the property that we need to "listen" to animate
  const style = useAnimatedStyle(() => {
    return {
      width: `${sharedProgress.value}%`,
    };
  });

  //we need to change the value of our sharedProgress always that our props value change, and we used the useEffect to it
  useEffect(() => {
    //the react reanimated has a lot of animations pre defined, we're using the withTiming that animate our component with a smooth transition
    sharedProgress.value = withTiming(progress);
  }, [progress]);

  return (
    <View className="w-full h-3 rounded-xl bg-zinc-700 mt-4">
      {/* to animate our View, we first need to change the View to Animated View, to transform it to Animated view and here we just past our style defined above */}
      <Animated.View className="h-3 rounded-xl bg-violet-600" style={style} />
    </View>
  );
}
