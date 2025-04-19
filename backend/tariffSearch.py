from llama_index.core.agent import ReActAgent
from llama_index.core.tools import FunctionTool
from llama_index.llms.openai import OpenAI
import requests
from bs4 import BeautifulSoup
from typing import Dict, List, Any
import json
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Mock data for testing
MOCK_DATA = {
    "7208.39.00": {
        "China": {
            "ustr": {
                "source": "USTR",
                "hts_code": "7208.39.00",
                "country": "China",
                "base_rate": "25%",
                "effective_date": "2023-06-01T00:00:00",
                "special_programs": [],
                "notes": "Subject to Section 301 tariffs"
            },
            "usitc": {
                "source": "USITC",
                "hts_code": "7208.39.00",
                "country": "China",
                "current_rate": "25%",
                "historical_rates": [
                    {"date": "2023-01-01", "rate": "10%"},
                    {"date": "2023-06-01", "rate": "25%"}
                ],
                "trade_volume": "1.2B USD",
                "import_restrictions": ["Anti-dumping duties may apply"]
            },
            "wto": {
                "source": "WTO",
                "hts_code": "7208.39.00",
                "country": "China",
                "bound_rate": "30%",
                "applied_rate": "25%",
                "tariff_quotas": None,
                "special_safeguards": ["Anti-dumping measures in place"]
            }
        },
        "Mexico": {
            "ustr": {
                "source": "USTR",
                "hts_code": "7208.39.00",
                "country": "Mexico",
                "base_rate": "0%",
                "effective_date": "2020-07-01T00:00:00",
                "special_programs": ["USMCA"],
                "notes": "Free trade under USMCA"
            },
            "usitc": {
                "source": "USITC",
                "hts_code": "7208.39.00",
                "country": "Mexico",
                "current_rate": "0%",
                "historical_rates": [
                    {"date": "2020-01-01", "rate": "0%"},
                    {"date": "2020-07-01", "rate": "0%"}
                ],
                "trade_volume": "850M USD",
                "import_restrictions": []
            },
            "wto": {
                "source": "WTO",
                "hts_code": "7208.39.00",
                "country": "Mexico",
                "bound_rate": "10%",
                "applied_rate": "0%",
                "tariff_quotas": None,
                "special_safeguards": []
            }
        }
    }
}

class TariffData:
    def __init__(self, use_mock_data=True):
        self.use_mock_data = use_mock_data
        self.sources = {
            'ustr': 'https://ustr.gov/tariff-schedule',
            'usitc': 'https://dataweb.usitc.gov/',
            'wto': 'https://tariffdata.wto.org/'
        }

    def fetch_ustr_data(self, hts_code: str, country: str) -> Dict[str, Any]:
        """Fetch tariff data from USTR database"""
        if self.use_mock_data:
            if hts_code in MOCK_DATA and country in MOCK_DATA[hts_code]:
                return MOCK_DATA[hts_code][country]["ustr"]
            return {
                "source": "USTR",
                "hts_code": hts_code,
                "country": country,
                "base_rate": "N/A",
                "effective_date": datetime.now().isoformat(),
                "special_programs": [],
                "notes": "No data available"
            }
        
        # In production, implement proper API calls to USTR
        return {
            "source": "USTR",
            "hts_code": hts_code,
            "country": country,
            "base_rate": "25%",
            "effective_date": datetime.now().isoformat(),
            "special_programs": ["GSP", "CAFTA-DR"],
            "notes": "Subject to Section 301 tariffs"
        }

    def fetch_usitc_data(self, hts_code: str, country: str) -> Dict[str, Any]:
        """Fetch tariff data from USITC database"""
        if self.use_mock_data:
            if hts_code in MOCK_DATA and country in MOCK_DATA[hts_code]:
                return MOCK_DATA[hts_code][country]["usitc"]
            return {
                "source": "USITC",
                "hts_code": hts_code,
                "country": country,
                "current_rate": "N/A",
                "historical_rates": [],
                "trade_volume": "N/A",
                "import_restrictions": []
            }
        
        # In production, implement proper API calls to USITC
        return {
            "source": "USITC",
            "hts_code": hts_code,
            "country": country,
            "current_rate": "25%",
            "historical_rates": [
                {"date": "2023-01-01", "rate": "10%"},
                {"date": "2023-06-01", "rate": "25%"}
            ],
            "trade_volume": "1.2B USD",
            "import_restrictions": ["Anti-dumping duties may apply"]
        }

    def fetch_wto_data(self, hts_code: str, country: str) -> Dict[str, Any]:
        """Fetch tariff data from WTO database"""
        if self.use_mock_data:
            if hts_code in MOCK_DATA and country in MOCK_DATA[hts_code]:
                return MOCK_DATA[hts_code][country]["wto"]
            return {
                "source": "WTO",
                "hts_code": hts_code,
                "country": country,
                "bound_rate": "N/A",
                "applied_rate": "N/A",
                "tariff_quotas": None,
                "special_safeguards": []
            }
        
        # In production, implement proper API calls to WTO
        return {
            "source": "WTO",
            "hts_code": hts_code,
            "country": country,
            "bound_rate": "30%",
            "applied_rate": "25%",
            "tariff_quotas": None,
            "special_safeguards": ["Anti-dumping measures in place"]
        }

