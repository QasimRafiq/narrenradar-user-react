import Share from "react-native-share";

interface ShareContentOptions {
  message: string;
  title: string;
}

// Shares text + link only, same as the website. Attaching the event image
// made Instagram and Facebook Messenger send just the image and drop the
// text and link. The link shows the event image as its preview instead
// (og:image on the share page).
export const shareContent = async ({
  message,
  title,
}: ShareContentOptions): Promise<void> => {
  try {
    await Share.open({ message, title, failOnCancel: false });
  } catch (error) {
    console.log("shareContent: share failed", error);
  }
};
