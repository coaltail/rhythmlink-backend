from sklearn.neighbors import NearestNeighbors
import pandas as pd
import numpy as np


class RecommendationModel:
    def __init__(self):
        self.model = None
        self.groups_df = None

    def train(self, groups_df):
        """Train the model using groups and their genres."""
        self.groups_df = groups_df
        genres_encoded = (
            pd.get_dummies(groups_df["genres"].apply(pd.Series).stack())
            .groupby(level=0)
            .sum()
        )
        self.model = NearestNeighbors(n_neighbors=5, metric="cosine")
        self.model.fit(genres_encoded)

    def recommend(self, user_genres):
        """Recommend groups based on user interests."""
        if self.model is None or self.groups_df is None:
            raise ValueError("Model is not trained!")

        genres_encoded = (
            pd.get_dummies(self.groups_df["genres"].apply(pd.Series).stack())
            .groupby(level=0)
            .sum()
        )
        user_vector = np.zeros(genres_encoded.shape[1])

        for genre in user_genres:
            if genre in genres_encoded.columns:
                user_vector[genres_encoded.columns.get_loc(genre)] = 1
        user_vector_df = pd.DataFrame([user_vector], columns=genres_encoded.columns)
        _, indices = self.model.kneighbors(user_vector_df)
        recommended_groups = self.groups_df.iloc[indices[0]]
        return recommended_groups.to_dict(orient="records")
