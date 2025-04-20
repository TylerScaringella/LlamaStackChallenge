from flask import Blueprint, request, jsonify
import logging
import os
import sys

# Add the project root directory to the Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
parent_dir = os.path.dirname(backend_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

# Now import the backend modules
from backend.pdf_processing.pdf_extractor import extract_text_from_pdf
from backend.pdf_processing.invoice_parser import InvoiceParser
from backend.core.tariff_invoice_integration import TariffInvoiceIntegration

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

invoice_bp = Blueprint('invoice', __name__)

@invoice_bp.route('/parse-invoice', methods=['POST'])
def parse_invoice():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    if not file.filename.endswith('.pdf'):
        return jsonify({"error": "File must be a PDF"}), 400
    
    try:
        # Extract text from PDF
        text = extract_text_from_pdf(file)
        
        # Parse the invoice and analyze tariffs
        integration = TariffInvoiceIntegration(invoiceOutput=text, use_mock_data=False)
        result = integration.process_invoice_text()
        print("RESULT FROM ALL OF THE ANALYSIS", result['invoice_data'])
        

        return jsonify({"analysis": result['tariff_analysis'], "items": result['invoice_data']})
        # return jsonify(result)
    except Exception as e:
        logger.error(f"Error processing invoice: {str(e)}", exc_info=True)
        return jsonify({"error": f"Failed to process invoice: {str(e)}"}), 500

@invoice_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "Invoice Parser API is running"}) 