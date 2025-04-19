import os
import requests
import logging
import time
from fpdf import FPDF
import json

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def create_test_pdf(vendor_name, line_items, output_path):
    """Create a test PDF invoice with the given vendor and line items."""
    pdf = FPDF()
    pdf.add_page()
    
    # Add header
    pdf.set_font("Arial", "B", 16)
    pdf.cell(0, 10, f"Invoice from {vendor_name}", ln=True, align="C")
    
    # Add date
    pdf.set_font("Arial", "", 12)
    pdf.cell(0, 10, f"Date: {time.strftime('%Y-%m-%d')}", ln=True)
    
    # Add line items
    pdf.ln(10)
    pdf.set_font("Arial", "B", 12)
    pdf.cell(60, 10, "Product", 1)
    pdf.cell(30, 10, "Quantity", 1)
    pdf.cell(40, 10, "Unit Price", 1)
    pdf.cell(40, 10, "Total", 1)
    pdf.ln()
    
    pdf.set_font("Arial", "", 12)
    for item in line_items:
        pdf.cell(60, 10, item["product"], 1)
        pdf.cell(30, 10, str(item["quantity"]), 1)
        pdf.cell(40, 10, f"${item['unit_price']:.2f}", 1)
        pdf.cell(40, 10, f"${item['total_price']:.2f}", 1)
        pdf.ln()
    
    # Add total
    total = sum(item["total_price"] for item in line_items)
    pdf.ln(10)
    pdf.set_font("Arial", "B", 12)
    pdf.cell(130, 10, "Total:", 0)
    pdf.cell(40, 10, f"${total:.2f}", 1)
    
    # Save the PDF
    pdf.output(output_path)
    logger.info(f"Created test PDF invoice: {output_path}")

def check_server_health():
    """Check if the server is running and healthy."""
    try:
        response = requests.get("http://localhost:5001/")
        if response.status_code == 200:
            logger.info("Server is healthy")
            return True
        else:
            logger.error(f"Server returned status code: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to connect to server: {str(e)}")
        return False

def send_invoice_to_api(pdf_path):
    """Send the invoice to the API for parsing."""
    url = "http://localhost:5001/api/parse-invoice"
    
    with open(pdf_path, "rb") as f:
        files = {"file": f}
        response = requests.post(url, files=files)
    
    if response.status_code == 200:
        logger.info("Successfully parsed invoice")
        return response.json()
    else:
        logger.error(f"Failed to parse invoice: {response.text}")
        return None

def main():
    """Run the demo with multiple test invoices."""
    # Test cases with different formats
    test_cases = [
        {
            "name": "simple_invoice",
            "vendor": "Acme Corp",
            "items": [
                {"product": "Widget A", "quantity": 2, "unit_price": 10.0, "total_price": 20.0},
                {"product": "Widget B", "quantity": 1, "unit_price": 15.0, "total_price": 15.0}
            ]
        },
        {
            "name": "complex_invoice",
            "vendor": "Tech Solutions Inc.",
            "items": [
                {"product": "Enterprise License", "quantity": 1, "unit_price": 1000.0, "total_price": 1000.0},
                {"product": "Support Package", "quantity": 12, "unit_price": 100.0, "total_price": 1200.0},
                {"product": "Training Sessions", "quantity": 3, "unit_price": 500.0, "total_price": 1500.0}
            ]
        },
        {
            "name": "medical_invoice",
            "vendor": "City Hospital",
            "items": [
                {"product": "Medical Supplies", "quantity": 50, "unit_price": 25.0, "total_price": 1250.0},
                {"product": "Equipment Rental", "quantity": 1, "unit_price": 500.0, "total_price": 500.0}
            ]
        }
    ]
    
    # Check server health first
    if not check_server_health():
        logger.error("Server is not healthy. Exiting demo.")
        return
    
    # Process each test case
    for test_case in test_cases:
        pdf_path = f"test_{test_case['name']}.pdf"
        
        try:
            # Create test PDF
            create_test_pdf(test_case["vendor"], test_case["items"], pdf_path)
            
            # Send to API and get results
            result = send_invoice_to_api(pdf_path)
            
            if result:
                logger.info(f"Results for {test_case['name']}:")
                logger.info(json.dumps(result, indent=2))
                
                # Validate results
                if result.get("vendor_name") == test_case["vendor"]:
                    logger.info("✓ Vendor name matched")
                else:
                    logger.warning(f"✗ Vendor name mismatch. Expected: {test_case['vendor']}, Got: {result.get('vendor_name')}")
                
                if len(result.get("line_items", [])) == len(test_case["items"]):
                    logger.info("✓ Correct number of line items")
                else:
                    logger.warning(f"✗ Line item count mismatch. Expected: {len(test_case['items'])}, Got: {len(result.get('line_items', []))}")
            
        except Exception as e:
            logger.error(f"Error processing {test_case['name']}: {str(e)}")
        
        finally:
            # Clean up
            if os.path.exists(pdf_path):
                os.remove(pdf_path)
                logger.info(f"Cleaned up {pdf_path}")

if __name__ == "__main__":
    main() 