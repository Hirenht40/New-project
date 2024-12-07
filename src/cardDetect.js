// src/CardDetector.js
import React, { useRef, useState, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import * as tf from "@tensorflow/tfjs";

const CardDetector = () => {
  const webcamRef = useRef(null);
  const [model, setModel] = useState(null);
  const [cardName, setCardName] = useState("");

  useEffect(() => {
    const loadModel = async () => {
      // Load the model from the public folder
      const loadedModel = await tf.loadGraphModel("./public/model/model.json");
      console.log(">>>>>>>>>>>loadedModel", loadedModel);
      setModel(loadedModel);
    };
    loadModel();
  }, []);

  const capture = useCallback(async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    const image = await loadImage(imageSrc);
    const prediction = await detectCard(image);
    setCardName(prediction);
  }, [webcamRef, model]);

  const loadImage = (imageSrc) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        const tensor = tf.browser
          .fromPixels(img)
          .resizeNearestNeighbor([224, 224])
          .expandDims(0)
          .toFloat();
        resolve(tensor.div(255.0)); // Normalize pixel values
      };
    });
  };

  const detectCard = async (image) => {
    if (!model) return "";
    const predictions = await model.predict(image).data();
    const predictedClass = predictions.indexOf(Math.max(...predictions));
    // Map predictedClass to card name based on your training data
    const classNames = ["Ace of Spades", "Two of Hearts", "Three of Diamonds"]; // Update with your card classes
    return classNames[predictedClass] || "Unknown Card";
  };

  return (
    <div>
      <h1>Playing Card Detector</h1>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={400}
      />
      <button onClick={capture}>Detect Card</button>
      {cardName && <h2>Detected Card: {cardName}</h2>}
    </div>
  );
};

export default CardDetector;
