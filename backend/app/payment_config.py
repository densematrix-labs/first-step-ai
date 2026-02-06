"""
Payment Config — Merge these fields into your project's Settings class.
"""

# === Add to your Settings(BaseSettings) class ===

# Creem Payment
CREEM_API_KEY: str = ""
CREEM_WEBHOOK_SECRET: str = ""
CREEM_PRODUCT_IDS: dict = {}  # {"sku_name": "creem_product_id"}

# Product pricing (customize per project)
PRODUCTS: dict = {
    "pack_3": {"price": 799, "generations": 3},      # $7.99
    "pack_10": {"price": 1999, "generations": 10},    # $19.99
}

# === Add this validator ===

# from pydantic import field_validator
# import json
#
# @field_validator("CREEM_PRODUCT_IDS", mode="before")
# @classmethod
# def parse_creem_product_ids(cls, v):
#     if isinstance(v, str) and v:
#         return json.loads(v)
#     return v

# === Add to .env ===
#
# CREEM_API_KEY=creem_test_xxx
# CREEM_WEBHOOK_SECRET=whsec_xxx
# CREEM_PRODUCT_IDS={"pack_3": "prod_xxx", "pack_10": "prod_yyy"}
