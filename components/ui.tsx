import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radius, space, type } from '../lib/theme';

/** Frosted-glass surface used for every card in the app. */
export function GlassCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}) {
  return <View style={[styles.glass, style]}>{children}</View>;
}

interface ConfirmSheetProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/** Custom slide-up confirmation sheet — calmer than a system alert. */
export function ConfirmSheet({
  visible,
  title,
  message,
  confirmLabel,
  destructive,
  onConfirm,
  onClose,
}: ConfirmSheetProps) {
  const slide = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.timing(slide, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slide, {
        toValue: 0,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(() => setMounted(false));
    }
  }, [visible, slide]);

  if (!mounted) return null;

  const translateY = slide.interpolate({ inputRange: [0, 1], outputRange: [340, 0] });

  return (
    <Modal transparent visible animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.scrim, { opacity: slide }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <View style={styles.sheetWrap} pointerEvents="box-none">
        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          <View style={styles.grabber} />
          <Text style={styles.sheetTitle}>{title}</Text>
          <Text style={styles.sheetMessage}>{message}</Text>
          <Pressable accessibilityRole="button"
            style={({ pressed }) => [
              styles.sheetPrimary,
              destructive && styles.sheetPrimaryDestructive,
              pressed && styles.pressed,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
              onConfirm();
            }}
          >
            <Text
              style={[styles.sheetPrimaryText, destructive && styles.sheetPrimaryTextDestructive]}
            >
              {confirmLabel}
            </Text>
          </Pressable>
          <Pressable accessibilityRole="button"
            style={({ pressed }) => [styles.sheetSecondary, pressed && styles.pressed]}
            onPress={onClose}
          >
            <Text style={styles.sheetSecondaryText}>Not now</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  glass: {
    backgroundColor: colors.glass,
    borderColor: colors.hairline,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: space.lg,
  },
  scrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(3,4,10,0.72)',
  },
  sheetWrap: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#14152B',
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    borderColor: colors.hairline,
    borderWidth: 1,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space.xl,
    gap: space.sm,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.glassStrong,
    marginBottom: space.sm,
  },
  sheetTitle: {
    fontFamily: type.semibold,
    fontSize: 20,
    color: colors.text,
    textAlign: 'center',
  },
  sheetMessage: {
    fontFamily: type.regular,
    fontSize: 14.5,
    lineHeight: 22,
    color: colors.textDim,
    textAlign: 'center',
    marginBottom: space.md,
  },
  sheetPrimary: {
    backgroundColor: colors.glassStrong,
    borderColor: 'rgba(165,180,255,0.35)',
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: 16,
    alignItems: 'center',
  },
  sheetPrimaryDestructive: {
    borderColor: 'rgba(240,140,140,0.35)',
  },
  sheetPrimaryText: {
    fontFamily: type.semibold,
    fontSize: 16,
    color: colors.accent,
  },
  sheetPrimaryTextDestructive: {
    color: colors.danger,
  },
  sheetSecondary: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  sheetSecondaryText: {
    fontFamily: type.medium,
    fontSize: 15,
    color: colors.textFaint,
  },
  pressed: {
    opacity: 0.65,
  },
});
