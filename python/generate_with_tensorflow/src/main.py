import tensorflow as tf
import numpy as np
from .utils import get_static_file, throw_if_missing


def main(context):
    if context.req.method == "GET":
        return context.res.send(
            get_static_file("index.html"),
            200,
            {"content-type": "text/html; charset=utf-8"},
        )

    try:
        throw_if_missing(context.req.body, ["prompt"])
    except ValueError as err:
        return context.res.json({"ok": False, "error": err.message}, 400)

    prompt = context.req.body["prompt"]
    generated_text = generate_text(prompt)
    return context.res.json({"ok": True, "completion": generated_text}, 200)


def generate_text(prompt):
    # Load the trained model and tokenizer
    model = tf.keras.models.load_model("text_generation_model.h5")
    char2idx = np.load("char2idx.npy", allow_pickle=True).item()
    idx2char = np.load("idx2char.npy", allow_pickle=True)

    # Vectorize the prompt
    input_eval = [char2idx[s] for s in prompt]
    input_eval = tf.expand_dims(input_eval, 0)

    # Generate text
    text_generated = []
    temperature = 1.0

    model.reset_states()
    for _ in range(1000):
        predictions = model(input_eval)
        predictions = tf.squeeze(predictions, 0)
        predictions = predictions / temperature
        predicted_id = tf.random.categorical(predictions, num_samples=1)[-1, 0].numpy()

        input_eval = tf.expand_dims([predicted_id], 0)
        text_generated.append(idx2char[predicted_id])

    return prompt + "".join(text_generated)
