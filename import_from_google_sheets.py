#!/usr/bin/env python3
"""
Script to import clients from Google Sheets.
Requires: pip install gspread google-auth-oauthlib
"""

import requests
import json

def import_clients_from_google_sheet(api_base_url="http://localhost:8000"):
    """
    Import clients from Google Sheet.
    Note: This script requires manual setup of Google Sheets API credentials.
    For now, we'll use the hardcoded client list.
    """
    
    # Client list from the Google Sheet
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
        {"#": "15", "Client Name": "P.E.L (Ayesha-1, Badin South) Plot No. 19, Mauve Area, Sector G-8/1, Islamabad."},
        {"#": "16", "Client Name": "P.E.L (Aminah Well-I Badin South) Plot No. 19, Mauve Area, Sector G-8/1, Islamabad."},
        {"#": "17", "Client Name": "P.E.L (Ayesha-II, Badin North) Plot No. 19, Mauve Area, Sector G-8/1, Islamabad."},
        {"#": "18", "Client Name": "P.E.L (Zainab Well, Badin North) Plot No. 19, Mauve Area, Sector G-8/1, Islamabad."},
        {"#": "19", "Client Name": "P.E.L (Mess) Plot No. 19, Mauve Area, Sector G-8/1, Islamabad."},
        {"#": "20", "Client Name": "P.E.L (Zohra North-I, Badin South) Plot No. 19, Mauve Area, Sector G-8/1, Islamabad."},
        {"#": "21", "Client Name": "SPS (CNG Facility) Plot No. 19, Mauve Area, Sector G-8/1, Islamabad."},
        {"#": "22", "Client Name": "SPS (Zainab Gas Field, Badin North) Plot No. 19, Mauve Area, Sector G-8/1, Islamabad."},
        {"#": "23", "Client Name": "SPS Choa Khalsa Plot No. 19, Mauve Area, Sector G-8/1, Islamabad."},
        {"#": "24", "Client Name": "Concern Worldwide (Branch Office) House No. 08, Street No. 30, Sector F-7/1, Islamabad."},
        {"#": "25", "Client Name": "Cimmyt Pakistan (The International Maize and Wheat Improvement Center) CSI Complex, NARC, Park Road, Islamabad."},
        {"#": "26", "Client Name": "Embassy of the State of Kuwait House No. 28, Margalla Road, Sector F-7/3, Islamabad."},
        {"#": "27", "Client Name": "Embassy of the State of Kuwait House No. 28, Margalla Road, Sector F-7/3, Islamabad."},
        {"#": "28", "Client Name": "Pir & Co Office No. 608, 6th Floor, Islamabad Stock Exchange Tower, Islamabad."},
        {"#": "29", "Client Name": "Islamabad Chamber of Commerce & Industry Aiwan-e-Sanat-o-Tijarat Road, Mauve Area, Sector G-8/1, Islamabad."},
        {"#": "30", "Client Name": "Mr. Kazeem Tariq Khan House No. 29, Street No. 39, Sector F-6/1, Islamabad."},
        {"#": "31", "Client Name": "International Interiors (Pvt.) Ltd Rafique Centre, Plot 8-A, I & T Centre, Sector G-6, Islamabad."},
        {"#": "32", "Client Name": "MASTER OFFISYS Rafique Centre, Plot 8-A, I & T Centre, Sector G-6, Islamabad."},
        {"#": "33", "Client Name": "Shaanxi (CEGCL) House No. 17, Street No. 61, Sector F-8/4, Islamabad."},
        {"#": "34", "Client Name": "Stella Technology (SMC-Pvt) Ltd Plot No. 168, Street No. 9, Sector I-10/3 Islamabad."},
        {"#": "35", "Client Name": "Vector Services First floor, Rais & Shoaib Centre Main Expressway, Service Road East, Bridge, Near Khanna, Ghauri Town VIP Block Islamabad."},
        {"#": "36", "Client Name": "SACHET Pakistan, Office No 34, First Floor, Al-Babar Center, Park Road, Sector F-" 
         "8 Markaz, Islamabad."},
        {"#": "37", "Client Name": "Sarhad University Islamabad Campus T-Chowk, G.T Road, Islamabad."},
        {"#": "38", "Client Name": "ICE Pakistan (International Center of Excellence) Islamabad Plot No. 63, Main Service Road North, Sector I-10/3, Islamabad."},
        {"#": "39", "Client Name": "Teach for Pakistan, Building No.05, Off Street No. 19, Sector G-8/1, Islamabad."},
        {"#": "40", "Client Name": "Save the Children Pakistan Country Office, 1st Floor, North Wing, NTC Headquarters, Sector G-5/2, Islamabad."},
        {"#": "41", "Client Name": "Zhongxing Telecom Pakistan Pvt Ltd (ZTE Chakri Office)"},
        {"#": "42", "Client Name": "Rose Ace, House No. 119, Street No. 64, F-10/3, Islamabad.14-Y, Shenaz Plaza, Johar Road,F-8 Markaz, Islamabad."},
        {"#": "43", "Client Name": "Mr. Qiaoyuan, House No. 04, Street No. 42, Sector F-7/1, Islamabad."},
        {"#": "44", "Client Name": "Mr. Shah Hassan, H.No. 176, St. 13, F-11/1, Islamabad."},
        {"#": "45", "Client Name": "Mr. Abdul Ghani Burq, House No. 26, Khayban e Iqbal, F-8/3, Islamabad."},
        {"#": "46", "Client Name": "Dr. Shahid Rashid Butt SRB Plaza Super Market, F-6/1, Islamabad."},
        {"#": "47", "Client Name": "Dr. Shahid Rashid Butt House No. 35-A, Street No. 18, Sector F-6, Islamabad."},
        {"#": "48", "Client Name": "Mr. Bilal Hussain House No. 08, Street No 59, Sector F-7/4, Islamabad."},
        {"#": "49", "Client Name": "Mr. Abdul Wajid Rana House No. 57, Street No. 16, Sector F-11/2, Islamabad."},
        {"#": "50", "Client Name": "Mujahid Filling Station (PSO) Plot 26, Sector G-9 Markaz, Islamabad."},
        {"#": "51", "Client Name": "Mr. Babar Malik House No. 2-A, Street No. 52, Sector F-8/4, Islamabad."},
        {"#": "52", "Client Name": "Shahwaiz Center (F-8 Markaz) House No. 24, Street No. 01, Sector F-6/3, Islamabad."},
        {"#": "53", "Client Name": "Dr. Israr Hussain Choa Khalsa, Kahutta, Distt Rawalpindi."},
        {"#": "54", "Client Name": "Mr. Musa Nadeem Melhi & Co House No. 08, Street No. 45 Sector F-7/1, Islamabad."},
        {"#": "55", "Client Name": "Mr. Atif Sheikh House No. 15, Street No. 37, Sector F-8/1, Islamabad."},
        {"#": "56", "Client Name": "Mrs. Chaand Shahid House No. 24, Street No. 35, Sector F-6/1, Islamabad."},
        {"#": "57", "Client Name": "Miss Sofia House No. 36-A, Street No. 32, Sector F-7/1, Islamabad."},
        {"#": "58", "Client Name": "Mr. Zahoor Ahmed Flat No. 06, Blcok No. 09, Sector F-6/4, Islamabad."},
        {"#": "59", "Client Name": "Mr. Naveed Ul Haq House No. 08/1, Street No. 07, Sector F-7/3, Islamabad."},
        {"#": "60", "Client Name": "UKRSPECEXPORT (USE) House No. 01, Street No. 11, Sector F-7/2, Islamabad."},
        {"#": "61", "Client Name": "Mr.Yasir Ali Ghauri House No. 404, Main Nazimuddin Road, Sector F-11/1, Islamabad."},
        {"#": "62", "Client Name": "Mrs. Muniba Kamran House No. 77, Street No. 26, Sector F-11/2, Islamabad."},
        {"#": "63", "Client Name": "Mr. WuZeng House No. 19, Street No. 37, Sector F-8/1, Islamabad."},
        {"#": "64", "Client Name": "Mrs. Ann House No. 04, Street No. 32, Sector F-6/1, Islamabad."},
        {"#": "65", "Client Name": "Askari Bank Limited, Chak Bali Khan Branch, Distt Rawalpindi."},
        {"#": "66", "Client Name": "Askari Bank Limited, Jhang Road Branch, Bhakkar."},
        {"#": "67", "Client Name": "Askari Bank Limited, Ghalla Mandi Branch, Haroon Abad, District Bhawalnagar."},
        {"#": "68", "Client Name": "Askari Bank Limited, Kamar Mashani Branch, Tehsil Isakhel, District Mianwali."},
        {"#": "69", "Client Name": "Askari Bank Limited, Gulraiz Road Branch, Rawalpindi."},
        {"#": "70", "Client Name": "Askari Bank Limited, POL Khour Branch,Tehsil Pindi Gheb, District Attock."},
        {"#": "71", "Client Name": "Askari Bank Limited, Pinanwal Branch, Tehsil PD Khan, District Jhelum"},
        {"#": "72", "Client Name": "Askari Bank Limited, Ghala Mandi Branch, Bahawalpur."},
        {"#": "73", "Client Name": "Askari Bank Limited Head Office AWT Plaza Branch, The Mall, Saddar, Rawalpindi."},
        {"#": "74", "Client Name": "Askari Bank Limited Chaklala Scheme-III Branch, 18 Comercial Area, Imran khan Avenue, Chaklala Scheme-III, Rawalpindi."},
        {"#": "75", "Client Name": "Askari Bank Limited Chaklala Garrison Branch, Rising Sun Complex, 10 Corps, Chaklala Garisson, Rawalpindi."},
        {"#": "76", "Client Name": "Askari Bank Limited Choa Khalsa Branch, Adjacent MCB Bank Limited, Main Bazar, Shahrah-e-Kashmir, Tehsil Kallar Syedan, Distt Rawalpindi."},
        {"#": "77", "Client Name": "Askari Bank Limited (IBB) Burewala Branch, Khasra No. 1, Khatooni No. 193, Khewat No. 185/181, Ground & 1st floor, Mouza 439/EB, D-Block, Burewala, District Vehari."},
        {"#": "78", "Client Name": "Askari Bank Limited DHA-9 Town Branch, Plaza No. 2-CC, DHA, Phase No. 09, Lahore (ABEP-24)."},
        {"#": "79", "Client Name": "Askari Bank Limited (IBB) Bahria Orchard Branch, Plaza No. 05, Gate No. 02, Near Jahaz Chowk, Raiwind Road, Lahore (ABEP-24)."},
        {"#": "80", "Client Name": "Askari Bank Limited (IBB) G.T Road Gujrat Branch (0861), Khewat No. 46, Khatooni No. 55, Khasra No. 577, Opposite Eid-Gah, Mouza Jatrokul, G.T Road Gujrat."},
        {"#": "81", "Client Name": "Askari Bank Limited (IBB) Raiwand Branch (0867), Khewat No. 1762, Khatooni No. 2162, Salam Khata, Qitat No. 143, Hadbast, Raiwind, Tehsil Raiwind, District Lahore."},
        {"#": "82", "Client Name": "Askari Bank Limited Askari 14 Branch (0078-B), Morgah, Rawalpindi."},
        {"#": "83", "Client Name": "Askari Bank Limited (IBB) Satellite Town Branch (0871), Bahawalpur."},
        {"#": "84", "Client Name": "Askari Bank Limited (IBB) Mandi Yazman (0870) Branch, Bahawalpur."},
        {"#": "85", "Client Name": "Askari Bank Limited (IBB) Ghazi Road (0892) Branch, Property No. E-400/3, Khewat No. 17, Khatooni No. 69, Ghazi Road, Lahore."},
        {"#": "86", "Client Name": "Askari Bank Limited Technology Park Booth, Tehsil Rawat, Distt Rawalpindi."},
        {"#": "87", "Client Name": "Citi Distributors, Ground Floor, Uzair Plaza, Rawalpindi."},
        {"#": "88", "Client Name": "Church of Jesus (CJLDS) Pakistan Faisalabad House No. 12-A, Street No. 29, Sector F-7/1, Islamabad."},
        {"#": "89", "Client Name": "Church of Jesus (CJLDS) Pakistan Sialkot House No. 12-A, Street No. 29, Sector F-7/1, Islamabad."},
        {"#": "90", "Client Name": "Sinopec (IPC)(Pakistan Branch)''Yard/Rig'', FTS Balkassar Yard, Distt Chakwal."},
        {"#": "91", "Client Name": "Save the Children Pakistan (Multan Office), 1st Floor, North Wing, NTC Headquarters, Sector G-5/2, Islamabad."},
        {"#": "92", "Client Name": "Shaheen Chemist & Grocers Shop No. 1,2,3 & 4, ALLAH Hoo Chowk, Bahria Town, Phase IV, Islamabad."},
        {"#": "93", "Client Name": "Mr. Zafar Anwar Sweet Palace Commercial Market, Sattelite Town, Rawalpindi."},
        {"#": "94", "Client Name": "Quaid Model School, Near Nirala Chowk, Mughalabad, Rawalpindi Cantt."},
        {"#": "95", "Client Name": "Mr. Khan Wazir Al-Amin Plaza, Mall Road, Saddar, Rawalpindi."},
        {"#": "96", "Client Name": "Haq Bahoo Food House No. 467, Street No. 9, Mohalla Afshan Colony, Near Dhok Chaudriyan, Rawalpindi Cantt."},
        {"#": "97", "Client Name": "Mr. Mohammad Naveed Shop No. 5, Al-Shehbaz Plaza, Saddar, Rawalpindi."},
        {"#": "98", "Client Name": "Saladin Supermarket Chandani Chowk, Rawalpindi."},
        {"#": "99", "Client Name": "Major (Retd.) Muhammad Aamir House No. 77, Street No. 06, Bahria Town Phase 08, Islamabad."},
        {"#": "100", "Client Name": "Honda Centre Pvt. Ltd, 300, Peshawar Road, Opp. Race Course, Rawalpindi."},
        {"#": "101", "Client Name": "Askari Bank Limited, Shabqadar Branch, Main Charsadda Road, Shabqadar, Peshawar."},
        {"#": "102", "Client Name": "Askari Bank Limited, Ghari Habib Ullah Branch, Tehsil Balakot, District Mansehra."},
        {"#": "103", "Client Name": "Askari Bank Limited, Kotli Kalan, Pabbi, Distt Nowshera."},
        {"#": "104", "Client Name": "Mr. Zahoor Ahmed Pine City, Main KaraKoram Highway, Haripur."},
        {"#": "105", "Client Name": "Askari Bank Limited PAF Base Bholari Branch, Near Thano Boola Khan, M-9 Motorway, Tehsil Kotri, District Jamshoro."},
        {"#": "106", "Client Name": "Askari Bank Limited (IBB) Sindh Muslim Society Branch, Plot No. 102, Shop No. 06, Mona Arcade, Block No. A, Sindh Muslim Cooperative Society, Karachi."},
        {"#": "107", "Client Name": "Askari Bank Limited, Rawalpindi Road, Kotli, Azad Kashmir."}
    ]
    
    print(f"Importing {len(clients)} clients from Google Sheet data...")
    
    try:
        response = requests.post(
            f"{api_base_url}/api/client-management/import-bulk",
            json=clients,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"\nImport completed successfully!")
            print(f"  Total clients: {len(clients)}")
            print(f"  Imported: {result.get('imported', 0)}")
            print(f"  Skipped: {result.get('skipped', 0)}")
            if result.get('errors'):
                print(f"  Errors: {len(result['errors'])}")
                for error in result['errors']:
                    print(f"    - {error}")
        else:
            print(f"Error: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"Error connecting to API: {e}")

def setup_google_sheets_integration():
    """
    Instructions for setting up Google Sheets API integration:
    
    1. Go to Google Cloud Console (https://console.cloud.google.com/)
    2. Create a new project or select existing one
    3. Enable Google Sheets API
    4. Create credentials -> Service Account
    5. Download the JSON key file
    6. Share your Google Sheet with the service account email
    7. Install required packages: pip install gspread google-auth-oauthlib
    
    Example code for direct Google Sheets integration:
    
    import gspread
    from google.oauth2.service_account import Credentials
    
    def get_clients_from_google_sheet():
        scopes = ['https://www.googleapis.com/auth/spreadsheets']
        creds = Credentials.from_service_account_file('credentials.json', scopes=scopes)
        client = gspread.authorize(creds)
        
        sheet = client.open_by_key('1CjnwLGU597E8Uw0YJfOA0GkhoTOprqZBpF0qI6ihoag')
        worksheet = sheet.get_worksheet(0)
        
        clients = []
        for row in worksheet.get_all_records():
            if row.get('#') and row.get('Client Name'):
                clients.append(row)
        
        return clients
    """
    print("Google Sheets integration setup instructions:")
    print("1. Enable Google Sheets API in Google Cloud Console")
    print("2. Create service account credentials")
    print("3. Share the sheet with service account email")
    print("4. Install: pip install gspread google-auth-oauthlib")
    print("5. Use the example code in the function comments")

if __name__ == "__main__":
    print("Client Import from Google Sheets")
    print("=" * 40)
    
    choice = input("Choose option:\n1. Import hardcoded client data\n2. Show Google Sheets setup instructions\n\nEnter choice (1 or 2): ")
    
    if choice == "1":
        import_clients_from_google_sheet()
    elif choice == "2":
        setup_google_sheets_integration()
    else:
        print("Invalid choice. Exiting.")
