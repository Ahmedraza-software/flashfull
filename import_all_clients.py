#!/usr/bin/env python3
"""
Script to import all 107 clients from FLASH SECURITY SERVICES.
"""

import json
import requests

def create_all_clients_json():
    """Create the complete clients JSON file with all 107 clients."""
    clients = [
        {"#": "1", "Client Name": "Askari Bank Limited, Sector I-8 Markaz Branch, Islamabad."},
        {"#": "2", "Client Name": "Askari Bank Limited, (IBB) Khanna Pul Branch, Islamabad."},
        {"#": "3", "Client Name": "Askari Bank Limited, Desto Chattar, Islamabad."},
        {"#": "4", "Client Name": "Askari Bank Limited, PECHS, Sector E-11/2 Islamabad."},
        {"#": "5", "Client Name": "Askari Bank Limited, Sector B-17 Islamabad."},
        {"#": "6", "Client Name": "Askari Bank Limited CBD, Head Office, Sector G-8 Markaz, Islamabad."},
        {"#": "7", "Client Name": "Askari Bank Limited Contact Center, 3rd Floor, Askari Plaza, Sector G-8 Markaz, Islamabad."},
        {"#": "8", "Client Name": "Askari Bank Limited Central Processing Unit (Warehouse), Humak, Mozah Nizian, Islamabad."},
        {"#": "9", "Client Name": "Sinopec International Petroleum Service Corporation (Pakistan Branch) House No. 11, Street No. 49, Sector F-6/4, Islamabad."},
        {"#": "10", "Client Name": "P.E.L Plot No. 19, Mauve Area, Sector G-8/1, Islamabad."},
        {"#": "11", "Client Name": "P.E.L (Baddar Gas Field, Ghotiki, Sindh) Plot No. 19, Mauve Area, Sector G-8/1, Islamabad."},
        {"#": "12", "Client Name": "P.E.L (Baddar Gas Field-II, Ghotiki, Sindh) Plot No. 19, Mauve Area, Sector G-8/1, Islamabad."},
        {"#": "13", "Client Name": "P.E.L (Block No. 22, Shikar Pur, Sindh) Plot No. 19, Mauve Area, Sector G-8/1, Islamabad."},
        {"#": "14", "Client Name": "P.E.L (Hassan-IV) Plot No. 19, Mauve Area, Sector G-8/1, Islamabad."},
        {"#": "15", "Client Name": "P.E.L (AyesM-8/"},
       .
        {".
        .
