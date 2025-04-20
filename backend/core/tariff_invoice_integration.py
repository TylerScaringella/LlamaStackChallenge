import logging
import json
import os
import sys
import re
from dotenv import load_dotenv
from datetime import datetime

# Add the project root directory to the Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
parent_dir = os.path.dirname(backend_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

# Now import the backend modules
from backend.tariff_research.tariffSearch import TariffMonitoringAgent
from backend.pdf_processing.invoice_parser import InvoiceParser
from backend.pdf_processing.pdf_extractor import extract_text_from_pdf
from backend.agents.country_detector import CountryDetector
from llama_stack_client import LlamaStackClient
from llama_stack_client.types import UserMessage, SystemMessage

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
    
    def __init__(self, invoiceOutput=None, use_mock_data=True):
        """
        Initialize the integration between invoice parsing and tariff analysis.
        
        Args:
            invoiceOutput (str, optional): Raw invoice text to process
            use_mock_data (bool): Whether to use mock data for testing
        """
        self.invoice_parser = InvoiceParser()
        self.tariff_agent = TariffMonitoringAgent(use_mock_data=use_mock_data)
        self.country_detector = CountryDetector()
        self.invoiceOutput = invoiceOutput
        
        # Initialize Llama client with the correct host and port
        host = os.getenv("LLAMA_HOST", "localhost")
        port = os.getenv("LLAMA_PORT", "8321")  # Updated to use port 8321
        logger.info(f"Initializing Llama client with host: {host}, port: {port}")
        
        try:
            self.llama_client = LlamaStackClient(
                base_url=f"http://{host}:{port}",
            )
            logger.info("Llama client initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing Llama client: {str(e)}")
            self.llama_client = None
        
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
    
    def process_invoice_text(self):
        """
        Process invoice text and analyze tariffs for the items.
        
        Returns:
            dict: Combined invoice and tariff analysis results
        """
        if not self.invoiceOutput:
            raise ValueError("No invoice text provided")
            
        # Detect country of origin
        country_info = self.country_detector.detect_country(self.invoiceOutput)
        self.country = country_info['country']
        
        # Parse the invoice
        # invoice_data = self.invoice_parser.parse_invoice(self.invoiceOutput, self.country)
        
        # Analyze tariffs for each item
        tariff_analysis = self.analyze_invoice_tariffs(self.invoiceOutput, self.country)
        
        # Combine results
        result = {
            'invoice_data': self.invoiceOutput,
            'tariff_analysis': tariff_analysis,
            'country_detection': country_info
        }
        
        return result
    
    def analyze_invoice_tariffs(self, text, country_of_origin):
        """
        Analyze tariffs for items in an invoice text.
        
        Args:
            text (str): Raw invoice text
            country_of_origin (str): Country of origin for the items
            
        Returns:
            dict: Tariff analysis results
        """
        tariff_analysis = {
            'items': [],
            'total_tariff_cost': 0.0,
            'summary': {}
        }
        
        # Extract line items from the text using Llama
        line_items = self._extract_line_items_with_llama(text)
        
        analysis = []

        # Analyze each item
        for item in line_items:
            hts_code = item.get('hts_code')
            
            # If no HTS code is found, try to find one using the product description
            if not hts_code:
                product_description = item.get('product', '')
                if product_description:
                    hts_code = self._find_hts_code_for_product(product_description, country_of_origin)
                    if hts_code:
                        item['hts_code'] = hts_code
                        logger.info(f"Found HTS code {hts_code} for product: {product_description}")
                    else:
                        logger.warning(f"No HTS code found for item: {product_description}")
                        # Continue processing even without an HTS code
                        # Use a placeholder HTS code for analysis
                        hts_code = None  # Placeholder HTS code
            
            quantity = float(item.get('quantity', 0))
            unit_price = float(item.get('unit_price', 0))
            total_price = float(item.get('total_price', quantity * unit_price))
            
            # Use the TariffMonitoringAgent to analyze tariffs for this item
            # This will search USTR, USITC, and WTO for tariff information
            item_analysis = self.tariff_agent.analyze_tariffs(hts_code, country_of_origin)
            analysis.append(item_analysis)
            
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
                    'tariff_cost': tariff_cost,
                    'hts_code_found': hts_code != "0000.00.0000"  # Flag to indicate if a real HTS code was found
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
                    'tariff_cost': item['summary']['tariff_cost'],
                    'hts_code_found': item['summary']['hts_code_found']
                }
                for item in tariff_analysis['items']
            ]
        }
        
        return tariff_analysis
    
    def _extract_line_items_with_llama(self, text):
        """
        Extract line items from text using Llama model.
        
        Args:
            text (str): Raw invoice text
            
        Returns:
            list: List of line items with product, quantity, price, and HTS code
        """
        # Check if Llama client is available
        if self.llama_client is None:
            logger.warning("Llama client not available, using fallback method")
            return self._extract_line_items_fallback(text)
            
        try:
            # Prepare the prompt for Llama with specific instructions
            prompt = f"""
            You are an expert at extracting line items from invoice text.
            
            Please analyze the following invoice text and extract all line items.
            
            IMPORTANT INSTRUCTIONS:
            1. Look for lines that contain dollar signs ($) as these typically indicate items with prices
            2. For each line with a dollar sign, extract the following information:
               - Product name/description (the text before or near the dollar sign)
               - Quantity (look for numbers followed by units like "pcs", "units", "ea", etc.)
               - Unit price (the dollar amount with the $ symbol)
               - Total price (if available, otherwise calculate as quantity × unit price)
               - HTS code (if available, look for patterns like "HTS", "HS", or "Tariff" followed by numbers)
            3. If you find multiple dollar amounts on a line, the larger one is likely the total price
            4. If you can't find a specific field, use null or 0 as appropriate
            
            Return the items in a JSON array format, where each item has these fields:
            - product: The product name/description
            - quantity: The quantity as a number
            - unit_price: The unit price as a number (without the $ symbol)
            - total_price: The total price as a number (without the $ symbol)
            - hts_code: The HTS code if available, or null if not found
            
            Here is the invoice text:
            
            {text}
            
            Return ONLY the JSON array with no additional text or explanation.
            """
            
            # Call Llama to extract line items
            response = self.llama_client.inference.chat_completion(
                messages=[
                    SystemMessage(
                        content="You are an expert at extracting structured data from invoice text. Focus on finding items with prices (dollar signs) and extract all relevant information.",
                        role="system",
                    ),
                    UserMessage(
                        content=prompt,
                        role="user",
                    ),
                ],
                model_id="llama3.2:3b",
                stream=False,
            )
            
            # Extract the content from the completion_message
            if hasattr(response, 'completion_message') and hasattr(response.completion_message, 'content'):
                response_text = response.completion_message.content
            else:
                # If completion_message is not available, use fallback
                return self._extract_line_items_fallback(text)
            
            # Clean up the response text
            response_text = response_text.strip()
            
            # Parse the JSON array
            try:
                line_items = json.loads(response_text)
                return line_items
            except json.JSONDecodeError as e:
                logger.error(f"Error parsing JSON from Llama response: {str(e)}")
                return self._extract_line_items_fallback(text)
            
        except Exception as e:
            logger.error(f"Error extracting line items with Llama: {str(e)}", exc_info=True)
            return self._extract_line_items_fallback(text)
    
    def _extract_line_items_fallback(self, text):
        """
        Fallback method to extract line items if Llama fails.
        
        Args:
            text (str): Raw invoice text
            
        Returns:
            list: List of line items
        """
        line_items = []
        
        # Look for HTS codes in the text
        hts_pattern = r'([0-9]{4}\.[0-9]{2}(?:\.[0-9]{2})?)'
        hts_codes = re.findall(hts_pattern, text)
        
        if hts_codes:
            # If HTS codes found, try to associate them with products
            for hts_code in hts_codes:
                # Look for text around the HTS code
                hts_context = re.search(r'([^\n]{0,100})' + re.escape(hts_code) + r'([^\n]{0,100})', text)
                if hts_context:
                    context = hts_context.group(1) + hts_context.group(2)
                    
                    # Try to extract product name
                    product_match = re.search(r'([^\n]+?)\s*(?:hts|code|tariff)', context, re.IGNORECASE)
                    product = product_match.group(1).strip() if product_match else "Unknown Product"
                    
                    # Look for numbers that might be quantities and prices
                    numbers = re.findall(r'\$?\s*(\d+(?:\.\d+)?)', context)
                    
                    if len(numbers) >= 2:
                        # Assume the first number is quantity and the second is price
                        quantity = float(numbers[0])
                        unit_price = float(numbers[1])
                        total_price = quantity * unit_price
                    else:
                        # Default values if no numbers found
                        quantity = 1.0
                        unit_price = 0.0
                        total_price = 0.0
                    
                    line_items.append({
                        'product': product,
                        'quantity': quantity,
                        'unit_price': unit_price,
                        'total_price': total_price,
                        'hts_code': hts_code
                    })
        
        return line_items
    
    def _find_hts_code_for_product(self, product_description, country_of_origin):
        """
        Find the most likely HTS code for a product based on its description.
        
        Args:
            product_description (str): Description of the product
            country_of_origin (str): Country of origin for the product
            
        Returns:
            str: The most likely HTS code, or None if no match is found
        """
        try:
            # Prepare a prompt for the Llama model to find the HTS code
            prompt = f"""
            You are an expert at identifying Harmonized Tariff Schedule (HTS) codes for products.
            
            Please analyze the following product description and determine the most likely HTS code.
            Consider the country of origin ({country_of_origin}) as this may affect the classification.
            
            Product Description: {product_description}
            
            IMPORTANT INSTRUCTIONS:
            1. Return ONLY the HTS code in the format XXXX.XX.XX (e.g., 8542.31.0000)
            2. If you are not confident about the code, return "unknown"
            3. Do not make up or guess HTS codes - accuracy is critical
            4. Do not include any explanation or additional text
            
            Return ONLY the HTS code or the word "unknown".
            """
            
            # Call Llama to find the HTS code
            response = self.llama_client.inference.chat_completion(
                messages=[
                    SystemMessage(
                        content="You are an expert at identifying HTS codes for products based on their descriptions. Only return valid HTS codes or 'unknown' if you're not confident.",
                        role="system",
                    ),
                    UserMessage(
                        content=prompt,
                        role="user",
                    ),
                ],
                model_id="llama3.2:3b",
                stream=False,
            )
            
            # Extract the content from the completion_message
            if hasattr(response, 'completion_message') and hasattr(response.completion_message, 'content'):
                response_text = response.completion_message.content.strip()
            else:
                logger.warning(f"Could not extract content from Llama response for product: {product_description}")
                return None
            
            # Check if the response is "unknown" or similar
            if response_text.lower() in ["unknown", "none", "null", "n/a", "not found", "cannot determine"]:
                logger.info(f"Llama model could not determine HTS code for product: {product_description}")
                return None
            
            # Check if the response is a valid HTS code
            hts_pattern = r'([0-9]{4}\.[0-9]{2}(?:\.[0-9]{2})?)'
            match = re.search(hts_pattern, response_text)
            
            if match:
                hts_code = match.group(1)
                logger.info(f"Found HTS code {hts_code} for product: {product_description}")
                return hts_code
            else:
                logger.warning(f"Llama model returned invalid HTS code format: {response_text}")
                return None
                
        except Exception as e:
            logger.error(f"Error finding HTS code for product: {str(e)}", exc_info=True)
            return None

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