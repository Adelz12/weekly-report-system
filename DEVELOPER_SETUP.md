Developer setup (VS Code + backend virtualenv)
-------------------------------------------------

If you're working on the backend in VS Code it's helpful to create a dedicated virtual environment and point VS Code at it so the editor/linter (Pylance) can resolve binary-only packages like ReportLab.

1. Create and activate the backend virtual environment and install dependencies:

```bash
# from repository root
python3 -m venv backend/.venv
source backend/.venv/bin/activate
pip install -r backend/requirements.txt
```

2. In VS Code select the interpreter created above:

- Open the Command Palette (Ctrl+Shift+P) → "Python: Select Interpreter" → choose "${workspaceFolder}/backend/.venv/bin/python".

3. The workspace file `.vscode/settings.json` in this repo already sets the interpreter path and adds `./backend` to `python.analysis.extraPaths` to help Pylance resolve imports.

4. Quick check that ReportLab is available to the selected interpreter:

```bash
# with backend/.venv activated
python -c "from reportlab.lib.pagesizes import letter; print(letter)"
python -c "import reportlab; print(reportlab.__file__)"
```

If these run without error, both runtime and the editor should stop reporting unresolved-import diagnostics for `reportlab`.
