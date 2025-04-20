import os
import requests
import logging
import time
from fpdf import FPDF
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
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
    
    # Add line items header
    pdf.ln(10)
    pdf.set_font("Arial", "B", 12)
    pdf.cell(60, 10, "Product", 1)
    pdf.cell(30, 10, "Quantity", 1)
    pdf.cell(30, 10, "Unit Price", 1)
    pdf.cell(30, 10, "Total", 1)
    pdf.ln()
    
    # Add line items
    pdf.set_font("Arial", "", 12)
    for item in line_items:
        pdf.cell(60, 10, item["product"], 1)
        pdf.cell(30, 10, str(item["quantity"]), 1)
        pdf.cell(30, 10, f"${item['unit_price']:.2f}", 1)
        pdf.cell(30, 10, f"${item['total_price']:.2f}", 1)
        pdf.ln()
    
    # Add total
    total = sum(item["total_price"] for item in line_items)
    pdf.ln(10)
    pdf.set_font("Arial", "B", 12)
    pdf.cell(120, 10, "Total Amount:", 0, 0, "R")
    pdf.cell(30, 10, f"${total:.2f}", 1)
    
    # Save the PDF
    pdf.output(output_path)
    logger.info(f"Created test PDF invoice: {output_path}")

def check_server_health():
    """Check if the server is running."""
    try:
        response = requests.get("http://localhost:5001/health")
        if response.status_code == 200:
            logger.info("Server is running")
            return True
        else:
            logger.error(f"Server returned status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        logger.error("Could not connect to server")
        return False

def send_invoice_to_api(pdf_path):
    """Send the invoice to the API for parsing."""
    try:
        with open(pdf_path, "rb") as f:
            files = {"file": (os.path.basename(pdf_path), f, "application/pdf")}
            response = requests.post("http://localhost:5001/api/parse-invoice", files=files)
        
        if response.status_code == 200:
            result = response.json()
            logger.info("Successfully parsed invoice")
            return result
        else:
            logger.error(f"API returned status code: {response.status_code}")
            logger.error(f"Response: {response.text}")
            return None
    except Exception as e:
        logger.error(f"Error sending invoice to API: {str(e)}")
        return None

def main():
    """Run the demo."""
    # Define test cases
    test_cases = [
        {
            "name": "Simple Invoice",
            "vendor": "Duke University",
            "line_items": [
                {
                    "product": "Ginger Chicken",
                    "quantity": 500,
                    "unit_price": 5.0,
                    "total_price": 2500.0
                }
            ]
        },
        {
            "name": "Complex Invoice",
            "vendor": "University of North Carolina",
            "line_items": [
                {
                    "product": "Tar Heels",
                    "quantity": 5,
                    "unit_price": 100.0,
                    "total_price": 500.0
                }
            ]
        },
        {
            "name": "Medical Invoice",
            "vendor": "Johns Hopkins Hospital",
            "line_items": [
                {
                    "product": "Medical Supplies",
                    "quantity": 100,
                    "unit_price": 25.0,
                    "total_price": 2500.0
                },
                {
                    "product": "Equipment",
                    "quantity": 2,
                    "unit_price": 5000.0,
                    "total_price": 10000.0
                }
            ]
        }
    ]
    
    # Check server health
    if not check_server_health():
        logger.error("Server is not running. Please start the server first.")
        return
    
    # Process each test case
    for test_case in test_cases:
        logger.info(f"Processing test case: {test_case['name']}")
        
        # Create test PDF
        pdf_path = f"{test_case['vendor'].lower().replace(' ', '_')}_invoice.pdf"
        create_test_pdf(test_case["vendor"], test_case["line_items"], pdf_path)
        
        # Send to API
        result = send_invoice_to_api(pdf_path)
        
        if result:
            # Validate results
            vendor_name = result.get("vendor_name", "")
            line_items = result.get("line_items", [])
            
            logger.info(f"Vendor name match: {vendor_name == test_case['vendor']}")
            logger.info(f"Line item count: {len(line_items)}")
            
            # Clean up
            try:
                os.remove(pdf_path)
                logger.info(f"Removed test PDF: {pdf_path}")
            except Exception as e:
                logger.error(f"Error removing test PDF: {str(e)}")
        else:
            logger.error(f"Failed to process test case: {test_case['name']}")

if __name__ == "__main__":
    main() 