from llama_stack_client import LlamaStackClient
import json
import logging
import re
import os
import tempfile
from PIL import Image
import pytesseract
import pdf2image

class InvoiceParser:
    def __init__(self):
        """
        Initialize the invoice parser with multiple parsing strategies.
        """
        self.llama = LlamaStackClient(base_url="http://localhost:8321")
        
        # System prompt for invoice understanding
        self.system_prompt = """
        You are an expert at understanding invoices. You will be given raw OCR or extracted text from a vendor invoice.
        Your job is to extract and return structured data including:
        - Vendor Name (the company selling the goods/services)
        - Country of Origin (where the goods are manufactured or produced)
        - Line items with: Product Description, Quantity, Unit Price, Total Price, Country of Origin
        - Total Amount

        Return your output as a structured JSON object in this format:

        {
          "vendor_name": "...",
          "country_of_origin": "...",
          "line_items": [
            {
              "product": "...",
              "quantity": ...,
              "unit_price": ...,
              "total_price": ...,
              "country_of_origin": "..."
            },
            ...
          ],
          "total_amount": ...
        }
        """
    
    def parse_invoice(self, text, pdf_path=None):
        """
        Parse invoice text and extract structured data using multiple strategies.
        
        Args:
            text (str): Raw text from invoice
            pdf_path (str, optional): Path to the PDF file for OCR
            
        Returns:
            dict: Structured invoice data
        """
        try:
            # Try multiple parsing strategies in order of reliability
            
            # Strategy 1: Try to use Llama for understanding
            result = self._parse_with_llama(text)
            if result and self._is_valid_result(result):
                logging.info("Successfully parsed with Llama")
                return result
            
            # Strategy 2: Try OCR if PDF path is provided
            if pdf_path and os.path.exists(pdf_path):
                ocr_text = self._extract_text_with_ocr(pdf_path)
                if ocr_text and len(ocr_text) > len(text):
                    logging.info("Using OCR text for parsing")
                    result = self._parse_with_patterns(ocr_text)
                    if result and self._is_valid_result(result):
                        return result
            
            # Strategy 3: Use pattern matching on the original text
            logging.info("Using pattern matching for parsing")
            return self._parse_with_patterns(text)
                
        except Exception as e:
            logging.error(f"Error parsing invoice: {str(e)}", exc_info=True)
            # Return a minimal valid result
            return {
                "vendor_name": "Unknown",
                "country_of_origin": "Unknown",
                "line_items": [],
                "total_amount": 0.0
            }
    
    def _parse_with_llama(self, text):
        """
        Parse invoice using Llama.
        
        Args:
            text (str): Raw text from invoice
            
        Returns:
            dict: Structured invoice data or None if parsing fails
        """
        try:
            # Prepare the prompt
            prompt = f"""
            {self.system_prompt}
            
            Here is the invoice text:
            
            {text}
            
            Extract the information and return it as a JSON object.
            """
            
            # Call Llama for parsing
            try:
                # Try to use the chat method if available
                if hasattr(self.llama, 'chat'):
                    response = self.llama.chat(prompt)
                else:
                    # Fall back to a simpler method if chat is not available
                    logging.warning("LlamaStackClient does not have a chat method, using fallback parsing")
                    return self._parse_with_patterns(text)
                
                # Extract the JSON from the response
                if response and "content" in response:
                    content = response["content"]
                    
                    # Try to find JSON in the response
                    json_match = re.search(r'```json\s*(.*?)\s*```', content, re.DOTALL)
                    if json_match:
                        json_str = json_match.group(1)
                    else:
                        # Try to find any JSON-like structure
                        json_match = re.search(r'\{.*\}', content, re.DOTALL)
                        if json_match:
                            json_str = json_match.group(0)
                        else:
                            return None
                    
                    # Parse the JSON
                    result = json.loads(json_str)
                    return result
            except Exception as e:
                logging.error(f"Error calling Llama: {str(e)}", exc_info=True)
                return None
            
            return None
            
        except Exception as e:
            logging.error(f"Error parsing with Llama: {str(e)}", exc_info=True)
            return None
    
    def _parse_with_patterns(self, text):
        """
        Parse invoice using pattern matching.
        
        Args:
            text (str): Raw text from invoice
            
        Returns:
            dict: Structured invoice data
        """
        # Split text into lines
        lines = text.split('\n')
        
        # Extract vendor name
        vendor_name = self._extract_vendor_name(lines)
        
        # Extract country of origin
        country_of_origin = self._extract_country_of_origin(lines)
        
        # Extract line items
        line_items = self._extract_line_items(lines)
        
        # Extract total amount
        total_amount = self._extract_total_amount(lines)
        
        # Construct result
        result = {
            "vendor_name": vendor_name,
            "country_of_origin": country_of_origin,
            "line_items": line_items,
            "total_amount": total_amount
        }
        
        return result
    
    def _extract_vendor_name(self, lines):
        """
        Extract vendor name from invoice lines.
        
        Args:
            lines (list): List of invoice lines
            
        Returns:
            str: Vendor name or "Unknown"
        """
        # Common patterns for vendor name
        patterns = [
            r'vendor\s*:?\s*([^\n]+)',
            r'supplier\s*:?\s*([^\n]+)',
            r'from\s*:?\s*([^\n]+)',
            r'bill\s*to\s*:?\s*([^\n]+)',
            r'sold\s*by\s*:?\s*([^\n]+)',
            r'company\s*:?\s*([^\n]+)',
            r'business\s*:?\s*([^\n]+)'
        ]
        
        # Check each line against patterns
        for line in lines:
            for pattern in patterns:
                match = re.search(pattern, line, re.IGNORECASE)
                if match:
                    return match.group(1).strip()
        
        # If no match found, return the first non-empty line
        for line in lines:
            if line.strip():
                return line.strip()
        
        return "Unknown"
    
    def _extract_country_of_origin(self, lines):
        """
        Extract country of origin from invoice lines.
        
        Args:
            lines (list): List of invoice lines
            
        Returns:
            str: Country of origin or "Unknown"
        """
        # Common patterns for country of origin
        patterns = [
            r'country\s*of\s*origin\s*:?\s*([^\n]+)',
            r'origin\s*:?\s*([^\n]+)',
            r'made\s*in\s*:?\s*([^\n]+)',
            r'manufactured\s*in\s*:?\s*([^\n]+)',
            r'produced\s*in\s*:?\s*([^\n]+)'
        ]
        
        # List of common countries
        countries = [
            "China", "Mexico", "Canada", "Japan", "Germany", "United States", 
            "USA", "UK", "United Kingdom", "France", "Italy", "Spain", 
            "Brazil", "India", "South Korea", "Taiwan", "Vietnam", "Thailand",
            "Malaysia", "Indonesia", "Philippines", "Singapore", "Hong Kong"
        ]
        
        # Check each line against patterns
        for line in lines:
            for pattern in patterns:
                match = re.search(pattern, line, re.IGNORECASE)
                if match:
                    return match.group(1).strip()
            
            # Check for country names in the line
            for country in countries:
                if re.search(r'\b' + re.escape(country) + r'\b', line, re.IGNORECASE):
                    return country
        
        return "Unknown"
    
    def _extract_line_items(self, lines):
        """
        Extract line items from invoice lines.
        
        Args:
            lines (list): List of invoice lines
            
        Returns:
            list: List of line items
        """
        line_items = []
        current_item = None
        
        # Find the Items section
        items_started = False
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Check if we've reached the Items section
            if line.lower().startswith('items:'):
                items_started = True
                continue
            
            if not items_started:
                continue
            
            # Check if this is a new item (starts with a number)
            if re.match(r'^\d+\.', line):
                # Save the previous item if it exists
                if current_item is not None:
                    line_items.append(current_item)
                
                # Start a new item
                current_item = {
                    'product': line.split('.', 1)[1].strip(),
                    'quantity': 0,
                    'unit_price': 0.0,
                    'total_price': 0.0
                }
                continue
            
            # Skip if we haven't started an item yet
            if current_item is None:
                continue
            
            # Extract HTS code
            hts_match = re.search(r'hts\s*code\s*:?\s*([0-9\.]+)', line, re.IGNORECASE)
            if hts_match:
                current_item['hts_code'] = hts_match.group(1)
                continue
            
            # Extract quantity
            qty_match = re.search(r'quantity\s*:?\s*(\d+(?:\.\d+)?)', line, re.IGNORECASE)
            if qty_match:
                current_item['quantity'] = float(qty_match.group(1))
                continue
            
            # Extract unit price
            price_match = re.search(r'unit\s*price\s*:?\s*\$?\s*(\d+(?:\.\d+)?)', line, re.IGNORECASE)
            if price_match:
                current_item['unit_price'] = float(price_match.group(1))
                continue
            
            # Extract total price
            total_match = re.search(r'total\s*:?\s*\$?\s*(\d+(?:\.\d+)?)', line, re.IGNORECASE)
            if total_match:
                current_item['total_price'] = float(total_match.group(1))
                continue
        
        # Add the last item if it exists
        if current_item is not None:
            line_items.append(current_item)
        
        return line_items
    
    def _parse_line_item(self, line):
        """
        Parse a single line item.
        
        Args:
            line (str): Line item text
            
        Returns:
            dict: Parsed line item or None
        """
        # Try to extract product, quantity, unit price, and total price
        # This is a simplified approach and may need refinement
        
        # Look for patterns like "Product: X, Quantity: Y, Price: Z, Total: W"
        product_match = re.search(r'product\s*:?\s*([^,]+)', line, re.IGNORECASE)
        quantity_match = re.search(r'quantity\s*:?\s*(\d+(?:\.\d+)?)', line, re.IGNORECASE)
        price_match = re.search(r'price\s*:?\s*\$?\s*(\d+(?:\.\d+)?)', line, re.IGNORECASE)
        total_match = re.search(r'total\s*:?\s*\$?\s*(\d+(?:\.\d+)?)', line, re.IGNORECASE)
        
        if product_match:
            product = product_match.group(1).strip()
            quantity = float(quantity_match.group(1)) if quantity_match else 1.0
            unit_price = float(price_match.group(1)) if price_match else 0.0
            total_price = float(total_match.group(1)) if total_match else quantity * unit_price
            
            # Try to extract country of origin for this item
            country_of_origin = self._extract_country_of_origin([line])
            
            return {
                "product": product,
                "quantity": quantity,
                "unit_price": unit_price,
                "total_price": total_price,
                "country_of_origin": country_of_origin
            }
        
        return None
    
    def _parse_line_item_aggressive(self, line):
        """
        More aggressive parsing of a line item.
        
        Args:
            line (str): Line item text
            
        Returns:
            dict: Parsed line item or None
        """
        # Try to extract numbers that might be quantities and prices
        numbers = re.findall(r'\$?\s*(\d+(?:\.\d+)?)', line)
        
        if len(numbers) >= 2:
            # Assume the first number is quantity and the second is price
            quantity = float(numbers[0])
            unit_price = float(numbers[1])
            total_price = quantity * unit_price
            
            # Extract product name (everything before the first number)
            product_match = re.match(r'^([^0-9$]+)', line)
            product = product_match.group(1).strip() if product_match else "Unknown Product"
            
            # Try to extract country of origin for this item
            country_of_origin = self._extract_country_of_origin([line])
            
            return {
                "product": product,
                "quantity": quantity,
                "unit_price": unit_price,
                "total_price": total_price,
                "country_of_origin": country_of_origin
            }
        
        return None
    
    def _extract_total_amount(self, lines):
        """
        Extract total amount from invoice lines.
        
        Args:
            lines (list): List of invoice lines
            
        Returns:
            float: Total amount or 0.0
        """
        # Common patterns for total amount
        patterns = [
            r'total\s*amount\s*:?\s*\$?\s*(\d+(?:\.\d+)?)',
            r'total\s*:?\s*\$?\s*(\d+(?:\.\d+)?)',
            r'amount\s*due\s*:?\s*\$?\s*(\d+(?:\.\d+)?)',
            r'balance\s*due\s*:?\s*\$?\s*(\d+(?:\.\d+)?)',
            r'grand\s*total\s*:?\s*\$?\s*(\d+(?:\.\d+)?)'
        ]
        
        # Check each line against patterns
        for line in lines:
            for pattern in patterns:
                match = re.search(pattern, line, re.IGNORECASE)
                if match:
                    return float(match.group(1))
        
        return 0.0
    
    def _is_valid_result(self, result):
        """
        Check if the parsing result is valid.
        
        Args:
            result (dict): Parsing result
            
        Returns:
            bool: True if valid, False otherwise
        """
        if not isinstance(result, dict):
            return False
        
        # Check required fields
        required_fields = ["vendor_name", "line_items"]
        for field in required_fields:
            if field not in result:
                return False
        
        # Check line items
        if not isinstance(result["line_items"], list):
            return False
        
        # If we have line items, check their structure
        if result["line_items"]:
            item = result["line_items"][0]
            if not isinstance(item, dict):
                return False
            
            # Check required fields in line items
            required_item_fields = ["product", "quantity", "unit_price", "total_price"]
            for field in required_item_fields:
                if field not in item:
                    return False
        
        return True
    
    def _extract_text_with_ocr(self, pdf_path):
        """
        Extract text from PDF using OCR.
        
        Args:
            pdf_path (str): Path to PDF file
            
        Returns:
            str: Extracted text
        """
        try:
            # Convert PDF to images
            images = pdf2image.convert_from_path(pdf_path)
            
            # Extract text from each image
            text = ""
            for i, image in enumerate(images):
                # Save image to temporary file
                with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as temp_file:
                    image.save(temp_file.name)
                
                # Extract text using Tesseract
                page_text = pytesseract.image_to_string(Image.open(temp_file.name))
                text += page_text + "\n\n"
                
                # Clean up temporary file
                os.unlink(temp_file.name)
            
            return text
            
        except Exception as e:
            logging.error(f"Error extracting text with OCR: {str(e)}", exc_info=True)
            return "" 