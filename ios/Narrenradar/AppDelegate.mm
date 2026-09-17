#import "AppDelegate.h"
#import <Firebase.h>
#import <React/RCTBundleURLProvider.h>
#import <GoogleMaps/GoogleMaps.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [FIRApp configure];
  self.moduleName = @"Narrenradar";
  [GMSServices provideAPIKey:@"AIzaSyBFpoeg3jxxEmRaOG94i3ENokVKnkZVRX8"]; // add this line using the api key obtained from Google Console
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self getBundleURL];
}

- (NSURL *)getBundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

// Info.plist names AppDelegate as the UISceneDelegate class, but iOS
// instantiates a *separate* AppDelegate object for that role — it is not the
// same instance as [UIApplication sharedApplication].delegate. That second
// instance's own -application:didFinishLaunchingWithOptions: never runs, so
// its self.window is always nil; the real window lives on the app delegate
// singleton and must be attached to the scene from there instead.
- (void)scene:(UIScene *)scene
    willConnectToSession:(UISceneSession *)session
                 options:(UISceneConnectionOptions *)connectionOptions API_AVAILABLE(ios(13.0))
{
  if (![scene isKindOfClass:[UIWindowScene class]]) {
    return;
  }
  UIWindowScene *windowScene = (UIWindowScene *)scene;
  AppDelegate *appDelegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
  UIWindow *window = appDelegate.window;
  if (!window || window.windowScene) {
    return;
  }
  window.windowScene = windowScene;
  window.frame = windowScene.coordinateSpace.bounds;
  [window makeKeyAndVisible];
  [window.rootViewController.view setNeedsLayout];
  [window.rootViewController.view layoutIfNeeded];
}

@end
