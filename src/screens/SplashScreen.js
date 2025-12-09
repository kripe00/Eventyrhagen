import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg';


import svgPaths from '../imports/svg-e2w07e9a0s';

const AnimatedPath = Animated.createAnimatedComponent(Path);


const Colors = {
  light: {
    background: '#4f46e5', 
    snakeBody: '#ffffff',  
    snakeHead: '#fbbf24',  
  },
  dark: {
    background: '#1e1b4b', 
    snakeBody: '#ffffff',
    snakeHead: '#4f46e5',  
  }
};

const SnakePart = ({ d, fill, delay }) => {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay * 1000), 
      Animated.timing(animValue, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true, 
      }),
    ]).start();
  }, [delay]);

  return (
    <AnimatedPath
      d={d}
      fill={fill}
      opacity={animValue}
      style={{
        transform: [{ scale: animValue }],
      }}
    />
  );
};

export default function SplashScreen({ onAnimationFinish }) {
  const scheme = useColorScheme();
  const theme = Colors[scheme] || Colors.light;

  const snakeSequence = [
    { id: 'p34a6efe0', fill: theme.snakeBody, delay: 0 },     // Bottom left
    { id: 'p2c5ad480', fill: theme.snakeBody, delay: 0.15 },  // Bottom middle
    { id: 'p3d5d0800', fill: theme.snakeBody, delay: 0.3 },   // Bottom right
    { id: 'p105f9900', fill: theme.snakeBody, delay: 0.45 },  // Middle right
    { id: 'p12716000', fill: theme.snakeBody, delay: 0.6 },   // Middle middle
    { id: 'p3a797d00', fill: theme.snakeBody, delay: 0.75 },  // Middle left
    { id: 'p125c5700', fill: theme.snakeBody, delay: 0.9 },   // Top left
    { id: 'p1953a3c0', fill: theme.snakeBody, delay: 1.05 },  // Top middle
    
    { id: 'p2ca33b80', fill: theme.snakeHead, delay: 1.2 }, 
  ];

  useEffect(() => {
    const totalDuration = 2500; 
    
    const timer = setTimeout(() => {
        if (onAnimationFinish) onAnimationFinish();
    }, totalDuration);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Setter statusbar til hvit tekst siden bakgrunnen er mørk */}
      <StatusBar barStyle="light-content" />
      
      <View style={styles.svgContainer}>
        <Svg width="100%" height="100%" viewBox="0 0 356 358">
          <Defs>
            <ClipPath id="clip0_1_19">
              {/* Dette rektangelet er bare en maske, fargen betyr ingenting her */}
              <Rect width="355.53" height="357.18" />
            </ClipPath>
          </Defs>
          <G clipPath="url(#clip0_1_19)">
            {snakeSequence.map((item) => (
              <SnakePart
                key={item.id}
                d={svgPaths[item.id]} 
                fill={item.fill}
                delay={item.delay}
              />
            ))}
          </G>
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgContainer: {
    width: 356,
    height: 358,
    maxWidth: Dimensions.get('window').width * 0.6, 
    aspectRatio: 356/358,
  }
});