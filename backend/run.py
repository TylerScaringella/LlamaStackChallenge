import sys
import os

# Add the project root directory to the Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

# Import and run the Flask application
from backend.core.main import create_app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, host='localhost', port=5001) 