import tensorflow as tf
import numpy as np
import os


def main():
    path_to_file = tf.keras.utils.get_file(
        "shakespeare.txt",
        "https://storage.googleapis.com/download.tensorflow.org/data/shakespeare.txt",
    )
    text = open(path_to_file, "rb").read().decode(encoding="utf-8")
    vocab = sorted(set(text))
    char2idx = {u: i for i, u in enumerate(vocab)}
    idx2char = np.array(vocab)

    text_as_int = np.array([char2idx[c] for c in text])
    seq_length = 100
    char_dataset = tf.data.Dataset.from_tensor_slices(text_as_int)
    sequences = char_dataset.batch(seq_length + 1, drop_remainder=True)

    def split_input_target(chunk):
        input_text = chunk[:-1]
        target_text = chunk[1:]
        return input_text, target_text

    dataset = sequences.map(split_input_target)
    BATCH_SIZE = 64
    BUFFER_SIZE = 10000
    dataset = dataset.shuffle(BUFFER_SIZE).batch(BATCH_SIZE, drop_remainder=True)

    vocab_size = len(vocab)
    embedding_dim = 256
    rnn_units = 1024

    model = tf.keras.Sequential(
        [
            tf.keras.layers.Embedding(
                vocab_size, embedding_dim, batch_input_shape=[BATCH_SIZE, None]
            ),
            tf.keras.layers.GRU(
                rnn_units,
                return_sequences=True,
                stateful=True,
                recurrent_initializer="glorot_uniform",
            ),
            tf.keras.layers.Dense(vocab_size),
        ]
    )

    def loss(labels, logits):
        return tf.keras.losses.sparse_categorical_crossentropy(
            labels, logits, from_logits=True
        )

    model.compile(optimizer="adam", loss=loss)

    EPOCHS = 10
    checkpoint_dir = "./training_checkpoints"
    checkpoint_prefix = f"{checkpoint_dir}/ckpt_{{epoch}}"

    checkpoint_callback = tf.keras.callbacks.ModelCheckpoint(
        filepath=checkpoint_prefix, save_weights_only=True
    )

    model.fit(dataset, epochs=EPOCHS, callbacks=[checkpoint_callback])

    model.save("text_generation_model.h5")
    np.save("char2idx.npy", char2idx)
    np.save("idx2char.npy", idx2char)

    os.remove(path_to_file)


if __name__ == "__main__":
    main()
