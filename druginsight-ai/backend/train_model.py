"""Train the repurposing model from the local dataset."""

from app.ml.model import get_model

if __name__ == "__main__":
    model = get_model()
    metrics = model.train()
    print("Training complete.")
    for k, v in metrics.items():
        print(f"  {k}: {v}")
