from flask import Blueprint, request, jsonify
from backend.tools.pdf_extractor import extract_text_from_pdf
from backend.agents.invoice_parser import InvoiceParser
from backend.tariff_invoice_integration import TariffInvoiceIntegration
import logging
import os

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

invoice_bp = Blueprint('invoice', __name__)

@invoice_bp.route('/parse-invoice', methods=['POST'])
def parse_invoice():
    logger.debug("Received request to /parse-invoice endpoint")
    logger.debug(f"Request headers: {dict(request.headers)}")
    logger.debug(f"Request files: {request.files}")
    
    if 'file' not in request.files:
        logger.error("No file part in the request")
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    logger.debug(f"Received file: {file.filename}")
    
    if file.filename == '':
        logger.error("No selected file")
        return jsonify({'error': 'No selected file'}), 400
    
    if not file.filename.endswith('.pdf'):
        logger.error(f"Invalid file type: {file.filename}")
        return jsonify({'error': 'File must be a PDF'}), 400
    
    try:
        # Save the uploaded file temporarily
        temp_path = 'temp_invoice.pdf'
        file.save(temp_path)
        logger.debug(f"Saved file to {temp_path}")
        logger.debug(f"File size: {os.path.getsize(temp_path)} bytes")
        
        # Extract text from PDF
        with open(temp_path, 'rb') as pdf_file:
            text = extract_text_from_pdf(pdf_file)
        logger.debug(f"Extracted text length: {len(text)}")
        logger.debug(f"Extracted text: {text}")
        
        # Parse the text using the enhanced agent with multiple strategies
        parser = InvoiceParser()
        result = parser.parse_invoice(text, pdf_path=temp_path)
        logger.debug(f"Parsing result: {result}")
        
        # Note: We're keeping the temporary file for debugging
        logger.info(f"Temporary file kept at: {temp_path}")
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error processing invoice: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@invoice_bp.route('/analyze-tariffs', methods=['POST'])
def analyze_tariffs():
    logger.debug("Received request to /analyze-tariffs endpoint")
    
    if 'file' not in request.files:
        logger.error("No file part in the request")
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    logger.debug(f"Received file: {file.filename}")
    
    if file.filename == '':
        logger.error("No selected file")
        return jsonify({'error': 'No selected file'}), 400
    
    if not file.filename.endswith('.pdf'):
        logger.error(f"Invalid file type: {file.filename}")
        return jsonify({'error': 'File must be a PDF'}), 400
    
    try:
        # Save the uploaded file temporarily
        temp_path = 'temp_invoice.pdf'
        file.save(temp_path)
        logger.debug(f"Saved file to {temp_path}")
        
        # Create the integration
        integration = TariffInvoiceIntegration(use_mock_data=True)
        
        # Process the invoice and analyze tariffs
        result = integration.process_invoice_pdf(temp_path)
        logger.debug(f"Analysis result: {result}")
        
        # Note: We're keeping the temporary file for debugging
        logger.info(f"Temporary file kept at: {temp_path}")
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error analyzing tariffs: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500 