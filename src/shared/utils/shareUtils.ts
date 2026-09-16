import Share from "react-native-share";
import ReactNativeBlobUtil from "react-native-blob-util";

interface ShareContentOptions {
  message: string;
  title: string;
  imageUrl?: string | null;
}

const isSvgUrl = (url?: string | null): boolean => {
  if (!url) return false;
  return /\.svg(\?|$)/i.test(url);
};

// Apps like Instagram only appear in the system share sheet for image/video
// content, never for text-only shares, so a real local image file is required.
// react-native's built-in Share module can't attach a local file on Android,
// so we download the image first and hand it to react-native-share, which
// still opens the standard system chooser (not an Instagram-specific flow).
export const shareContent = async ({
  message,
  title,
  imageUrl,
}: ShareContentOptions): Promise<void> => {
  // SVG images aren't rasterized on this platform, and most share targets
  // (Instagram, WhatsApp, ...) can't render raw SVG bytes as an image.
  const usableImageUrl = imageUrl && !isSvgUrl(imageUrl) ? imageUrl : null;
  let localImagePath: string | null = null;

  if (usableImageUrl) {
    try {
      const extension =
        usableImageUrl.split("?")[0].split(".").pop()?.toLowerCase() || "jpg";
      const res = await ReactNativeBlobUtil.config({
        fileCache: true,
        appendExt: extension,
      }).fetch("GET", usableImageUrl);
      localImagePath = res.path();
    } catch (error) {
      console.log(
        "shareContent: failed to download image, sharing text only",
        error
      );
    }
  }

  try {
    if (localImagePath) {
      const extension = localImagePath.split(".").pop()?.toLowerCase();
      const mimeType = extension === "png" ? "image/png" : "image/jpeg";
      await Share.open({
        url: `file://${localImagePath}`,
        type: mimeType,
        message,
        title,
        failOnCancel: false,
      });
    } else {
      await Share.open({ message, title, failOnCancel: false });
    }
  } catch (error) {
    console.log("shareContent: share failed", error);
  }
};
