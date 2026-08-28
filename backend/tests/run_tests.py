import sys
import os
from pathlib import Path

# Add backend root to path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import test_auth
import test_items
import test_matching

def run():
    print("===========================================================")
    print("RUNNING CLFIS BACKEND SUITE")
    print("===========================================================")
    passed = 0
    failed = 0

    modules = [test_auth, test_items, test_matching]
    for mod in modules:
        print(f"\nModule: {mod.__name__}")
        for attr_name in dir(mod):
            if attr_name.startswith("test_"):
                test_func = getattr(mod, attr_name)
                if callable(test_func):
                    try:
                        test_func()
                        print(f"  [PASS] {attr_name}")
                        passed += 1
                    except Exception as e:
                        print(f"  [FAIL] {attr_name}: {e}")
                        failed += 1

    print("\n===========================================================")
    print(f"Summary: {passed} passed, {failed} failed")
    print("===========================================================")
    return 0 if failed == 0 else 1

if __name__ == "__main__":
    sys.exit(run())
