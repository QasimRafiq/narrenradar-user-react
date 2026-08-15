import React, { useRef, useState, useEffect } from "react";
import {
  Image,
  ImageBackground,
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  Animated,
  Platform,
  LayoutChangeEvent,
} from "react-native";
import { COLORS } from "../../shared/constants/theme"; 
import FastImage from "react-native-fast-image"; 
import {
  PinchGestureHandler,
  TapGestureHandler,
  PanGestureHandler,
  State,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { useRoute, useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Feather";
import AntDesign from "react-native-vector-icons/AntDesign";
import { IMAGES } from "../../assets/images";
import { GlobalStyleSheet } from "../../shared/constants/GlobalStyleSheet";
import TextField from "../../shared/components/customText/TextField";
import { Fonts } from "../../assets/fonts/fonts";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const MIN_SCALE = 1;
const MAX_SCALE = 5;
const DOUBLE_TAP_SCALE = 2.5;

const GroundViewer = () => {
  const routes = useRoute<any>();
  const navigation = useNavigation<any>();
  const { imgDocument } = routes?.params;

  const [baseScale, setBaseScale] = useState(1);
  const [baseTranslateX, setBaseTranslateX] = useState(0);
  const [baseTranslateY, setBaseTranslateY] = useState(0);

  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [containerSize, setContainerSize] = useState({
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  });

  const [showControls, setShowControls] = useState(false);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  const baseScaleAnimated = useRef(new Animated.Value(1)).current;
  const baseTranslateXAnimated = useRef(new Animated.Value(0)).current;
  const baseTranslateYAnimated = useRef(new Animated.Value(0)).current;

  const pinchScale = useRef(new Animated.Value(1)).current;
  const panTranslateX = useRef(new Animated.Value(0)).current;
  const panTranslateY = useRef(new Animated.Value(0)).current;

  const lastScale = useRef(1);
  const lastTranslateX = useRef(0);
  const lastTranslateY = useRef(0);

  const lastTapTime = useRef(0);
  const lastTapPosition = useRef({ x: 0, y: 0 });

  const pinchRef = useRef(null);
  const panRef = useRef(null);
  const doubleTapRef = useRef(null);

  // Auto-hide controls
  const startControlsTimeout = () => {
    if (controlsTimeout) clearTimeout(controlsTimeout);

    setShowControls(true);

    if (baseScale !== 1 || baseTranslateX !== 0 || baseTranslateY !== 0) {
      const t = setTimeout(() => setShowControls(false), 2000);
      setControlsTimeout(t);
    }
  };

  useEffect(() => {
    return () => {
      if (controlsTimeout) clearTimeout(controlsTimeout);
    };
  }, [controlsTimeout]);

  useEffect(() => {
    if (baseScale !== 1 || baseTranslateX !== 0 || baseTranslateY !== 0) {
      startControlsTimeout();
    } else {
      setShowControls(false);
    }
  }, [baseScale, baseTranslateX, baseTranslateY]);

  const onContainerLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setContainerSize({ width, height });
  };

  // Clamp pan so the zoomed image never leaves the screen
  const constrainTranslation = (
    tx: number,
    ty: number,
    currentScale: number
  ) => {
    const { width: cw, height: ch } = containerSize;
    const iw = imageSize.width || cw;
    const ih = imageSize.height || ch;

    if (!cw || !ch || !iw || !ih) return { x: tx, y: ty };

    const scaledWidth = iw * currentScale;
    const scaledHeight = ih * currentScale;

    let maxTranslateX = 0;
    let maxTranslateY = 0;

    if (scaledWidth > cw) {
      maxTranslateX = (scaledWidth - cw) / 2;
    } else {
      tx = 0;
    }

    if (scaledHeight > ch) {
      maxTranslateY = (scaledHeight - ch) / 2;
    } else {
      ty = 0;
    }

    const constrainedX = Math.max(-maxTranslateX, Math.min(maxTranslateX, tx));
    const constrainedY = Math.max(-maxTranslateY, Math.min(maxTranslateY, ty));

    return { x: constrainedX, y: constrainedY };
  };

  // Pinch
  const onPinchGestureEvent = Animated.event(
    [{ nativeEvent: { scale: pinchScale } }],
    { useNativeDriver: true }
  );

  const onPinchHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const rawScale = lastScale.current * event.nativeEvent.scale;
      const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, rawScale));

      lastScale.current = newScale;
      setBaseScale(newScale);
      baseScaleAnimated.setValue(newScale);
      pinchScale.setValue(1);

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

      panTranslateX.setValue(0);
      panTranslateY.setValue(0);

      startControlsTimeout();
    }
  };

  // Pan
  const onPanGestureEvent = Animated.event(
    [
      {
        nativeEvent: {
          translationX: panTranslateX,
          translationY: panTranslateY,
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

      panTranslateX.setValue(0);
      panTranslateY.setValue(0);

      startControlsTimeout();
    }
  };

  // Double tap
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
        const newScale = baseScale === 1 ? DOUBLE_TAP_SCALE : 1;
        const targetScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));

        Animated.parallel([
          Animated.timing(baseScaleAnimated, {
            toValue: targetScale,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(baseTranslateXAnimated, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(baseTranslateYAnimated, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start(() => {
          lastScale.current = targetScale;
          lastTranslateX.current = 0;
          lastTranslateY.current = 0;
          setBaseScale(targetScale);
          setBaseTranslateX(0);
          setBaseTranslateY(0);
          pinchScale.setValue(1);
          panTranslateX.setValue(0);
          panTranslateY.setValue(0);
          startControlsTimeout();
        });
      } else {
        setShowControls((prev) => !prev);
        if (!showControls) startControlsTimeout();
      }

      lastTapTime.current = now;
      lastTapPosition.current = { x, y };
    }
  };

  // Buttons
  const handleZoomIn = () => {
    const newScale = Math.min(MAX_SCALE, baseScale * 1.5);

    Animated.timing(baseScaleAnimated, {
      toValue: newScale,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      lastScale.current = newScale;
      setBaseScale(newScale);

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

  const handleZoomOut = () => {
    const newScale = Math.max(MIN_SCALE, baseScale / 1.5);

    Animated.timing(baseScaleAnimated, {
      toValue: newScale,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      lastScale.current = newScale;
      setBaseScale(newScale);

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

  const handleReset = () => {
    Animated.parallel([
      Animated.timing(baseScaleAnimated, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(baseTranslateXAnimated, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(baseTranslateYAnimated, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      lastScale.current = 1;
      lastTranslateX.current = 0;
      lastTranslateY.current = 0;
      setBaseScale(1);
      setBaseTranslateX(0);
      setBaseTranslateY(0);
      pinchScale.setValue(1);
      panTranslateX.setValue(0);
      panTranslateY.setValue(0);
      setShowControls(false);
    });
  };

  const isZoomed =
    baseScale !== 1 || baseTranslateX !== 0 || baseTranslateY !== 0;

  const iw = imageSize.width || containerSize.width;
  const ih = imageSize.height || containerSize.height;

  // ✅ Only allow panning if zoomed image is bigger than screen on at least one axis
  const canPan =
    baseScale * iw > containerSize.width ||
    baseScale * ih > containerSize.height;

  return (
    <ImageBackground
      source={IMAGES.backgroundImg}
      resizeMode="cover"
      style={GlobalStyleSheet.bgImage}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.container} onLayout={onContainerLayout}>
          {/* Close Button - Always visible */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <AntDesign name="close" size={18} color={COLORS.white} />
          </TouchableOpacity>
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
                enabled={canPan}                 // 👈 HERE
                simultaneousHandlers={[pinchRef, doubleTapRef]}
              >
                <Animated.View style={styles.imageWrapper}>
                  <TapGestureHandler
                    ref={doubleTapRef}
                    numberOfTaps={2}
                    onHandlerStateChange={onDoubleTap}
                    simultaneousHandlers={[pinchRef, panRef]}
                  >
                    {/* OUTER: translation only */}
                    <Animated.View
                      style={{
                        width: containerSize.width,
                        height: containerSize.height,
                        justifyContent: "center",
                        alignItems: "center",
                        transform: [
                          {
                            translateX: Animated.add(
                              baseTranslateXAnimated,
                              panTranslateX
                            ),
                          },
                          {
                            translateY: Animated.add(
                              baseTranslateYAnimated,
                              panTranslateY
                            ),
                          },
                        ],
                      }}
                    >
                      {/* INNER: image scaling only */}
                      <Animated.View
                        style={{
                          width: iw,
                          height: ih,
                          transform: [
                            {
                              scale: Animated.multiply(
                                baseScaleAnimated,
                                pinchScale
                              ),
                            },
                          ],
                        }}
                      >
                        <FastImage
                          source={{
                            uri: imgDocument,
                            priority: FastImage.priority.high,
                            cache: FastImage.cacheControl.immutable,
                          }}
                          resizeMode={FastImage.resizeMode.contain}
                          style={{ width: "100%", height: "100%" }}
                          onLoad={(e: any) => {
                            const width = e.nativeEvent?.width || e.nativeEvent?.source?.width;
                            const height = e.nativeEvent?.height || e.nativeEvent?.source?.height;
                            if (!width || !height) return;

                            const imageAspectRatio = width / height;
                            const containerAspectRatio =
                              containerSize.width / containerSize.height;

                            let displayWidth = containerSize.width;
                            let displayHeight = containerSize.height;

                            if (imageAspectRatio > containerAspectRatio) {
                              displayHeight =
                                containerSize.width / imageAspectRatio;
                            } else {
                              displayWidth =
                                containerSize.height * imageAspectRatio;
                            }

                            setImageSize({
                              width: displayWidth,
                              height: displayHeight,
                            });
                          }}
                        />
                      </Animated.View>
                    </Animated.View>
                  </TapGestureHandler>
                </Animated.View>
              </PanGestureHandler>
            </Animated.View>
          </PinchGestureHandler>

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

                <View style={styles.controlButtons}>
                  {baseScale > MIN_SCALE && (
                    <TouchableOpacity
                      style={styles.controlButton}
                      onPress={handleZoomOut}
                      activeOpacity={0.7}
                    >
                      <Icon name="zoom-out" size={24} color="#666" />
                    </TouchableOpacity>
                  )}

                  {baseScale < MAX_SCALE && (
                    <TouchableOpacity
                      style={styles.controlButton}
                      onPress={handleZoomIn}
                      activeOpacity={0.7}
                    >
                      <Icon name="zoom-in" size={24} color={COLORS.green} />
                    </TouchableOpacity>
                  )}

                  {(baseScale > MIN_SCALE || baseScale < MAX_SCALE) && (
                    <View style={styles.divider} />
                  )}

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
  closeButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 15 : 15,
    right: 16,
    width: 24,
    height: 24,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
});
