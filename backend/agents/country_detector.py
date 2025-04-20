import re
import logging
from typing import List, Dict, Optional

class CountryDetector:
    """
    Agent for detecting country of origin from invoice text.
    """
    
    def __init__(self):
        # Configure logging
        self.logger = logging.getLogger(__name__)
        
        # Common patterns for country of origin
        self.patterns = [
            r'country\s*of\s*origin\s*:?\s*([^\n]+)',
            r'origin\s*:?\s*([^\n]+)',
            r'made\s*in\s*:?\s*([^\n]+)',
            r'manufactured\s*in\s*:?\s*([^\n]+)',
            r'produced\s*in\s*:?\s*([^\n]+)',
            r'shipped\s*from\s*:?\s*([^\n]+)',
            r'exported\s*from\s*:?\s*([^\n]+)'
        ]
        
        # List of common countries with their variations
        self.countries = {
            "China": ["China", "PRC", "People's Republic of China", "Mainland China"],
            "Mexico": ["Mexico", "Mexican"],
            "Canada": ["Canada", "Canadian"],
            "Japan": ["Japan", "Japanese"],
            "Germany": ["Germany", "German", "Deutschland"],
            "United States": ["United States", "USA", "US", "America", "American"],
            "UK": ["United Kingdom", "UK", "Great Britain", "British", "England"],
            "France": ["France", "French"],
            "Italy": ["Italy", "Italian"],
            "Spain": ["Spain", "Spanish"],
            "Brazil": ["Brazil", "Brazilian"],
            "India": ["India", "Indian"],
            "South Korea": ["South Korea", "Korea", "Korean", "Republic of Korea"],
            "Taiwan": ["Taiwan", "Chinese Taipei", "Republic of China"],
            "Vietnam": ["Vietnam", "Vietnamese"],
            "Thailand": ["Thailand", "Thai"],
            "Malaysia": ["Malaysia", "Malaysian"],
            "Indonesia": ["Indonesia", "Indonesian"],
            "Philippines": ["Philippines", "Filipino"],
            "Singapore": ["Singapore", "Singaporean"],
            "Hong Kong": ["Hong Kong", "HK"]
        }
    
    def detect_country(self, text: str) -> Dict[str, str]:
        """
        Detect country of origin from invoice text.
        
        Args:
            text (str): Invoice text
            
        Returns:
            Dict[str, str]: Dictionary containing:
                - country: Detected country name
                - confidence: Confidence level (high/medium/low)
                - method: How the country was detected
        """
        # Split text into lines
        lines = text.split('\n')
        
        # Try pattern matching first
        country = self._extract_from_patterns(lines)
        if country:
            return {
                "country": country,
                "confidence": "high",
                "method": "pattern_matching"
            }
        
        # Try direct country name matching
        country = self._extract_from_country_names(lines)
        if country:
            return {
                "country": country,
                "confidence": "medium",
                "method": "country_name_matching"
            }
        
        # Try context analysis
        country = self._analyze_context(lines)
        if country:
            return {
                "country": country,
                "confidence": "low",
                "method": "context_analysis"
            }
        
        return {
            "country": "Unknown",
            "confidence": "low",
            "method": "not_found"
        }
    
    def _extract_from_patterns(self, lines: List[str]) -> Optional[str]:
        """
        Extract country using pattern matching.
        
        Args:
            lines (List[str]): List of invoice lines
            
        Returns:
            Optional[str]: Detected country or None
        """
        for line in lines:
            for pattern in self.patterns:
                match = re.search(pattern, line, re.IGNORECASE)
                if match:
                    country_text = match.group(1).strip()
                    # Try to match the extracted text with known countries
                    for country, variations in self.countries.items():
                        if any(var.lower() in country_text.lower() for var in variations):
                            return country
        return None
    
    def _extract_from_country_names(self, lines: List[str]) -> Optional[str]:
        """
        Extract country by matching country names.
        
        Args:
            lines (List[str]): List of invoice lines
            
        Returns:
            Optional[str]: Detected country or None
        """
        for line in lines:
            for country, variations in self.countries.items():
                if any(re.search(r'\b' + re.escape(var) + r'\b', line, re.IGNORECASE) 
                      for var in variations):
                    return country
        return None
    
    def _analyze_context(self, lines: List[str]) -> Optional[str]:
        """
        Analyze context to infer country of origin.
        
        Args:
            lines (List[str]): List of invoice lines
            
        Returns:
            Optional[str]: Inferred country or None
        """
        # Look for shipping addresses, customs declarations, or other context clues
        context_patterns = [
            (r'shipping\s*address\s*:?\s*([^\n]+)', 'shipping'),
            (r'customs\s*declaration\s*:?\s*([^\n]+)', 'customs'),
            (r'port\s*of\s*loading\s*:?\s*([^\n]+)', 'port'),
            (r'export\s*declaration\s*:?\s*([^\n]+)', 'export')
        ]
        
        for line in lines:
            for pattern, context_type in context_patterns:
                match = re.search(pattern, line, re.IGNORECASE)
                if match:
                    context_text = match.group(1).strip()
                    # Try to match the context text with known countries
                    for country, variations in self.countries.items():
                        if any(var.lower() in context_text.lower() for var in variations):
                            self.logger.info(f"Found country {country} from {context_type} context")
                            return country
        
        return None 