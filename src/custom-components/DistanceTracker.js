import React, { useState } from "react";
import { Text, Platform } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import Loader from "./Loader";
import { showNotification } from "../notification";

const DistanceTracker = ({ distance, exceeded, name }) => {
  const [notified, setNotified] = useState(false);

  if (distance === null) {
    return <Loader size={"small"} />;
  }
  if (exceeded) {
    if (!notified) {
        showNotification(
          "Balizame",
          "Get into the app and enter recovery mode to try to find it",
          `Beacon with identifier '${name}' has exceeded maximum distance`
        );
        setNotified(true);
    }
    return <Icon name="exclamation-triangle" size={16} color="red" />;
  } else {
    return <Text>{distance} m</Text>;
  }
};

export default DistanceTracker;
