import json
from backend.core.tariff_invoice_integration import TariffInvoiceIntegration

def process_invoice(pdf_path):
    """Process an invoice PDF and extract data"""
    # Create the integration with mock data enabled
    integration = TariffInvoiceIntegration(use_mock_data=True)
    
    try:
        # Process the PDF invoice
        result = integration.process_invoice_pdf(pdf_path)
        
        # Save parsed data to a file
        output_file = f"{pdf_path.replace('.pdf', '_parsed.json')}"
        with open(output_file, 'w') as f:
            json.dump(result['invoice_data'], f, indent=2)
        
    except Exception as e:
        print(f"Error processing PDF: {str(e)}")

if __name__ == "__main__":
    # Process both existing PDFs
    process_invoice("temp_invoice.pdf")
    process_invoice("duke_invoice.pdf") 