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
    def __init__(self, use_mock_data=False, use_mock_llm=False):
        self.tariff_data = TariffData(use_mock_data=use_mock_data)
        
        # Use Llama LLM
        try:
            from llama_stack_client import LlamaStackClient
            from llama_stack_client.types import UserMessage, SystemMessage
            
            # Initialize LlamaStackClient with the correct host and port
            self.llm = LlamaStackClient(
                base_url="http://localhost:8321",
            )
            print("Using Llama LLM for tariff analysis")
        except Exception as e:
            print(f"Error initializing Llama: {str(e)}")
            raise e
        
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
                
            def query(self, query, hts_code=None, country=None):
                # Log the provided information for debugging
                print(f"Query: {query}")
                print(f"Provided HTS code: {hts_code}, Country: {country}")
                
                # If HTS code or country is not provided, try to extract from query
                if hts_code is None or country is None:
                    # Extract HTS code from query if not provided
                    if hts_code is None and "HTS code" in query:
                        import re
                        hts_pattern = r'HTS code\s+([0-9]{4}\.[0-9]{2}(?:\.[0-9]{2})?)'
                        hts_match = re.search(hts_pattern, query)
                        if hts_match:
                            hts_code = hts_match.group(1)
                        else:
                            # Fallback to simple splitting if regex fails
                            parts = query.split("HTS code")
                            if len(parts) > 1:
                                hts_part = parts[1].split()[0].strip()
                                # Clean up the HTS code (remove any non-numeric characters except dots)
                                hts_code = re.sub(r'[^0-9.]', '', hts_part)
                    
                    # Extract country from query if not provided
                    if country is None and "from" in query:
                        import re
                        # Updated pattern to handle multi-word country names
                        country_pattern = r'from\s+([A-Za-z\s]+?)(?:\.|\s|$)'
                        country_match = re.search(country_pattern, query)
                        if country_match:
                            country = country_match.group(1).strip()
                            # Handle common country name variations
                            country_mapping = {
                                "United": "United States",
                                "United States of America": "United States",
                                "USA": "United States",
                                "UK": "United Kingdom",
                                "Great Britain": "United Kingdom",
                                "PRC": "China",
                                "People's Republic of China": "China",
                                "Mainland China": "China",
                                "Republic of Korea": "South Korea",
                                "ROK": "South Korea",
                                "Korea": "South Korea"
                            }
                            # Check if we need to map the country name
                            if country in country_mapping:
                                country = country_mapping[country]
                        else:
                            # Fallback to simple splitting if regex fails
                            parts = query.split("from")
                            if len(parts) > 1:
                                country_part = parts[1].split()[0].strip()
                                country = country_part
                
                # Log the final values after extraction (if needed)
                print(f"Final HTS code: {hts_code}, Country: {country}")
                
                # If we still don't have a country, return a generic response
                if not country:
                    return "I couldn't determine the country from your query. Please provide the country of origin."
                
                # Use the Llama LLM to generate a response
                try:
                    # Import the necessary types
                    from llama_stack_client.types import UserMessage, SystemMessage
                    
                    # Call the Llama LLM using the correct method
                    response = self.llm.inference.chat_completion(
                        messages=[
                            SystemMessage(
                                content="You are an expert in international trade and tariffs. Provide detailed, accurate information about tariff rates, trade agreements, and business implications.",
                                role="system",
                            ),
                            UserMessage(
                                content=query,
                                role="user",
                            ),
                        ],
                        model_id="llama3.2:3b",
                        stream=False,
                    )
                    
                    # Extract the content from the response
                    if hasattr(response, 'completion_message') and hasattr(response.completion_message, 'content'):
                        response_text = response.completion_message.content
                    elif hasattr(response, 'choices') and len(response.choices) > 0:
                        if hasattr(response.choices[0], 'message'):
                            response_text = response.choices[0].message.content
                        elif hasattr(response.choices[0], 'text'):
                            response_text = response.choices[0].text
                    elif hasattr(response, 'content'):
                        response_text = response.content
                    elif isinstance(response, str):
                        response_text = response
                    elif isinstance(response, dict):
                        if 'completion_message' in response and 'content' in response['completion_message']:
                            response_text = response['completion_message']['content']
                        elif 'choices' in response and len(response['choices']) > 0:
                            if 'message' in response['choices'][0]:
                                response_text = response['choices'][0]['message']['content']
                            elif 'text' in response['choices'][0]:
                                response_text = response['choices'][0]['text']
                        elif 'content' in response:
                            response_text = response['content']
                        else:
                            print(f"Unexpected response format: {type(response)}")
                            response_text = str(response)
                    else:
                        print(f"Unexpected response format: {type(response)}")
                        response_text = str(response)
                    
                    # Clean up the response text
                    response_text = response_text.strip()
                    return response_text
                except Exception as e:
                    print(f"Error in Llama chat completion: {str(e)}")
                    # Return a fallback response with the information we have
                    if hts_code:
                        return f"Analysis for HTS code {hts_code} from {country} would go here. Unable to connect to LLM for detailed analysis."
                    else:
                        return f"Analysis for imports from {country} would go here. Unable to connect to LLM for detailed analysis."
        
        return SimpleAgent(self.tools, self.llm)
        
    def analyze_tariffs(self, hts_code: str, country: str) -> Dict[str, Any]:
        """
        Comprehensive tariff analysis for a specific product and country
        """
        print('Analyzing tariffs for', hts_code, 'from', country)

        # Scrape real tariff data from websites
        ustr_data = self._scrape_ustr_data(hts_code, country)
        usitc_data = self._scrape_usitc_data(hts_code, country)
        wto_data = self._scrape_wto_data(hts_code, country)
        
        # Create a comprehensive prompt for the Llama LLM
        prompt = self._create_llm_prompt(hts_code, country, ustr_data, usitc_data, wto_data)
        
        # Get response from the agent
        try:
            response = self.agent.query(prompt, hts_code, country)
            
            # Ensure the response is a string
            if not isinstance(response, str):
                response = str(response)
        except Exception as e:
            print(f"Error getting Llama response: {str(e)}")
            response = f"Unable to get analysis from LLM. Error: {str(e)}"
        
        # Combine data from all sources
        combined_data = {
            "ustr_data": ustr_data,
            "usitc_data": usitc_data,
            "wto_data": wto_data,
            "analysis": response,
            "timestamp": datetime.now().isoformat(),
            "risk_assessment": self._assess_risks(hts_code, country, ustr_data, usitc_data, wto_data)
        }
        
        # Print the final response for debugging
        # print("Final analysis:", response)
        
        return response
        # return combined_data
        
    def _scrape_ustr_data(self, hts_code: str, country: str) -> Dict[str, Any]:
        """Scrape tariff data from USTR website"""
        try:
            # Format the URL for the USTR website
            url = f"https://ustr.gov/tariff-schedule?hts={hts_code}&country={country}"
            print(f"Scraping USTR data from: {url}")
            
            # Make the request
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                # Parse the HTML
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Extract tariff information
                # Note: This is a simplified example. The actual selectors would depend on the website structure
                tariff_rate = "N/A"
                tariff_rate_elem = soup.select_one('.tariff-rate')
                if tariff_rate_elem:
                    tariff_rate = tariff_rate_elem.text.strip()
                
                special_programs = []
                special_programs_elems = soup.select('.special-program')
                for elem in special_programs_elems:
                    special_programs.append(elem.text.strip())
                
                # Return the extracted data
                return {
                    "source": "USTR",
                    "hts_code": hts_code,
                    "country": country,
                    "base_rate": tariff_rate,
                    "effective_date": datetime.now().isoformat(),
                    "special_programs": special_programs,
                    "notes": "Data scraped from USTR website"
                }
            else:
                print(f"Error scraping USTR data: Status code {response.status_code}")
                return self.tariff_data.fetch_ustr_data(hts_code, country)
        except Exception as e:
            print(f"Exception scraping USTR data: {str(e)}")
            return self.tariff_data.fetch_ustr_data(hts_code, country)
            
    def _scrape_usitc_data(self, hts_code: str, country: str) -> Dict[str, Any]:
        """Scrape tariff data from USITC website"""
        try:
            # Format the URL for the USITC website
            url = f"https://dataweb.usitc.gov/tariff?hts={hts_code}&country={country}"
            print(f"Scraping USITC data from: {url}")
            
            # Make the request
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                # Parse the HTML
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Extract tariff information
                # Note: This is a simplified example. The actual selectors would depend on the website structure
                current_rate = "N/A"
                current_rate_elem = soup.select_one('.current-rate')
                if current_rate_elem:
                    current_rate = current_rate_elem.text.strip()
                
                historical_rates = []
                historical_rates_elems = soup.select('.historical-rate')
                for elem in historical_rates_elems:
                    date_elem = elem.select_one('.date')
                    rate_elem = elem.select_one('.rate')
                    if date_elem and rate_elem:
                        historical_rates.append({
                            "date": date_elem.text.strip(),
                            "rate": rate_elem.text.strip()
                        })
                
                # Return the extracted data
                return {
                    "source": "USITC",
                    "hts_code": hts_code,
                    "country": country,
                    "current_rate": current_rate,
                    "historical_rates": historical_rates,
                    "trade_volume": "N/A",
                    "import_restrictions": []
                }
            else:
                print(f"Error scraping USITC data: Status code {response.status_code}")
                return self.tariff_data.fetch_usitc_data(hts_code, country)
        except Exception as e:
            print(f"Exception scraping USITC data: {str(e)}")
            return self.tariff_data.fetch_usitc_data(hts_code, country)
            
    def _scrape_wto_data(self, hts_code: str, country: str) -> Dict[str, Any]:
        """Scrape tariff data from WTO website"""
        try:
            # Format the URL for the WTO website
            url = f"https://tariffdata.wto.org/ReportersAndProducts.aspx?hs=85&r=842&p=156"
            print(f"Scraping WTO data from: {url}")
            
            # Make the request
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                # Parse the HTML
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Extract tariff information
                # Note: This is a simplified example. The actual selectors would depend on the website structure
                bound_rate = "N/A"
                bound_rate_elem = soup.select_one('.bound-rate')
                if bound_rate_elem:
                    bound_rate = bound_rate_elem.text.strip()
                
                applied_rate = "N/A"
                applied_rate_elem = soup.select_one('.applied-rate')
                if applied_rate_elem:
                    applied_rate = applied_rate_elem.text.strip()
                
                # Return the extracted data
                return {
                    "source": "WTO",
                    "hts_code": hts_code,
                    "country": country,
                    "bound_rate": bound_rate,
                    "applied_rate": applied_rate,
                    "tariff_quotas": None,
                    "special_safeguards": []
                }
            else:
                print(f"Error scraping WTO data: Status code {response.status_code}")
                return self.tariff_data.fetch_wto_data(hts_code, country)
        except Exception as e:
            print(f"Exception scraping WTO data: {str(e)}")
            return self.tariff_data.fetch_wto_data(hts_code, country)
            
    def _create_llm_prompt(self, hts_code: str, country: str, ustr_data: Dict[str, Any], 
                          usitc_data: Dict[str, Any], wto_data: Dict[str, Any]) -> str:
        """Create a comprehensive prompt for the Llama LLM based on the scraped data"""
        
        # Extract key information from the scraped data
        ustr_rate = ustr_data.get("base_rate", "N/A")
        usitc_rate = usitc_data.get("current_rate", "N/A")
        wto_bound = wto_data.get("bound_rate", "N/A")
        wto_applied = wto_data.get("applied_rate", "N/A")
        
        # Create a detailed prompt
        prompt = f"""
        Analyze the following tariff information for HTS code {hts_code} from {country}:
        
        USTR Base Rate: {ustr_rate}
        USITC Current Rate: {usitc_rate}
        WTO Bound Rate: {wto_bound}
        WTO Applied Rate: {wto_applied}
        
        Special Programs: {', '.join(ustr_data.get('special_programs', ['None']))}
        
        Please provide a comprehensive analysis that includes:
        
        1. The current tariff rate and how it affects the cost of importing this product
        2. Any special programs or exemptions that might apply
        3. Historical trends in tariff rates for this product
        4. Alternative countries with lower tariff rates for the same product
        5. Recommendations for US businesses importing this product
        
        Focus on practical business implications and cost-saving opportunities.
        """
        
        return prompt
        
    def _assess_risks(self, hts_code: str, country: str, ustr_data: Dict[str, Any], 
                     usitc_data: Dict[str, Any], wto_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Assess potential risks based on tariff data
        """
        # Extract key information
        ustr_rate = ustr_data.get("base_rate", "N/A")
        usitc_rate = usitc_data.get("current_rate", "N/A")
        special_programs = ustr_data.get("special_programs", [])
        
        # Determine risk level based on tariff rate and special programs
        risk_level = "Unknown"
        risk_factors = []
        recommendations = []
        
        # Convert rate strings to numbers for comparison
        try:
            ustr_rate_num = float(ustr_rate.rstrip('%')) if ustr_rate != "N/A" else 0
            usitc_rate_num = float(usitc_rate.rstrip('%')) if usitc_rate != "N/A" else 0
            
            # Use the higher of the two rates
            effective_rate = max(ustr_rate_num, usitc_rate_num)
            
            if effective_rate > 20:
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
            elif effective_rate > 10:
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
        except (ValueError, TypeError):
            risk_factors = ["Insufficient data to assess risks"]
            recommendations = ["Gather more information from official sources"]
        
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
