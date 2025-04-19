# llama_stack_agents.py

from llama_index.core.tools import FunctionTool
from llama_index.core.agent import FunctionCallingAgent, AgentRunner
from llama_index.llms.openai import OpenAI
from llama_index.core.llama_pack.base import BaseLlamaPack
from typing import List, Dict, Any

### AGENT: Vendor Data Enrichment Agent ###
def enrich_vendor_data(vendor_name: str) -> Dict[str, Any]:
    """
    Given a vendor name, enrich data with country of origin, industry, and related info.
    """
    # Simulate a data enrichment process
    return {
        "vendor_name": vendor_name,
        "country": "China",  # In reality, call an enrichment API or database
        "industry": "Steel manufacturing"
    }

enrich_vendor_tool = FunctionTool.from_defaults(fn=enrich_vendor_data)


### AGENT: HTS Code Classifier Agent ###
def classify_hts_code(description: str, country: str) -> Dict[str, Any]:
    """
    Given a product description and country, classify the HTS code.
    """
    # Simulate a classification lookup or ML prediction
    return {
        "description": description,
        "country": country,
        "hts_code": "7208.39.00"
    }

classify_hts_tool = FunctionTool.from_defaults(fn=classify_hts_code)


### AGENT: Tariff Lookup Agent ###
def lookup_tariff(hts_code: str, country: str) -> Dict[str, Any]:
    """
    Look up current tariffs for a given HTS code and country of origin.
    """
    # Simulate tariff data retrieval (web scraping, API, or database query)
    return {
        "hts_code": hts_code,
        "country": country,
        "tariff_rate": "25%",
        "source": "https://ustr.gov/tariff-schedule"
    }

lookup_tariff_tool = FunctionTool.from_defaults(fn=lookup_tariff)


### WRAP INTO TARIFF DISCOVERY AGENT ###
llm = OpenAI(model="gpt-4")

tariff_discovery_agent = FunctionCallingAgent.from_tools(
    tools=[enrich_vendor_tool, classify_hts_tool, lookup_tariff_tool],
    llm=llm,
    system_prompt="""
    You are an intelligent agent that receives a vendor name as input.
    Your goal is to enrich vendor data, classify the HTS code based on product description,
    and then look up the applicable tariff. Return only final relevant information.
    """
)

tariff_runner = AgentRunner(agent=tariff_discovery_agent)


### PACK WRAPPER FOR LLAMA STACK DEPLOYMENT ###
class TariffDiscoveryPack(BaseLlamaPack):
    def run(self, vendor_name: str, product_description: str) -> Dict[str, Any]:
        enriched = enrich_vendor_data(vendor_name)
        hts_data = classify_hts_code(product_description, enriched["country"])
        tariff_data = lookup_tariff(hts_data["hts_code"], enriched["country"])
        return {
            "vendor_info": enriched,
            "hts_data": hts_data,
            "tariff_info": tariff_data
        }

    def get_modules(self) -> Dict[str, Any]:
        return {
            "tariff_discovery_agent": tariff_runner,
        }


### USAGE (for testing or backend call) ###
if __name__ == "__main__":
    pack = TariffDiscoveryPack()
    result = pack.run(vendor_name="Hebei Iron Group", product_description="flat-rolled steel sheets")
    print(result)
