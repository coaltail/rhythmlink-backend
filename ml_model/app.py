from flask import Flask, jsonify
from db import fetch_groups, fetch_user_preferences
from model import RecommendationModel
from apscheduler.schedulers.background import BackgroundScheduler

app = Flask(__name__)

recommendation_model = RecommendationModel()


def train_model():
    """Function to train the model."""
    try:
        groups = fetch_groups()
        recommendation_model.train(groups)
        print("Model trained successfully")
    except Exception as e:
        print(f"Error training model: {e}")


@app.route("/train", methods=["POST"])
def train_model_endpoint():
    """Endpoint for training the model."""
    try:
        train_model()
        return jsonify({"message": "Model trained successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/recommend/<int:user_id>", methods=["GET"])
def recommend_groups(user_id):
    """Endpoint for getting recommendations for a user."""
    try:
        user_preferences = fetch_user_preferences(user_id)
        if not user_preferences:
            return jsonify({"message": "User preferences not found"}), 404

        user_genres = user_preferences.split(",")
        recommendations = recommendation_model.recommend(user_genres)
        return jsonify(recommendations), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    scheduler = BackgroundScheduler()
    scheduler.add_job(train_model, "interval", minutes=20)
    scheduler.start()

    train_model()
    print("model trained")
    app.run(host="0.0.0.0", port=5000)
