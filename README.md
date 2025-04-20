# Tariff Invoice Processing System

A system for processing invoices and analyzing tariffs for imported goods.

## Project Structure

```
Tariff/
├── backend/                  # Backend server code
│   ├── api/                  # API routes and endpoints
│   │   ├── invoice_routes.py # Invoice processing API endpoints
│   │   └── __init__.py
│   ├── core/                 # Core application logic
│   │   ├── main.py           # Main application entry point
│   │   ├── tariff_invoice_integration.py # Integration between invoice parsing and tariff analysis
│   │   ├── demo.py           # Demo script for testing
│   │   └── __init__.py
│   ├── pdf_processing/       # PDF extraction and parsing
│   │   ├── pdf_extractor.py  # PDF text extraction
│   │   ├── invoice_parser.py # Invoice parsing logic
│   │   └── __init__.py
│   ├── tariff_research/      # Tariff search and analysis
│   │   ├── tariffSearch.py   # Tariff search functionality
│   │   ├── analyze_tariffs.py # Tariff analysis utilities
│   │   └── __init__.py
│   ├── run.py                # Server entry point
│   └── requirements.txt       # Backend dependencies
├── frontend/                 # Frontend application
│   ├── src/                  # Source code
│   │   ├── app/              # Next.js app directory
│   │   ├── components/       # React components
│   │   └── lib/              # Utility libraries
│   ├── public/               # Static assets
│   └── package.json          # Frontend dependencies
├── test_custom_pdf.py        # Test script for PDF processing
└── requirements.txt          # Root dependencies
```

## Getting Started

### Backend

1. Install dependencies:
   ```
   pip install -r backend/requirements.txt
   ```

2. Start the server:
   ```
   python backend/run.py
   ```

### Frontend

1. Install dependencies:
   ```
   cd frontend
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

## Testing

Run the test script to test PDF processing:
```
python test_custom_pdf.py
```

## Demo

Run the demo script to test the full system:
```
python backend/core/demo.py
``` 