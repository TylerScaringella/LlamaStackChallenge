from llama_index.core.agent import ReActAgent
from llama_index.core.tools import FunctionTool
from llama_index.llms.llama_cpp import LlamaCPP
import requests
from bs4 import BeautifulSoup

# Tool to fetch updates from WTO or general search
def fetch_tariff_updates(product_keyword: str, country: str = "") -> str:
    query = f"tariff {product_keyword} {country} site:wto.org"
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(f"https://www.google.com/search?q={query}", headers=headers)

    if response.status_code != 200:
        return "Failed to retrieve search results."

    soup = BeautifulSoup(response.text, "html.parser")
    results = soup.find_all("h3")
    headlines = [r.get_text() for r in results[:5]]
    return "\n".join(headlines) if headlines else "No relevant headlines found."

# Tool wrapper
tariff_tool = FunctionTool.from_defaults(fn=fetch_tariff_updates)

# Local LLaMA LLM setup
llama_llm = LlamaCPP(
    model_path="path/to/your/llama/model.gguf",  # Replace with your .gguf model path
    temperature=0.2,
    max_new_tokens=512,
    context_window=2048,
    generate_kwargs={"top_k": 50, "top_p": 0.95}
)

# Tariff Monitoring Agent class
class TariffMonitoringAgent:
    def __init__(self):
        self.agent = ReActAgent.from_tools(
            tools=[tariff_tool],
            llm=llama_llm,
            verbose=True,
            system_prompt=(
                "You are a trade assistant. Use tools to search for the latest tariff changes "
                "relevant to specific products or countries. Summarize findings clearly."
            )
        )

    def monitor_tariffs(self, product_keyword: str, country: str = ""):
        query = (
            f"Search for any recent tariff updates for {product_keyword} "
            f"{'from ' + country if country else ''}. Summarize the changes and possible impact."
        )
        return self.agent.query(query)

# Example usage
if __name__ == "__main__":
    agent = TariffMonitoringAgent()
    response = agent.monitor_tariffs("lithium batteries", "Mexico")
    print(response)
