import {
  Image,
  ImageBackground,
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  Animated,
  Platform,
} from "react-native";
import React, { useRef, useState, useEffect } from "react";
import {
  PinchGestureHandler,
  TapGestureHandler,
  PanGestureHandler,
  State,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Feather";
import { IMAGES } from "../../assets/images";
import { GlobalStyleSheet } from "../../shared/constants/GlobalStyleSheet";
import { COLORS } from "../../shared/constants/theme";
import TextField from "../../shared/components/customText/TextField";
import { Fonts } from "../../assets/fonts/fonts";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const MIN_SCALE = 1;
const MAX_SCALE = 5;
const DOUBLE_TAP_SCALE = 2.5;

const GroundViewer = () => {
  const routes = useRoute<any>();
  const { imgDocument } = routes?.params;

  const [baseScale, setBaseScale] = useState(1);
  const [baseTranslateX, setBaseTranslateX] = useState(0);
  const [baseTranslateY, setBaseTranslateY] = useState(0);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [showControls, setShowControls] = useState(false);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  const baseScaleAnimated = useRef(new Animated.Value(1)).current;
  const baseTranslateXAnimated = useRef(new Animated.Value(0)).current;
  const baseTranslateYAnimated = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const lastScale = useRef(1);
  const lastTranslateX = useRef(0);
  const lastTranslateY = useRef(0);
  const lastTapTime = useRef(0);
  const lastTapPosition = useRef({ x: 0, y: 0 });

  const pinchRef = useRef(null);
  const panRef = useRef(null);
  const doubleTapRef = useRef(null);

  // Auto-hide controls after 2 seconds
  const startControlsTimeout = () => {
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    setShowControls(true);
    if (baseScale !== 1 || baseTranslateX !== 0 || baseTranslateY !== 0) {
      const timeout = setTimeout(() => {
        setShowControls(false);
      }, 2000);
      setControlsTimeout(timeout);
    }
  };

  useEffect(() => {
    return () => {
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
    };
  }, [controlsTimeout]);

  useEffect(() => {
    if (baseScale !== 1 || baseTranslateX !== 0 || baseTranslateY !== 0) {
      startControlsTimeout();
    } else {
      setShowControls(false);
    }
  }, [baseScale, baseTranslateX, baseTranslateY]);

  // Constrain translation within bounds
  const constrainTranslation = (
    tx: number,
    ty: number,
    currentScale: number
  ) => {
    if (imageSize.width === 0 || imageSize.height === 0) {
      return { x: tx, y: ty };
    }

    const scaledWidth = imageSize.width * currentScale;
    const scaledHeight = imageSize.height * currentScale;

    const maxTranslateX = Math.max(0, (scaledWidth - SCREEN_WIDTH) / 2);
    const maxTranslateY = Math.max(0, (scaledHeight - SCREEN_HEIGHT) / 2);

    const constrainedX = Math.max(-maxTranslateX, Math.min(maxTranslateX, tx));
    const constrainedY = Math.max(-maxTranslateY, Math.min(maxTranslateY, ty));

    return { x: constrainedX, y: constrainedY };
  };

  // Handle pinch gesture
  const onPinchGestureEvent = Animated.event(
    [{ nativeEvent: { scale: scale } }],
    {
      useNativeDriver: true,
      listener: (event: any) => {
        const newScale = lastScale.current * event.nativeEvent.scale;
        if (newScale < MIN_SCALE || newScale > MAX_SCALE) {
          return;
        }
      },
    }
  );

  const onPinchHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const newScale = Math.max(
        MIN_SCALE,
        Math.min(MAX_SCALE, lastScale.current * event.nativeEvent.scale)
      );
      lastScale.current = newScale;
      setBaseScale(newScale);
      baseScaleAnimated.setValue(newScale);
      scale.setValue(1);

      // Constrain translation after scale change
      const constrained = constrainTranslation(
        lastTranslateX.current,
        lastTranslateY.current,
        newScale
      );
      lastTranslateX.current = constrained.x;
      lastTranslateY.current = constrained.y;
      setBaseTranslateX(constrained.x);
      setBaseTranslateY(constrained.y);
      baseTranslateXAnimated.setValue(constrained.x);
      baseTranslateYAnimated.setValue(constrained.y);
      translateX.setValue(0);
      translateY.setValue(0);

      startControlsTimeout();
    }
  };

  // Handle pan gesture (for dragging when zoomed)
  const onPanGestureEvent = Animated.event(
    [
      {
        nativeEvent: {
          translationX: translateX,
          translationY: translateY,
        },
      },
    ],
    { useNativeDriver: true }
  );

  const onPanHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const newTranslateX =
        lastTranslateX.current + event.nativeEvent.translationX;
      const newTranslateY =
        lastTranslateY.current + event.nativeEvent.translationY;

      const constrained = constrainTranslation(
        newTranslateX,
        newTranslateY,
        lastScale.current
      );

      lastTranslateX.current = constrained.x;
      lastTranslateY.current = constrained.y;
      setBaseTranslateX(constrained.x);
      setBaseTranslateY(constrained.y);
      baseTranslateXAnimated.setValue(constrained.x);
      baseTranslateYAnimated.setValue(constrained.y);
      translateX.setValue(0);
      translateY.setValue(0);

      startControlsTimeout();
    }
  };

  // Handle double tap
  const onDoubleTap = (event: any) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      const now = Date.now();
      const { x, y } = event.nativeEvent;
      const DOUBLE_TAP_DELAY = 300;

      if (
        now - lastTapTime.current < DOUBLE_TAP_DELAY &&
        Math.abs(x - lastTapPosition.current.x) < 50 &&
        Math.abs(y - lastTapPosition.current.y) < 50
      ) {
        // Double tap detected
        const newScale = baseScale === 1 ? DOUBLE_TAP_SCALE : 1;
        const targetScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));

        Animated.parallel([
          Animated.timing(scale, {
            toValue: targetScale,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          lastScale.current = targetScale;
          lastTranslateX.current = 0;
          lastTranslateY.current = 0;
          setBaseScale(targetScale);
          setBaseTranslateX(0);
          setBaseTranslateY(0);
          baseScaleAnimated.setValue(targetScale);
          baseTranslateXAnimated.setValue(0);
          baseTranslateYAnimated.setValue(0);
          scale.setValue(1);
          translateX.setValue(0);
          translateY.setValue(0);
          startControlsTimeout();
        });
      } else {
        // Single tap - toggle controls
        setShowControls((prev) => !prev);
        if (!showControls) {
          startControlsTimeout();
        }
      }

      lastTapTime.current = now;
      lastTapPosition.current = { x, y };
    }
  };

  // Zoom in
  const handleZoomIn = () => {
    const newScale = Math.min(MAX_SCALE, baseScale * 1.5);
    Animated.parallel([
      Animated.timing(baseScaleAnimated, {
        toValue: newScale,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      lastScale.current = newScale;
      setBaseScale(newScale);

      // Constrain translation
      const constrained = constrainTranslation(
        lastTranslateX.current,
        lastTranslateY.current,
        newScale
      );
      lastTranslateX.current = constrained.x;
      lastTranslateY.current = constrained.y;
      setBaseTranslateX(constrained.x);
      setBaseTranslateY(constrained.y);
      baseTranslateXAnimated.setValue(constrained.x);
      baseTranslateYAnimated.setValue(constrained.y);

      startControlsTimeout();
    });
  };

  // Zoom out
  const handleZoomOut = () => {
    const newScale = Math.max(MIN_SCALE, baseScale / 1.5);
    Animated.parallel([
      Animated.timing(baseScaleAnimated, {
        toValue: newScale,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      lastScale.current = newScale;
      setBaseScale(newScale);

      // Reset translation if zoomed out to minimum
      if (newScale === 1) {
        lastTranslateX.current = 0;
        lastTranslateY.current = 0;
        setBaseTranslateX(0);
        setBaseTranslateY(0);
        baseTranslateXAnimated.setValue(0);
        baseTranslateYAnimated.setValue(0);
      } else {
        const constrained = constrainTranslation(
          lastTranslateX.current,
          lastTranslateY.current,
          newScale
        );
        lastTranslateX.current = constrained.x;
        lastTranslateY.current = constrained.y;
        setBaseTranslateX(constrained.x);
        setBaseTranslateY(constrained.y);
        baseTranslateXAnimated.setValue(constrained.x);
        baseTranslateYAnimated.setValue(constrained.y);
      }
      startControlsTimeout();
    });
  };

  // Reset zoom and position
  const handleReset = () => {
    Animated.parallel([
      Animated.timing(baseScaleAnimated, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(baseTranslateXAnimated, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(baseTranslateYAnimated, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      lastScale.current = 1;
      lastTranslateX.current = 0;
      lastTranslateY.current = 0;
      setBaseScale(1);
      setBaseTranslateX(0);
      setBaseTranslateY(0);
      scale.setValue(1);
      translateX.setValue(0);
      translateY.setValue(0);
      setShowControls(false);
    });
  };

  const isZoomed =
    baseScale !== 1 || baseTranslateX !== 0 || baseTranslateY !== 0;

  return (
    <ImageBackground
      source={IMAGES.backgroundImg}
      resizeMode="cover"
      style={GlobalStyleSheet.bgImage}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.container}>
          <PinchGestureHandler
            ref={pinchRef}
            onGestureEvent={onPinchGestureEvent}
            onHandlerStateChange={onPinchHandlerStateChange}
            simultaneousHandlers={[panRef, doubleTapRef]}
          >
            <Animated.View style={styles.imageContainer}>
              <PanGestureHandler
                ref={panRef}
                onGestureEvent={onPanGestureEvent}
                onHandlerStateChange={onPanHandlerStateChange}
                enabled={baseScale > 1}
                simultaneousHandlers={[pinchRef, doubleTapRef]}
              >
                <Animated.View style={styles.imageWrapper}>
                  <TapGestureHandler
                    ref={doubleTapRef}
                    onHandlerStateChange={onDoubleTap}
                    numberOfTaps={2}
                    simultaneousHandlers={[pinchRef, panRef]}
                  >
                    <Animated.View
                      style={[
                        styles.imageInnerWrapper,
                        {
                          transform: [
                            {
                              scale: Animated.multiply(
                                baseScaleAnimated,
                                scale
                              ),
                            },
                            {
                              translateX: Animated.add(
                                baseTranslateXAnimated,
                                translateX
                              ),
                            },
                            {
                              translateY: Animated.add(
                                baseTranslateYAnimated,
                                translateY
                              ),
                            },
                          ],
                        },
                      ]}
                    >
                      <Image
                        source={{ uri: imgDocument }}
                        resizeMode="contain"
                        style={styles.image}
                        onLoad={(e) => {
                          const { width, height } = e.nativeEvent.source;
                          const imageAspectRatio = width / height;
                          const screenAspectRatio =
                            SCREEN_WIDTH / SCREEN_HEIGHT;

                          let displayWidth = SCREEN_WIDTH;
                          let displayHeight = SCREEN_HEIGHT;

                          if (imageAspectRatio > screenAspectRatio) {
                            // Image is wider
                            displayHeight = SCREEN_WIDTH / imageAspectRatio;
                          } else {
                            // Image is taller
                            displayWidth = SCREEN_HEIGHT * imageAspectRatio;
                          }

                          setImageSize({
                            width: displayWidth,
                            height: displayHeight,
                          });
                        }}
                      />
                    </Animated.View>
                  </TapGestureHandler>
                </Animated.View>
              </PanGestureHandler>
            </Animated.View>
          </PinchGestureHandler>

          {/* Control Bar */}
          {isZoomed && (
            <Animated.View
              style={[
                styles.controlBar,
                {
                  opacity: showControls ? 1 : 0,
                },
              ]}
            >
              <View style={styles.controlBarContent}>
                {/* Zoom Level Indicator */}
                <View style={styles.zoomIndicator}>
                  <Icon name="zoom-in" size={20} color={COLORS.green} />
                  <TextField
                    text={`${Math.round(baseScale * 100)}%`}
                    color={COLORS.green}
                    fontSize={16}
                    fontFamily={Fonts.heading}
                    fontWeight="bold"
                  />
                </View>

                {/* Control Buttons */}
                <View style={styles.controlButtons}>
                  {/* Zoom Out */}
                  {baseScale > MIN_SCALE && (
                    <TouchableOpacity
                      style={styles.controlButton}
                      onPress={handleZoomOut}
                      activeOpacity={0.7}
                    >
                      <Icon name="zoom-out" size={24} color="#666" />
                    </TouchableOpacity>
                  )}

                  {/* Zoom In */}
                  {baseScale < MAX_SCALE && (
                    <TouchableOpacity
                      style={styles.controlButton}
                      onPress={handleZoomIn}
                      activeOpacity={0.7}
                    >
                      <Icon name="zoom-in" size={24} color={COLORS.green} />
                    </TouchableOpacity>
                  )}

                  {/* Divider */}
                  {(baseScale > MIN_SCALE || baseScale < MAX_SCALE) && (
                    <View style={styles.divider} />
                  )}

                  {/* Reset Button */}
                  {(baseScale !== 1 ||
                    baseTranslateX !== 0 ||
                    baseTranslateY !== 0) && (
                    <TouchableOpacity
                      style={styles.controlButton}
                      onPress={handleReset}
                      activeOpacity={0.7}
                    >
                      <Icon name="refresh-cw" size={24} color={COLORS.green} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </Animated.View>
          )}
        </View>
      </GestureHandlerRootView>
    </ImageBackground>
  );
};

export default GroundViewer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  imageWrapper: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  imageInnerWrapper: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  controlBar: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  controlBarContent: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(0, 0, 0, 0.08)",
  },
  zoomIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  controlButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  controlButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
});
