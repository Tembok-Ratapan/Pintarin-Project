ALTER TABLE predictions
  ADD COLUMN ai_response JSON DEFAULT NULL AFTER input_features,
  ADD COLUMN priority_score DECIMAL(8, 4) DEFAULT NULL AFTER predicted_score,
  ADD COLUMN recommendation_text TEXT DEFAULT NULL AFTER priority_score;

ALTER TABLE predictions
  ADD UNIQUE KEY uq_predictions_region_data_prediction_model
  (region_id, data_year, prediction_year, model_version);