class TariffMonitoringAgent:
    def __init__(self, use_mock_data=True, use_mock_llm=True):
        self.tariff_data = TariffData(use_mock_data=use_mock_data)
        
        # Use mock LLM if specified or if no API key is available
        if use_mock_llm or not os.getenv("OPENAI_API_KEY"):
            self.llm = self._create_mock_llm()
        else:
            self.llm = OpenAI(model="gpt-4")
        
        # Define tools for the agent
        self.tools = [
            FunctionTool.from_defaults(
                fn=self.tariff_data.fetch_ustr_data,
                name="fetch_ustr_data",
                description="Fetch current tariff rates from USTR database"
            ),
            FunctionTool.from_defaults(
                fn=self.tariff_data.fetch_usitc_data,
                name="fetch_usitc_data",
                description="Fetch historical tariff data from USITC database"
            ),
            FunctionTool.from_defaults(
                fn=self.tariff_data.fetch_wto_data,
                name="fetch_wto_data",
                description="Fetch WTO bound and applied tariff rates"
            )
        ]

        # Create a simple agent without using ReActAgent
        self.agent = self._create_simple_agent()

    def _create_simple_agent(self):
        """Create a simple agent that doesn't rely on ReActAgent"""
        class SimpleAgent:
            def __init__(self, tools, llm):
                self.tools = tools
                self.llm = llm
                
            def query(self, query):
                # Extract HTS code and country from the query
                hts_code = None
                country = None
                
                if "HTS code" in query:
                    parts = query.split("HTS code")
                    if len(parts) > 1:
                        hts_part = parts[1].split()[0].strip()
                        hts_code = hts_part
                
                if "from" in query:
                    parts = query.split("from")
                    if len(parts) > 1:
                        country_part = parts[1].split()[0].strip()
                        country = country_part
                
                # If we couldn't extract the information, return a generic response
                if not hts_code or not country:
                    return "I couldn't determine the HTS code or country from your query. Please provide both."
                
                # Use the mock LLM to generate a response
                if hasattr(self.llm, 'chat'):
                    response = self.llm.chat([{"role": "user", "content": query}])
                    if "choices" in response and len(response["choices"]) > 0:
                        return response["choices"][0]["message"]["content"]
                
                # Fallback response
                return f"Analysis for HTS code {hts_code} from {country} would go here."
        
        return SimpleAgent(self.tools, self.llm)

    def _create_mock_llm(self):
        """Create a mock LLM for testing without API calls"""
        class MockLLM:
            def __init__(self):
                self.metadata = type('Metadata', (), {
                    'context_window': 4096,
                    'num_output': 1024,
                    'is_chat_model': True
                })()
                
            def chat(self, messages, **kwargs):
                # Extract the query from the messages
                query = messages[-1]["content"] if messages else "No query provided"
                
                # Generate a mock response based on the query
                if "7208.39.00" in query and "China" in query:
                    return {
                        "choices": [{
                            "message": {
                                "content": """
                                Based on the tariff data for HTS code 7208.39.00 (flat-rolled steel products) from China:
                                
                                Current tariff rate: 25% (increased from 10% in January 2023)
                                This product is subject to Section 301 tariffs and anti-dumping duties.
                                
                                Key findings:
                                1. The 25% tariff represents a significant increase from the previous 10% rate
                                2. Anti-dumping duties may apply in addition to the base tariff
                                3. No special trade programs currently apply to reduce these tariffs
                                4. The WTO bound rate is 30%, so the current rate is within international commitments
                                
                                Recommendations for US businesses:
                                1. Consider alternative sourcing from USMCA countries like Mexico (0% tariff)
                                2. Evaluate the total landed cost including tariffs and anti-dumping duties
                                3. Monitor for potential changes in trade policy or special program eligibility
                                4. Document compliance with all applicable regulations
                                """
                            }
                        }]
                    }
                elif "7208.39.00" in query and "Mexico" in query:
                    return {
                        "choices": [{
                            "message": {
                                "content": """
                                Based on the tariff data for HTS code 7208.39.00 (flat-rolled steel products) from Mexico:
                                
                                Current tariff rate: 0% (free trade under USMCA)
                                This product qualifies for duty-free treatment under the USMCA agreement.
                                
                                Key findings:
                                1. The 0% tariff provides a significant cost advantage compared to non-USMCA sources
                                2. No anti-dumping duties apply to imports from Mexico
                                3. The USMCA agreement provides preferential treatment for this product
                                4. The WTO bound rate is 10%, but the applied rate is 0% under the trade agreement
                                
                                Recommendations for US businesses:
                                1. Leverage the USMCA benefits for cost savings
                                2. Ensure proper documentation for USMCA origin claims
                                3. Consider expanding sourcing from Mexico for this product category
                                4. Monitor for any changes to USMCA implementation or eligibility
                                """
                            }
                        }]
                    }
                else:
                    return {
                        "choices": [{
                            "message": {
                                "content": "I don't have specific data for this HTS code and country combination. Please check with official sources or consult a trade expert."
                            }
                        }]
                    }
        
        return MockLLM()

    def analyze_tariffs(self, hts_code: str, country: str) -> Dict[str, Any]:
        """
        Comprehensive tariff analysis for a specific product and country
        """
        query = (
            f"Analyze tariffs for HTS code {hts_code} from {country}. "
            f"Consider all available sources and provide a comprehensive analysis "
            f"focusing on US business implications."
        )
        
        response = self.agent.query(query)
        
        # Combine data from all sources
        combined_data = {
            "ustr_data": self.tariff_data.fetch_ustr_data(hts_code, country),
            "usitc_data": self.tariff_data.fetch_usitc_data(hts_code, country),
            "wto_data": self.tariff_data.fetch_wto_data(hts_code, country),
            "analysis": response,
            "timestamp": datetime.now().isoformat(),
            "risk_assessment": self._assess_risks(hts_code, country)
        }
        
        return combined_data

    def _assess_risks(self, hts_code: str, country: str) -> Dict[str, Any]:
        """
        Assess potential risks based on tariff data
        """
        # Get the tariff data
        ustr_data = self.tariff_data.fetch_ustr_data(hts_code, country)
        usitc_data = self.tariff_data.fetch_usitc_data(hts_code, country)
        
        # Determine risk level based on tariff rate and special programs
        base_rate = ustr_data.get("base_rate", "N/A")
        special_programs = ustr_data.get("special_programs", [])
        
        if base_rate == "N/A":
            risk_level = "Unknown"
            risk_factors = ["Insufficient data to assess risks"]
            recommendations = ["Gather more information from official sources"]
        elif "25%" in base_rate or "30%" in base_rate:
            risk_level = "High"
            risk_factors = [
                "High tariff rate",
                "Potential for anti-dumping duties",
                "Subject to Section 301 tariffs"
            ]
            recommendations = [
                "Consider alternative sourcing countries",
                "Evaluate total landed cost including tariffs",
                "Monitor for changes in trade policy"
            ]
        elif "10%" in base_rate or "15%" in base_rate:
            risk_level = "Medium"
            risk_factors = [
                "Moderate tariff rate",
                "Potential for future increases"
            ]
            recommendations = [
                "Monitor for tariff changes",
                "Consider special trade programs",
                "Evaluate alternative sourcing options"
            ]
        else:
            risk_level = "Low"
            risk_factors = [
                "Low tariff rate",
                "May qualify for special programs"
            ]
            recommendations = [
                "Verify eligibility for special programs",
                "Document compliance requirements",
                "Monitor for changes in program eligibility"
            ]
        
        return {
            "risk_level": risk_level,
            "risk_factors": risk_factors,
            "recommendations": recommendations
        }

# Example usage
if __name__ == "__main__":
    # Check if OpenAI API key is set
    api_key = os.getenv("OPENAI_API_KEY")
    use_mock_llm = not api_key
    
    if use_mock_llm:
        print("No OpenAI API key found. Using mock LLM for testing.")
    
    agent = TariffMonitoringAgent(use_mock_data=True, use_mock_llm=use_mock_llm)
    
    # Test with China
    print("\n=== Testing with China ===")
    result_china = agent.analyze_tariffs("7208.39.00", "China")
    print(json.dumps(result_china, indent=2))
    
    # Test with Mexico
    print("\n=== Testing with Mexico ===")
    result_mexico = agent.analyze_tariffs("7208.39.00", "Mexico")
    print(json.dumps(result_mexico, indent=2))
