# 🤝 Contribution Guidelines

Thank you for contributing to CLFIS!

## Git Workflow
1. Fork the repository and create a feature branch (`git checkout -b feature/amazing-feature`).
2. Follow PEP8 Python standards in `backend/` and `ml/`.
3. Follow ESLint and Prettier rules in `frontend/`.
4. Run tests before submitting a Pull Request:
   ```bash
   cd backend && pytest tests/
   python ml/src/evaluation/run_eval.py
   ```
5. Submit your Pull Request with a clear summary of changes.
