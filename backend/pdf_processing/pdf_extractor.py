from PyPDF2 import PdfReader
import pdfplumber
import logging
import io

def extract_text_from_pdf(pdf_file):
    """
    Extract text from a PDF file with improved table handling.
    
    Args:
        pdf_file: File object containing the PDF
        
    Returns:
        str: Extracted text from the PDF
    """
    try:
        # Create a PDF reader object for basic text extraction
        pdf_reader = PdfReader(pdf_file)
        
        # Extract text from all pages
        text = ""
        
        # Reset file pointer for pdfplumber
        pdf_file.seek(0)
        
        # Use pdfplumber for better table extraction
        with pdfplumber.open(pdf_file) as pdf:
            for i, page in enumerate(pdf.pages):
                # Extract tables
                tables = page.extract_tables()
                
                # Extract regular text
                page_text = page.extract_text()
                
                # Process tables if found
                if tables:
                    # Add table text to the extracted text
                    for table in tables:
                        # Convert table to text format
                        table_text = ""
                        for row in table:
                            # Filter out None values and join with spaces
                            row_text = " ".join([str(cell) if cell is not None else "" for cell in row])
                            table_text += row_text + "\n"
                        
                        # Add table text to the page text
                        page_text += "\n" + table_text
                
                text += page_text + "\n"
            
        return text.strip()
    except Exception as e:
        logging.error(f"Error extracting text from PDF: {str(e)}", exc_info=True)
        raise Exception(f"Failed to extract text from PDF: {str(e)}") 