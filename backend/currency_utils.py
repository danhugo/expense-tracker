import httpx
from typing import Dict, Optional, Tuple
try:
    from ipware import get_client_ip
except ImportError:
    # Fallback if ipware is not installed
    def get_client_ip(request):
        x_forwarded_for = request.headers.get('x-forwarded-for')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
            return ip, True
        return request.client.host, True
from datetime import datetime, timedelta
import json
from fastapi import Request

# Currency mapping by country code
COUNTRY_TO_CURRENCY = {
    "US": "USD", "CA": "CAD", "GB": "GBP", "EU": "EUR", 
    "JP": "JPY", "CN": "CNY", "IN": "INR", "AU": "AUD",
    "NZ": "NZD", "CH": "CHF", "SE": "SEK", "NO": "NOK",
    "DK": "DKK", "SG": "SGD", "HK": "HKD", "MX": "MXN",
    "BR": "BRL", "RU": "RUB", "ZA": "ZAR", "TR": "TRY",
    "AE": "AED", "SA": "SAR", "PL": "PLN", "TH": "THB",
    "ID": "IDR", "MY": "MYR", "PH": "PHP", "VN": "VND",
    "KR": "KRW", "DE": "EUR", "FR": "EUR", "IT": "EUR",
    "ES": "EUR", "NL": "EUR", "BE": "EUR", "AT": "EUR",
    "PT": "EUR", "IE": "EUR", "FI": "EUR", "GR": "EUR"
}

# Cache for exchange rates (valid for 1 hour)
_exchange_rate_cache = {
    "rates": {},
    "last_updated": None
}

async def get_currency_from_ip(request: Request) -> str:
    """
    Detect user's currency based on their IP address.
    Returns currency code (e.g., 'USD', 'EUR')
    """
    try:
        # Get client IP
        client_ip, is_routable = get_client_ip(request)
        
        if not client_ip or not is_routable:
            return "USD"  # Default to USD if IP cannot be determined
        
        # Use a free IP geolocation service
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"http://ip-api.com/json/{client_ip}",
                timeout=5.0
            )
            
            if response.status_code == 200:
                data = response.json()
                country_code = data.get("countryCode", "US")
                return COUNTRY_TO_CURRENCY.get(country_code, "USD")
    
    except Exception as e:
        print(f"Error detecting currency from IP: {e}")
    
    return "USD"  # Default to USD on any error

async def get_exchange_rates() -> Dict[str, float]:
    """
    Get current exchange rates. Uses caching to avoid excessive API calls.
    Returns rates with USD as base currency.
    """
    now = datetime.now()
    
    # Check if cache is valid (less than 1 hour old)
    if (_exchange_rate_cache["last_updated"] and 
        now - _exchange_rate_cache["last_updated"] < timedelta(hours=1) and
        _exchange_rate_cache["rates"]):
        return _exchange_rate_cache["rates"]
    
    try:
        # Using exchangerate-api.com (free tier available)
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://api.exchangerate-api.com/v4/latest/USD",
                timeout=10.0
            )
            
            if response.status_code == 200:
                data = response.json()
                rates = data.get("rates", {})
                
                # Update cache
                _exchange_rate_cache["rates"] = rates
                _exchange_rate_cache["last_updated"] = now
                
                return rates
    
    except Exception as e:
        print(f"Error fetching exchange rates: {e}")
    
    # Return cached rates if available, otherwise return empty dict
    return _exchange_rate_cache["rates"] or {}

def convert_currency(amount: float, from_currency: str, to_currency: str, rates: Dict[str, float]) -> float:
    """
    Convert amount from one currency to another using provided exchange rates.
    Rates should have USD as base currency.
    """
    if from_currency == to_currency:
        return amount
    
    if not rates:
        return amount  # Return original amount if no rates available
    
    # Convert to USD first (base currency)
    if from_currency != "USD":
        from_rate = rates.get(from_currency, 1.0)
        if from_rate == 0:
            return amount
        amount_in_usd = amount / from_rate
    else:
        amount_in_usd = amount
    
    # Convert from USD to target currency
    if to_currency != "USD":
        to_rate = rates.get(to_currency, 1.0)
        return amount_in_usd * to_rate
    else:
        return amount_in_usd

def get_currency_symbol(currency_code: str) -> str:
    """Get currency symbol from currency code"""
    from currencies import CURRENCIES
    currency_info = CURRENCIES.get(currency_code, {})
    return currency_info.get("symbol", "$")

async def get_historical_exchange_rate(from_currency: str, to_currency: str, date: datetime) -> float:
    """
    Get historical exchange rate for a specific date.
    Returns the exchange rate from from_currency to to_currency.
    """
    # For now, we'll use current rates as a fallback
    # In production, you'd want to use a historical rates API like:
    # - exchangerate-api.com historical endpoint (paid)
    # - frankfurter.app (free)
    # - currencylayer.com (free tier)
    
    try:
        # Format date as YYYY-MM-DD
        date_str = date.strftime("%Y-%m-%d")
        
        # Using frankfurter.app (free historical rates API)
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.frankfurter.app/{date_str}",
                params={"from": from_currency, "to": to_currency},
                timeout=10.0
            )
            
            if response.status_code == 200:
                data = response.json()
                rates = data.get("rates", {})
                return rates.get(to_currency, 1.0)
    
    except Exception as e:
        print(f"Error fetching historical rate for {date_str}: {e}")
    
    # Fallback to current rates
    rates = await get_exchange_rates()
    return convert_currency(1.0, from_currency, to_currency, rates)

def calculate_exchange_rate_to_usd(amount: float, currency: str, exchange_rate: float = None) -> float:
    """
    Calculate the exchange rate to USD for storing with transaction.
    If exchange_rate is provided, use it. Otherwise return None to fetch later.
    """
    if currency == "USD":
        return 1.0
    
    if exchange_rate:
        # If we have the rate from currency to USD, return it
        return exchange_rate
    
    # Return None to indicate we need to fetch it
    return None