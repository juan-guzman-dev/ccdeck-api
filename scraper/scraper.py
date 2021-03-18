# Import Necessary Libraries
from bs4 import BeautifulSoup as bs  # pip install beatifulsoup4
import requests  # pip install requests
import re
import json
import uuid

##############################################################################
##############################################################################
##############################################################################

# Scrape Chase cards

##############################################################################
##############################################################################
##############################################################################

# HELPERS:


def remove_tags(soup, tags):
    for tag in tags:
        for item in soup.find_all(tag):
            item.decompose()


def remove_tags_by_class(soup, class_):
    for tag in soup.select(f".{class_}"):
        tag.decompose()


# Save/Reload python dict to/from JSON file:

def save_data(title, data):
    """ Save python dict into JSON file"""
    with open(title, 'w', encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def load_data(title):
    """Load JSON file into python dict"""
    with open(title, encoding="utf-8") as f:
        return json.load(f)


def save_data2(title, data):
    """ Save each dict in list into JSON file"""
    with open(title, 'w', encoding="utf-8") as f:
        for item in data:
            f.write(json.dumps(item, skipkeys=False, ensure_ascii=False, check_circular=True, allow_nan=True,
                               cls=None, indent=None, separators=None, default=None, sort_keys=False) + "\n")

# ****************************************************************************
# FIRST STEP
# Function to scrape a single card (store in Python dictionary and return)


base_path = "https://creditcards.chase.com"


def get_card_info(url):
    # Load page
    r = requests.get(url)

    # Convert to a beautiful soup object
    soup = bs(r.content, "lxml")

    # Print out the HTML
    # print(soup.prettify())

    # python dictionary to store all scraped info on a card
    card_info = {}

    # ***********************************
    # Generate unique ID
    #
    # ***********************************

    card_info['ID'] = str(uuid.uuid4())

    # ***********************************
    # Scrape:
    #       Name
    # ***********************************

    card_info["Name"] = soup.find(
        "h1", attrs={"class": "card-title"}).get_text(" ", strip=True)

    # ***********************************
    # Scrape:
    #       URL
    # ***********************************

    card_info["URL"] = url

    # ***********************************
    # Scrape:
    #       Art Image
    # ***********************************

    product_art = soup.find(
        "div", attrs={"class": "card-art"})
    image_path = product_art.find("img")["src"]
    card_info['Art Image'] = base_path + image_path

    # onve we grabbed the art image, remove all a tags (†, *) from the soup
    remove_tags(soup, 'a')

    # ***********************************
    # Scrape:
    #       New Cardmember Offer
    # ***********************************

    offer = soup.select("p.description-item")[0]

    # offer title
    title = offer.strong.get_text(" ", strip=True)

    # offer description
    remove_tags(offer, ['span', 'strong'])
    description = offer.get_text(" ", strip=True)

    if re.search(r"Chase Freedom ® Student credit card", soup.find(
            "h1", attrs={"class": "card-title"}).get_text(" ", strip=True)):

        # grab note
        note = soup.select("p.description-item")[1].get_text(" ", strip=True)
        card_info['New Cardmember Offer'] = {
            'title': title, 'description': description + " " + note + "."}
    else:
        if description:
            card_info['New Cardmember Offer'] = {
                'title': title, 'description': description}
        else:
            card_info['New Cardmember Offer'] = {
                'title': title, 'description': None}

    # ***********************************
    # Scrape:
    #       At A Glance
    # ***********************************
    if re.search(r"Chase Freedom ® Student credit card", soup.find(
            "h1", attrs={"class": "card-title"}).get_text(" ", strip=True)):
        glance = soup.select("p.description-item")[2]
    else:
        glance = soup.select("p.description-item")[1]

    # At A Glance title
    title = glance.strong.get_text(" ", strip=True)

    # At A Glance description
    remove_tags(glance, ['span', 'strong'])
    description = glance.get_text(" ", strip=True)

    card_info['At A Glance'] = {
        'title': title, 'description': description}

    # ***********************************
    # Scrape:
    #       APR
    # ***********************************

    apr_raw = soup.select("p.sub-description-item")[0]
    remove_tags(apr_raw, ['strong'])
    remove_tags_by_class(apr_raw, 'lhsc-raw.hidden')
    apr = apr_raw.get_text(" ", strip=True).replace(
        " %", "%").replace("– ", "–")

    card_info['APR'] = apr

    # ***********************************
    # Scrape:
    #       Annual Fee
    # ***********************************

    fee_raw = soup.select("p.sub-description-item")[1]
    remove_tags(fee_raw, ['strong'])
    annual_fee = fee_raw.get_text(" ", strip=True)

    card_info['Annual Fee'] = annual_fee

    # ***********************************
    # Scrape:
    #       Rewards & Benefits
    # ***********************************

    product_benefits_soup = soup.find(
        "div", attrs={"id": "ProductBenefits"})

    primary_items = product_benefits_soup.find_all(
        "div", attrs={"class": "primary-item-content"})

    product_benefits = []

    for item in primary_items:
        item_dict = {}

        # title
        if item.h3:
            item_title = item.h3.get_text(" ", strip=True)
            item_dict['title'] = item_title
        else:
            item_dict['title'] = None

        # description
        paragraphs = item.find_all("p")
        if len(paragraphs) != 0:
            details_lst = []
            for p in paragraphs:
                if re.search(r"APR", p.get_text()):
                    remove_tags_by_class(p, 'lhsc-raw.hidden')
                    details_lst.append(p.get_text(" ", strip=True).replace(
                        " %", "%").replace("– ", "–"))
                else:
                    details_lst.append(p.get_text(" ", strip=True))

            item_dict['description'] = " ".join(details_lst)
        else:
            item_dict['description'] = None

        product_benefits.append(item_dict)

    card_info['Rewards & Benefits'] = product_benefits

    # print(card_info)
    # save_data("single_card_info.json", card_info)
    return card_info

# ****************************************************************************
# SECOND STEP
# Get info for all cards and save to JSON file


# Load page
url = "https://creditcards.chase.com/all-credit-cards?iCELL=61FY&jp_ltg=chsecate_allcards"
r = requests.get(url)
soup = bs(r.content, "lxml")

cards = soup.find_all("div", attrs={"class": "card-art"})
card_info_list = []

for index, card in enumerate(cards):
    # if index == 5:
    #     break

    # print index as we progress through the loop:
    if index % 5 == 0:
        print(index)

    try:
        relative_path = card.a['href']
        full_path = base_path + relative_path
        card_name = card.h3.a.get_text(" ", strip=True)

        card_info_list.append(get_card_info(full_path))

    except Exception as e:
        # print out info on each exception
        print(card_name)
        print(e)

save_data("card_data.json", card_info_list)
save_data2("card_data2.json", card_info_list)

# IHG ® Rewards Club Traveler Credit Card
