import LottieView from "lottie-react-native";

const birds = require("./birds2.json");

export default function Birds() {
  return (
    <LottieView
      speed={0.2}
      style={{
        width: "100%",
        height: 200,
      }}
      source={birds}
      loop
    />
  );
}
