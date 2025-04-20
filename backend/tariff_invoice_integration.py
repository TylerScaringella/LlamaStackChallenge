from backend.tariffSearch import TariffMonitoringAgent
from backend.agents.invoice_parser import InvoiceParser
import logging
import json
import os
from dotenv import load_dotenv
from backend.tools.pdf_extractor import extract_text_from_pdf
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class TariffInvoiceIntegration:
    """
    Integrates the TariffMonitoringAgent with the InvoiceParser to analyze
    tariffs for items in an invoice.
    """
    
    def __init__(self, use_mock_data=True):
        """
        Initialize the integration between invoice parsing and tariff analysis.
        
        Args:
            use_mock_data (bool): Whether to use mock data for testing
        """
        self.invoice_parser = InvoiceParser()
        self.tariff_agent = TariffMonitoringAgent(use_mock_data=use_mock_data)
        
    def process_invoice_pdf(self, pdf_path):
        """
        Process a PDF invoice and analyze tariffs for the items.
        
        Args:
            pdf_path (str): Path to the PDF invoice
            
        Returns:
            dict: Combined invoice and tariff analysis results
        """
        # Extract text from PDF
        with open(pdf_path, 'rb') as pdf_file:
            text = extract_text_from_pdf(pdf_file)
        
        # Parse the invoice
        invoice_data = self.invoice_parser.parse_invoice(text, pdf_path=pdf_path)
        
        # Analyze tariffs for each item
        tariff_analysis = self.analyze_invoice_tariffs(invoice_data)
        
        # Combine results
        result = {
            'invoice_data': invoice_data,
            'tariff_analysis': tariff_analysis
        }
        
        return result
    
    def process_invoice_text(self, text):
        """
        Process invoice text and analyze tariffs for the items.
        
        Args:
            text (str): Invoice text
            
        Returns:
            dict: Combined invoice and tariff analysis results
        """
        # Parse the invoice
        invoice_data = self.invoice_parser.parse_invoice(text)
        
        # Analyze tariffs for each item
        tariff_analysis = self.analyze_invoice_tariffs(invoice_data)
        
        # Combine results
        result = {
            'invoice_data': invoice_data,
            'tariff_analysis': tariff_analysis
        }
        
        return result
    
    def analyze_invoice_tariffs(self, invoice_data):
        """
        Analyze tariffs for items in an invoice.
        
        Args:
            invoice_data (dict): Parsed invoice data
            
        Returns:
            dict: Tariff analysis results
        """
        tariff_analysis = {
            'items': [],
            'total_tariff_cost': 0.0,
            'summary': {}
        }
        
        # Get country of origin from invoice
        country_of_origin = invoice_data.get('country_of_origin', 'Unknown')
        
        # Analyze each item
        for item in invoice_data.get('line_items', []):
            hts_code = item.get('hts_code')
            if not hts_code:
                logger.warning(f"No HTS code found for item: {item.get('product', 'Unknown')}")
                continue
            
            quantity = float(item.get('quantity', 0))
            unit_price = float(item.get('unit_price', 0))
            total_price = float(item.get('total_price', quantity * unit_price))
            
            # Analyze tariffs for this item
            item_analysis = self.tariff_agent.analyze_tariffs(hts_code, country_of_origin)
            
            # Get the current rate from USITC data
            usitc_data = item_analysis.get('usitc_data', {})
            current_rate_str = usitc_data.get('current_rate', '0')
            
            # Handle 'N/A' or other non-numeric values
            try:
                current_rate = float(current_rate_str.rstrip('%') if current_rate_str != 'N/A' else '0')
            except (ValueError, AttributeError):
                logger.warning(f"Invalid current rate value: {current_rate_str}, using 0")
                current_rate = 0
            
            # Calculate tariff cost
            tariff_cost = total_price * (current_rate / 100)
            
            # Add to results
            item_result = {
                'item': item,
                'tariff_analysis': item_analysis,
                'tariff_cost': tariff_cost,
                'summary': {
                    'product': item.get('product'),
                    'hts_code': hts_code,
                    'quantity': quantity,
                    'unit_price': unit_price,
                    'total_price': total_price,
                    'current_rate': f"{current_rate}%",
                    'tariff_cost': tariff_cost
                }
            }
            
            tariff_analysis['items'].append(item_result)
            tariff_analysis['total_tariff_cost'] += tariff_cost
        
        # Add summary
        tariff_analysis['summary'] = {
            'total_items': len(tariff_analysis['items']),
            'total_tariff_cost': tariff_analysis['total_tariff_cost'],
            'country_of_origin': country_of_origin,
            'analysis_date': datetime.now().isoformat(),
            'items_analyzed': [
                {
                    'product': item['summary']['product'],
                    'hts_code': item['summary']['hts_code'],
                    'tariff_rate': item['summary']['current_rate'],
                    'tariff_cost': item['summary']['tariff_cost']
                }
                for item in tariff_analysis['items']
            ]
        }
        
        return tariff_analysis

# Example usage
if __name__ == "__main__":
    # Test with a sample invoice
    integration = TariffInvoiceIntegration(use_mock_data=True)
    
    # Sample invoice text
    sample_invoice = """
    INVOICE
    
    Vendor: Sample Vendor Inc.
    Date: 2023-05-15
    Invoice #: INV-12345
    
    Country of Origin: China
    
    Items:
    1. Electronic Components
       HTS Code: 8542.31.0000
       Quantity: 100
       Unit Price: $2.50
       Total: $250.00
    
    2. Circuit Boards
       HTS Code: 8534.00.0000
       Quantity: 50
       Unit Price: $5.00
       Total: $250.00
    """
    
    # Process the sample invoice
    result = integration.process_invoice_text(sample_invoice)
    
    # Print results
    print("\nInvoice Data:")
    print(result['invoice_data'])
    
    print("\nTariff Analysis:")
    print(result['tariff_analysis']) 