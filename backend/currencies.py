# Supported currencies with their symbols
CURRENCIES = {
    "USD": {"symbol": "$", "name": "US Dollar", "position": "before"},
    "EUR": {"symbol": "€", "name": "Euro", "position": "before"},
    "GBP": {"symbol": "£", "name": "British Pound", "position": "before"},
    "JPY": {"symbol": "¥", "name": "Japanese Yen", "position": "before"},
    "KRW": {"symbol": "₩", "name": "Korean Won", "position": "before"},
    "CNY": {"symbol": "¥", "name": "Chinese Yuan", "position": "before"},
    "INR": {"symbol": "₹", "name": "Indian Rupee", "position": "before"},
    "CAD": {"symbol": "$", "name": "Canadian Dollar", "position": "before"},
    "AUD": {"symbol": "$", "name": "Australian Dollar", "position": "before"},
    "NZD": {"symbol": "$", "name": "New Zealand Dollar", "position": "before"},
    "CHF": {"symbol": "Fr.", "name": "Swiss Franc", "position": "before"},
    "SEK": {"symbol": "kr", "name": "Swedish Krona", "position": "after"},
    "NOK": {"symbol": "kr", "name": "Norwegian Krone", "position": "after"},
    "DKK": {"symbol": "kr", "name": "Danish Krone", "position": "after"},
    "SGD": {"symbol": "$", "name": "Singapore Dollar", "position": "before"},
    "HKD": {"symbol": "$", "name": "Hong Kong Dollar", "position": "before"},
    "MXN": {"symbol": "$", "name": "Mexican Peso", "position": "before"},
    "BRL": {"symbol": "R$", "name": "Brazilian Real", "position": "before"},
    "RUB": {"symbol": "₽", "name": "Russian Ruble", "position": "before"},
    "ZAR": {"symbol": "R", "name": "South African Rand", "position": "before"},
    "TRY": {"symbol": "₺", "name": "Turkish Lira", "position": "before"},
    "AED": {"symbol": "د.إ", "name": "UAE Dirham", "position": "before"},
    "SAR": {"symbol": "﷼", "name": "Saudi Riyal", "position": "before"},
    "PLN": {"symbol": "zł", "name": "Polish Złoty", "position": "after"},
    "THB": {"symbol": "฿", "name": "Thai Baht", "position": "before"},
    "IDR": {"symbol": "Rp", "name": "Indonesian Rupiah", "position": "before"},
    "MYR": {"symbol": "RM", "name": "Malaysian Ringgit", "position": "before"},
    "PHP": {"symbol": "₱", "name": "Philippine Peso", "position": "before"},
    "VND": {"symbol": "₫", "name": "Vietnamese Dong", "position": "after"},
}

def get_currency_info(currency_code: str):
    """Get currency information by code"""
    return CURRENCIES.get(currency_code.upper(), CURRENCIES["USD"])

def get_all_currencies():
    """Get all supported currencies"""
    return [
        {
            "code": code,
            "symbol": info["symbol"],
            "name": info["name"],
            "position": info["position"]
        }
        for code, info in CURRENCIES.items()
    ]