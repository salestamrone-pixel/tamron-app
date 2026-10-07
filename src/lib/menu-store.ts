import { Animated, Easing } from 'react-native';

// Shared state of the side drawer: 0 = closed, 1 = fully open. Driven by the logo button, by an edge swipe, or by the back button.
export const menuProgress = new Animated.Value(0);
let current = 0;
menuProgress.addListener(({ value }) => {
  current = value;
});

export const isMenuOpen = () => current > 0.02;

function animate(to: number) {
  Animated.timing(menuProgress, { toValue: to, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
}

export const openMenu = () => animate(1);
export const closeMenu = () => animate(0);
