import subprocess
import sys
from pathlib import Path

def main():
    root = Path(__file__).resolve().parents[1]
    eval_script = root / "ml" / "src" / "evaluation" / "run_eval.py"
    dataset = root / "ml" / "data" / "processed" / "campus_test_pairs.json"

    print("Running CLFIS Machine Learning Benchmark...")
    cmd = [sys.executable, str(eval_script), "--dataset", str(dataset), "--top_k", "5"]
    result = subprocess.run(cmd)
    sys.exit(result.returncode)

if __name__ == "__main__":
    main()
