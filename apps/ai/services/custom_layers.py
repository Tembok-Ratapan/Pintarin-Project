import tensorflow as tf
from tensorflow import keras


@keras.utils.register_keras_serializable(package="PINTARIN")
class AttentionLayer(keras.layers.Layer):
    """Feature-wise attention layer used by the PINTARIN risk model."""

    def __init__(self, units=16, **kwargs):
        super().__init__(**kwargs)
        self.units = units

    def build(self, input_shape):
        n_features = int(input_shape[-1])

        self.W = self.add_weight(
            name="attn_W",
            shape=(n_features, self.units),
            initializer="glorot_uniform",
            trainable=True,
        )

        self.b = self.add_weight(
            name="attn_b",
            shape=(self.units,),
            initializer="zeros",
            trainable=True,
        )

        self.u = self.add_weight(
            name="attn_u",
            shape=(self.units,),
            initializer="glorot_uniform",
            trainable=True,
        )

        super().build(input_shape)

    def call(self, x):
        attn_weights = tf.nn.softmax(tf.linalg.matvec(self.W, self.u), axis=0)
        return x * attn_weights

    def get_config(self):
        config = super().get_config()
        config.update({"units": self.units})
        return config


@keras.utils.register_keras_serializable(package="PINTARIN")
class FocalLoss(keras.losses.Loss):
    """Focal loss used during training. Kept here so saved models can be loaded."""

    def __init__(self, gamma=2.0, alpha=0.25, **kwargs):
        super().__init__(**kwargs)
        self.gamma = float(gamma)
        self.alpha = float(alpha)

    def call(self, y_true, y_pred):
        y_true_oh = tf.one_hot(tf.cast(y_true, tf.int32), depth=3)
        y_pred_c = tf.clip_by_value(y_pred, 1e-7, 1.0 - 1e-7)

        ce = -tf.reduce_sum(y_true_oh * tf.math.log(y_pred_c), axis=-1)
        p_t = tf.reduce_sum(y_true_oh * y_pred_c, axis=-1)
        focal_w = self.alpha * tf.pow(1.0 - p_t, self.gamma)

        return tf.reduce_mean(focal_w * ce)

    def get_config(self):
        config = super().get_config()
        config.update({"gamma": self.gamma, "alpha": self.alpha})
        return config