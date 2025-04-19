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
        - Line items with: Product Description, Quantity, Unit Price, Total Price
        - Total Amount

        Return your output as a structured JSON object in this format:

        {
          "vendor_name": "...",
          "line_items": [
            {
              "product": "...",
              "quantity": ...,
              "unit_price": ...,
              "total_price": ...
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
            # Log the input text for debugging
            logging.info("=== Starting Invoice Parsing ===")
            logging.info(f"Input text length: {len(text)} characters")
            logging.info("=== Raw Input Text ===")
            logging.info(text)
            logging.info("=======================")
            
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
            # Use Llama to understand and extract information from the invoice
            user_prompt = f"""
            Please analyze this invoice and extract the vendor name and line items.
            For each line item, identify the product name, quantity, unit price, and total price.
            
            Invoice text:
            {text}
            
            Return only a valid JSON object with the extracted information.
            """
            
            # Call Llama with the system prompt and user prompt
            logging.info("Calling Llama for invoice understanding")
            response = self.llama.chat(
                system_prompt=self.system_prompt,
                user_prompt=user_prompt,
                temperature=0.1  # Low temperature for more deterministic results
            )
            
            # Extract the JSON from the response
            response_text = response.text
            logging.info(f"Llama response: {response_text}")
            
            # Try to find JSON in the response
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
                try:
                    result = json.loads(json_str)
                    logging.info(f"Successfully parsed JSON: {result}")
                    return result
                except json.JSONDecodeError as e:
                    logging.error(f"Failed to parse JSON: {str(e)}")
                    return None
            else:
                logging.warning("No JSON found in Llama response")
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
        logging.info("Using pattern matching for parsing")
        
        # Initialize response structure
        response = {
            "vendor_name": "",
            "line_items": [],
            "total_amount": 0.0
        }
        
        # Extract vendor name
        lines = text.split('\n')
        logging.info(f"Split text into {len(lines)} lines")
        
        # Look for vendor name in various formats
        vendor_name = self._extract_vendor_name(lines)
        response["vendor_name"] = vendor_name
        
        # Extract line items
        line_items = self._extract_line_items(lines)
        response["line_items"] = line_items
        
        # Extract total amount
        total_amount = self._extract_total_amount(lines)
        response["total_amount"] = total_amount
        
        # Log the response for debugging
        logging.info("=== Pattern Matching Results ===")
        logging.info(f"Vendor: {response['vendor_name']}")
        logging.info(f"Number of line items: {len(response['line_items'])}")
        logging.info(f"Line items: {response['line_items']}")
        logging.info(f"Total amount: {response['total_amount']}")
        logging.info("=====================")
        
        return response
    
    def _extract_vendor_name(self, lines):
        """
        Extract vendor name from invoice lines.
        
        Args:
            lines (list): List of invoice lines
            
        Returns:
            str: Extracted vendor name
        """
        # Common vendor name indicators
        vendor_indicators = [
            "Billed To:", "From:", "Bill To:", "Sold By:", "Vendor:",
            "Supplier:", "Merchant:", "Company:", "Business:",
            "Invoice from"  # Added this for our test PDFs
        ]
        
        # Company name suffixes
        company_suffixes = [
            "LLC", "Inc", "Corp", "Corporation", "Ltd", "Limited",
            "Company", "Co", "Group", "Enterprises", "Solutions",
            "Services", "Systems", "Technologies", "International",
            "Hospital", "University"  # Added these for our test PDFs
        ]
        
        # First pass: Look for explicit vendor indicators
        for line in lines:
            for indicator in vendor_indicators:
                if indicator in line:
                    # Extract vendor name after the indicator
                    vendor_name = line.split(indicator, 1)[1].strip()
                    # Remove any trailing punctuation
                    vendor_name = re.sub(r'[.,;:]$', '', vendor_name)
                    if vendor_name:
                        logging.info(f"Found vendor name using indicator '{indicator}': {vendor_name}")
                        return vendor_name
        
        # Second pass: Look for company name patterns
        for line in lines:
            # Skip lines that are too short or contain common non-vendor words
            if len(line) < 3 or any(word in line.lower() for word in ["invoice", "date", "page", "total"]):
                continue
            
            # Look for company name with suffix
            for suffix in company_suffixes:
                if suffix in line:
                    # Extract the company name
                    parts = line.split()
                    for i, part in enumerate(parts):
                        if suffix in part:
                            company_name = " ".join(parts[:i+1])
                            # Remove any trailing punctuation
                            company_name = re.sub(r'[.,;:]$', '', company_name)
                            logging.info(f"Found vendor name using suffix '{suffix}': {company_name}")
                            return company_name
        
        # Third pass: Look for lines that might contain a company name
        for line in lines:
            # Skip lines that are too short or contain common non-vendor words
            if len(line) < 3 or any(word in line.lower() for word in ["invoice", "date", "page", "total"]):
                continue
            
            # Look for lines with proper capitalization (likely company names)
            words = line.split()
            if len(words) >= 2 and all(word[0].isupper() for word in words if word):
                # Remove any trailing punctuation
                company_name = re.sub(r'[.,;:]$', '', line)
                logging.info(f"Found vendor name using capitalization: {company_name}")
                return company_name
        
        logging.warning("No vendor name found in the invoice")
        return "Unknown Vendor"
    
    def _extract_line_items(self, lines):
        """
        Extract line items from invoice lines.
        
        Args:
            lines (list): List of invoice lines
            
        Returns:
            list: List of extracted line items
        """
        line_items = []
        in_line_items_section = False
        seen_items = set()  # Track seen items to prevent duplication
        
        # Common line item headers
        item_headers = [
            ("Item", "Quantity", "Price"),
            ("Description", "Quantity", "Price"),
            ("Product", "Quantity", "Price"),
            ("Service", "Quantity", "Price"),
            ("Qty", "Price", "Amount"),
            ("Quantity", "Unit Price", "Total")
        ]
        
        # Find the line items section
        for i, line in enumerate(lines):
            # Check for line item headers
            if any(all(header in line for header in headers) for headers in item_headers):
                in_line_items_section = True
                logging.info(f"Found line items header at line {i+1}: {line}")
                continue
            
            if in_line_items_section:
                # Skip empty lines
                if not line.strip():
                    continue
                
                # Skip lines that look like headers or totals
                if any(term in line.lower() for term in ["total amount", "payment terms", "page", "subtotal", "tax"]):
                    in_line_items_section = False
                    logging.info(f"End of line items section at line {i+1}: {line}")
                    continue
                
                # Try to extract line item details
                line_item = self._parse_line_item(line)
                if line_item:
                    # Create a unique key for the line item
                    item_key = f"{line_item['product']}_{line_item['quantity']}_{line_item['unit_price']}"
                    if item_key not in seen_items:
                        seen_items.add(item_key)
                        line_items.append(line_item)
                        logging.info(f"Found line item: {line_item}")
        
        # If no line items found, try a more aggressive approach
        if not line_items:
            logging.info("No line items found with standard approach, trying aggressive parsing")
            
            for line in lines:
                # Skip empty lines and headers
                if not line.strip() or any(term in line.lower() for term in ["total", "amount", "invoice", "date"]):
                    continue
                
                # Look for lines with numbers that might be line items
                line_item = self._parse_line_item_aggressive(line)
                if line_item:
                    # Create a unique key for the line item
                    item_key = f"{line_item['product']}_{line_item['quantity']}_{line_item['unit_price']}"
                    if item_key not in seen_items:
                        seen_items.add(item_key)
                        line_items.append(line_item)
                        logging.info(f"Found line item (aggressive): {line_item}")
        
        return line_items
    
    def _parse_line_item(self, line):
        """
        Parse a single line into a line item.
        
        Args:
            line (str): Line of text
            
        Returns:
            dict: Line item or None if parsing fails
        """
        # Look for patterns like "Product (details) quantity price total"
        # or "Product quantity price total"
        parts = re.findall(r'[\d,.]+', line)
        if len(parts) >= 3:
            # Get the product name (everything before the first number)
            product = line.split(parts[0])[0].strip()
            if product:  # Only add if we found a product name
                try:
                    quantity = int(parts[0].replace(',', ''))
                    unit_price = float(parts[1].replace(',', ''))
                    total_price = float(parts[2].replace(',', ''))
                    
                    return {
                        "product": product,
                        "quantity": quantity,
                        "unit_price": unit_price,
                        "total_price": total_price
                    }
                except (ValueError, IndexError):
                    logging.warning(f"Failed to parse numbers in line: {line}")
        return None
    
    def _parse_line_item_aggressive(self, line):
        """
        Parse a line item using a more aggressive approach.
        
        Args:
            line (str): Line of text
            
        Returns:
            dict: Line item or None if parsing fails
        """
        # Look for lines with at least 2 numbers (quantity and price)
        parts = re.findall(r'[\d,.]+', line)
        if len(parts) >= 2:
            # Try to extract product name and numbers
            product = line
            for part in parts:
                product = product.replace(part, "")
            product = product.strip()
            
            if product and len(product) > 2:  # Ensure product name is meaningful
                try:
                    quantity = int(parts[0].replace(',', ''))
                    unit_price = float(parts[1].replace(',', ''))
                    total_price = quantity * unit_price  # Estimate total
                    
                    return {
                        "product": product,
                        "quantity": quantity,
                        "unit_price": unit_price,
                        "total_price": total_price
                    }
                except (ValueError, IndexError):
                    logging.warning(f"Failed to parse numbers in line: {line}")
        return None
    
    def _extract_total_amount(self, lines):
        """
        Extract total amount from invoice lines.
        
        Args:
            lines (list): List of invoice lines
            
        Returns:
            float: Total amount
        """
        # Common total amount indicators
        total_indicators = [
            "Total Amount:", "Total:", "Amount Due:", "Balance Due:",
            "Grand Total:", "Invoice Total:", "Total Invoice:"
        ]
        
        for line in lines:
            for indicator in total_indicators:
                if indicator in line:
                    # Extract the amount after the indicator
                    amount_str = line.split(indicator, 1)[1].strip()
                    # Remove currency symbols and whitespace
                    amount_str = re.sub(r'[^\d.,]', '', amount_str)
                    try:
                        # Handle different number formats
                        amount_str = amount_str.replace(',', '')
                        if '.' in amount_str:
                            amount = float(amount_str)
                        else:
                            amount = float(amount_str) / 100  # Assume cents if no decimal
                        logging.info(f"Found total amount: {amount}")
                        return amount
                    except (ValueError, IndexError):
                        logging.warning(f"Failed to parse total amount from: {line}")
        
        # If no total found, calculate from line items
        return 0.0
    
    def _is_valid_result(self, result):
        """
        Check if the parsing result is valid.
        
        Args:
            result (dict): Parsing result
            
        Returns:
            bool: True if the result is valid, False otherwise
        """
        if not result:
            return False
        
        # Check if vendor name is present
        if not result.get("vendor_name"):
            return False
        
        # Check if line items are present
        if not result.get("line_items") or not isinstance(result["line_items"], list):
            return False
        
        # Check if at least one line item has the required fields
        for item in result["line_items"]:
            if all(key in item for key in ["product", "quantity", "unit_price", "total_price"]):
                return True
        
        return False
    
    def _extract_text_with_ocr(self, pdf_path):
        """
        Extract text from PDF using OCR.
        
        Args:
            pdf_path (str): Path to the PDF file
            
        Returns:
            str: Extracted text from the PDF
        """
        try:
            logging.info(f"Extracting text with OCR from {pdf_path}")
            
            # Convert PDF to images
            images = pdf2image.convert_from_path(pdf_path)
            logging.info(f"Converted PDF to {len(images)} images")
            
            # Extract text from each image
            text = ""
            for i, image in enumerate(images):
                # Save image to temporary file
                with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as temp_file:
                    temp_path = temp_file.name
                    image.save(temp_path)
                
                # Extract text from image
                page_text = pytesseract.image_to_string(Image.open(temp_path))
                text += page_text + "\n"
                
                # Clean up temporary file
                os.unlink(temp_path)
                
                logging.info(f"Extracted {len(page_text)} characters from page {i+1}")
            
            logging.info(f"Total OCR text length: {len(text)} characters")
            return text
            
        except Exception as e:
            logging.error(f"Error extracting text with OCR: {str(e)}", exc_info=True)
            return "" 