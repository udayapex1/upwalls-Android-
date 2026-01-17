import { Colors } from "@/src/constants/color";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ToastProps {
  message: string;
  visible: boolean;
  onHide?: () => void;
  duration?: number;
  type?: "success" | "info" | "error";
  onPress?: () => void;
}

export default function Toast({ 
  message, 
  visible, 
  onHide, 
  duration = 3000,
  type = "info",
  onPress
}: ToastProps) {
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Mask auto-hide timer
      const timer = setTimeout(() => {
        hide();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      hide();
    }
  }, [visible]);

  const hide = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 50,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onHide) onHide();
    });
  };

  if (!visible) return null;

  const Content = (
    <View style={[styles.content, type === "success" && styles.successContent]}>
      <Ionicons 
        name={type === "success" ? "checkmark-circle" : "information-circle"} 
        size={20} 
        color={Colors.background} 
        style={styles.icon}
      />
      <Text style={styles.text}>{message}</Text>
      {onPress && (
        <Ionicons name="chevron-forward" size={16} color={Colors.background} style={{ marginLeft: 4 }} />
      )}
    </View>
  );

  return (
    <Animated.View
      style={[
        styles.container,
        {
          bottom: insets.bottom + 80, // Position above bottom tab bar if present
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      {onPress ? (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
          {Content}
        </TouchableOpacity>
      ) : (
        Content
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 20,
    right: 20,
    alignItems: "center",
    zIndex: 9999,
    pointerEvents: "box-none",
  },
  content: {
    backgroundColor: Colors.textPrimary,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    maxWidth: "90%",
  },
  successContent: {
    backgroundColor: "black",
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: "600",
  },
});
