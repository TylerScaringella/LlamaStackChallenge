from llama_stack_client import LlamaStackClient
from flask import Flask, jsonify
from flask_cors import CORS
from backend.api.invoice_routes import invoice_bp
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def create_app():
    app = Flask(__name__)
    CORS(app)  # Enable CORS for all routes
    
    # Add root route
    @app.route('/')
    def index():
        return jsonify({"status": "ok", "message": "Invoice Parser API is running"})
    
    # Register blueprints
    app.register_blueprint(invoice_bp, url_prefix='/api')
    
    # Error handlers
    @app.errorhandler(403)
    def forbidden(e):
        logger.error(f"403 Forbidden error: {str(e)}")
        return jsonify({"error": "Forbidden", "message": str(e)}), 403
    
    @app.errorhandler(404)
    def not_found(e):
        logger.error(f"404 Not Found error: {str(e)}")
        return jsonify({"error": "Not Found", "message": str(e)}), 404
    
    @app.errorhandler(500)
    def internal_server_error(e):
        logger.error(f"500 Internal Server error: {str(e)}")
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='localhost', port=5001)