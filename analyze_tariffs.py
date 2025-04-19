import json
import sys
from backend.tariffSearch import TariffMonitoringAgent

def analyze_tariffs(parsed_data_file):
    """Analyze tariffs for items in the parsed invoice data"""
    print(f"\n=== Analyzing Tariffs for: {parsed_data_file} ===")
    
    # Load the parsed invoice data
    with open(parsed_data_file, 'r') as f:
        invoice_data = json.load(f)
    
    # Create the tariff monitoring agent
    agent = TariffMonitoringAgent(use_mock_data=True)
    
    # Get the country of origin
    country = invoice_data.get('country_of_origin', 'Unknown')
    
    # Analyze each line item
    results = []
    for item in invoice_data.get('line_items', []):
        hts_code = item.get('hts_code')
        if not hts_code:
            print(f"Warning: No HTS code found for item {item.get('description', 'Unknown')}")
            continue
            
        # Get tariff analysis for this item
        analysis = agent.analyze_tariffs(hts_code, country)
        results.append({
            'item': item,
            'analysis': analysis
        })
    
    # Save results to file
    output_file = f"{parsed_data_file.replace('_parsed.json', '_tariff_analysis.json')}"
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\nTariff analysis saved to: {output_file}")
    print("\nTariff Analysis Results:")
    print(json.dumps(results, indent=2))

if __name__ == "__main__":
    # Analyze tariffs for both parsed invoices
    analyze_tariffs("temp_invoice_parsed.json")
    analyze_tariffs("duke_invoice_parsed.json") 