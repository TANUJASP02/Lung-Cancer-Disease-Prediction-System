import React, { useState } from "react";

export const PredictionSystem: React.FC = () => {
  const [age, setAge] = useState("");
  const [smoking, setSmoking] = useState("");
  const [chestPain, setChestPain] = useState("");

  const [result, setResult] = useState("");
  const [probability, setProbability] = useState(0);

  // Logistic Regression Logic
  const calculateRisk = (age: number, smoking: string, chestPain: string) => {
    let z = 0;

    z += 0.04 * age;
    z += smoking === "Yes" ? 1.5 : 0;
    z += chestPain === "Yes" ? 1.2 : 0;

    const prob = 1 / (1 + Math.exp(-z)); // sigmoid
    return prob;
  };

  const handlePredict = () => {
    if (!age || !smoking || !chestPain) {
      alert("Please fill all fields");
      return;
    }

    const prob = calculateRisk(Number(age), smoking, chestPain);
    const res = prob > 0.5 ? "High Risk" : "Low Risk";

    setProbability(prob);
    setResult(res);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">

      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">
          Lung Cancer Prediction
        </h2>
        <p className="text-gray-500 mt-2">
          Enter patient details to predict risk
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">

        {/* LEFT - INPUT */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-4">Patient Details</h3>

          <input
            type="number"
            placeholder="Age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full p-3 border rounded-lg mb-3"
          />

          <select
            value={smoking}
            onChange={(e) => setSmoking(e.target.value)}
            className="w-full p-3 border rounded-lg mb-3"
          >
            <option value="">Smoking</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>

          <select
            value={chestPain}
            onChange={(e) => setChestPain(e.target.value)}
            className="w-full p-3 border rounded-lg mb-3"
          >
            <option value="">Chest Pain</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>

          <button
            onClick={handlePredict}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90"
          >
            Predict Risk
          </button>
        </div>

        {/* RIGHT - RESULT */}
        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col justify-center">

          {!result && (
            <div className="text-center text-gray-400">
              <p>No prediction yet</p>
              <p className="text-sm mt-2">Enter details and click predict</p>
            </div>
          )}

          {result && (
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-3">
                Prediction Result
              </h3>

              <p className="text-xl font-bold mb-2">
                {(probability * 100).toFixed(2)}%
              </p>

              <p
                className={`text-lg font-semibold ${
                  result === "High Risk"
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {result === "High Risk"
                  ? "🔴 High Risk"
                  : "🟢 Low Risk"}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};