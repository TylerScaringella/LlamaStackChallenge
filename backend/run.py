import sys
import os

# Add the project root directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

# Import and run the Flask application
from backend.main import create_app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, host='localhost', port=5001) 