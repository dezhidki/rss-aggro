from flask import Flask, render_template, request, flash, redirect, url_for, jsonify
from google.appengine.api import users
import xml.etree.ElementTree as etree
import urllib
import model
import datetime
from google.appengine.ext import ndb
import traceback
import logging
import hashlib
import itertools
import email.utils
import pytz

# Minimum TTL in minutes (used if TLL is not specified in the feed itself)
# The main purpose is to reduce the DB update frequency even a little
# 60 minutes seems like a widely used default TTL
MIN_TTL = 60

app = Flask(__name__)
app.secret_key = '\x83\x84\x84|\x14g\x7f=\xb7\x8d\xa4Vu\xc3\x03\x81\r\xdaQ\xa3\x955\xbb\xbf'
app.debug = True    # We'll leave the debug mode on for the learning purpose -- this is not a production application, just an assignment.

def merge(x, y):
    """Given two dicts, merge them into a new dict as a shallow copy."""
    z = x.copy()
    z.update(y)
    return z

def encode(val):
    return val.encode("UTF-8") if val is not None else None

def enc(val):
    if isinstance(val, str):
        return val
    if isinstance(val, unicode):
        return val.encode("UTF-8")
    
    return "None"

def hash_item(item, feed_key):
    # We'll use SHA1 hashing to have a balance between collision chance and speed
    # Could as well use MD5 for speed
    m = hashlib.sha1()
    if item["title"] is not None:
        m.update(enc(item["title"]))
    else:
        m.update(enc(item["description"]))

    if item["link"] is not None:
        m.update(enc(item["link"]))
        
    m.update(enc(feed_key))
    return m.hexdigest()

def get_value(item, element, default):
    el = item.find(element)
    return el.text if el != None else default

"""
# Here's a pure JSON API tester
# Uncomment it if you want to test API directly

@app.route("/api/tester/")
def tester():
    return render_template("tester.html")
"""

class RssParseError(Exception):
    def __init__(self, message):
        self.message = message
    def __str__(self):
        return repr(self.message)

def download_feed(url):
    """
        Download the RSS feed and attempt to parse it.
    """

    root = etree.ElementTree()

    root = etree.parse(urllib.urlopen(url)).getroot()

    rss = {}

    # We shall be very strict about the specs!
    # Some feeds don't provide the version, but we shall fail it nonetheless.
    if root.tag != "rss" or root.get("version") != "2.0":
        raise RssParseError("The provided RSS feed is not version 2.0. Sorry!")
    
    if len(root) == 0:
        raise RssParseError("There are no channels in this RSS feed!")

    rss_channel = root[0]

    try:
        rss["title"] = rss_channel.find("title").text
        rss["link"] = rss_channel.find("link").text
        rss["description"] = rss_channel.find("description").text
        rss["ttl"] = get_value(rss_channel, "ttl", None)
        rss["items"] = []
        for item in rss_channel.iter("item"):
            item_data = {
                "title": get_value(item, "title", None),
                "description": get_value(item, "description", None),
                "link": get_value(item, "link", None),
                "pubDate": get_value(item, "pubDate", None)
            }
            rss["items"].append(item_data)
    except:
        raise RssParseError("Failed to parse RSS feed!")
    
    return rss

@app.route("/api/feeds", methods=["GET"])
def get_feeds():
    """
    Gets all saved feeds.

    Returns an array of JSON objects:

    {
        'id': id,
        'url': string
    }
    """
    result = [ {
        "id": feed.key.urlsafe(),
        "url": feed.url,
        "name": feed.feed_data["title"]
     } for feed in sorted(model.Feed.query(), key=lambda f: f.feed_data["title"].upper()) ]

    return jsonify(result)

@app.route("/api/feed/<string:key>/read", methods=["GET"])
def read_feed(key):
    """
    Gets the contents of the feed.
    
        :param key: Feed key as a url-encoded ndb.Key object

    Returns a JSON object that contains information about the feed:

    {
        'title': string,
        'link': string,
        'ttl': number,
        'items': array<{
            'feed': string,
            'key': string,
            'title': string,
            'description': string,
            'link': string,
            'pubDate': string
            }>
    }
    """
    feed_key = ndb.Key(urlsafe=key)

    feed = feed_key.get()
    if feed is None:
        return jsonify(error="The provided key does not correspond to any feed"), 404
    
    try:
        rss = download_feed(feed.url)

        if rss["ttl"] is None:
            rss["ttl"] = MIN_TTL

        # We'll hash each item's important info and use that as a key
        for item in rss["items"]:
            item["feed"] = key
            item["key"] = hash_item(item, key)
            date = email.utils.parsedate_tz(item["pubDate"])
            if date is not None:
                item["pubDate"] = datetime.datetime.fromtimestamp(email.utils.mktime_tz(date)).isoformat()

        rss["items"] = sorted(rss["items"], key=lambda i: i["pubDate"], reverse=True)
        rss["key"] = key
    except Exception, e:
        logging.error(traceback.format_exc())        
        return jsonify(status="ERR", error=str(e)), 500

    return jsonify(rss)

@app.route("/api/user", methods=["GET"])
def get_user_info():
    """
    Gets currently signed user's information.
    This is guaranteed to work, as long as the login is required in app.yaml.

    If there is no user info in the database, the information is inserted automatically.

    Returns a JSON object:

    {
        'nickname': string,
        'favourite_stories': array<{
            'feed': string,
            'key': string,
            'title': string,
            'description': string,
            'link': string,
            'pubDate': string
        }>,
        'feeds': array<{
            'key': string,
            'name': string
        }>,
        'read_stories': array<string>
    }
    """
    user = users.get_current_user()

    user_db = model.User.query(model.User.google_id == user.user_id()).get()

    # No user in the database! Create new entry...
    if user_db is None:
        user_db = model.User(google_id=user.user_id(), favourite_stories=[], feeds=[], favourite_stories_custom_order=False, feeds_custom_order=False, read_items=[])
        user_db.put()

    return jsonify({
        "nickname": user.nickname(),
        "favourite_stories": user_db.favourite_stories,
        "feeds": user_db.feeds,
        "read_stories": user_db.read_items
    })

@app.route("/api/user/feeds/order", methods=["POST"])
def order_feeds():
    """
    Sets the new order to user's feeds.

    Accepts JSON object with the following paramers:

    'new_order': array<integer> | null - An array of indices that specifies the new order in relation to the current one.

    If 'new_order' is null, the feeds are storted alphabetically by their name.
    """
    data = request.get_json(silent=True)
    if data is None or "new_order" not in data:
        return jsonify(status="ERR", error="The data must be in JSON format!"), 400

    user = users.get_current_user()
    user_db = model.User.query(model.User.google_id == user.user_id()).get()
    if user_db is None:
        return jsonify(status="ERR", error="There is no user information stored! Create an user entry with GET /user."), 403

    if data["new_order"] is not None:
        new_feeds = [ user_db.feeds[index] for index in data["new_order"] ]
        user_db.feeds_custom_order = True
    else:
        new_feeds = sorted(user_db.feeds, key=lambda f: f["name"])
        user_db.feeds_custom_order = False

    user_db.feeds = new_feeds
    user_db.put()

    return jsonify(user_db.feeds)

@app.route("/api/user/feeds/<string:key>", methods=["PATCH", "DELETE"])
def modify_feeds(key):
    """
    Modifies the feed according to the specified method and data.
    
    Arguments:
        key {string} -- An encoded ndb.Key reference to the feed.

    Methods:
        PATCH -- Modifies the name of the feed
        DELETE -- Deletes the feed from user (along with favourites and feed history)

    Data:
        PATCH method takes a JSON object with the following data:
            'name' : string -- New name for the feed
    """
    user = users.get_current_user()
    user_db = model.User.query(model.User.google_id == user.user_id()).get()
    if user_db is None:
        return jsonify(status="ERR", error="There is no user information stored! Create an user entry with GET /user."), 403

    found_feeds = [ index for index, feed in enumerate(user_db.feeds) if feed["feed"] == key ]

    if len(found_feeds) == 0:
        return jsonify(status="ERR", error="User is not subscribed to the given feed!"), 404

    if request.method == "PATCH":
        data = request.get_json(silent=True)
        if data is None or "name" not in data:
            return jsonify(status="ERR", error="The data must be in JSON format!"), 400

        user_db.feeds[found_feeds[0]]["name"] = data["name"]

        if not user_db.feeds_custom_order:
            user_db.feeds = sorted(user_db.feeds, key=lambda f: f["name"])
    
    elif request.method == "DELETE":
        del user_db.feeds[found_feeds[0]]

    user_db.put()

    return jsonify(user_db.feeds)


@app.route("/api/user/feeds", methods=["POST"])
def add_feed():
    """
    Adds a new feed to the user's (and whole DB's) feed list.

    Accepts a JSON object with the following data:

    'url': string -- URL to a VALID RSS feed
    'name': string -- User-defined name for the feed

    Returns a new list of feeds
    """
    data = request.get_json(silent=True)
    if data is None or "url" not in data or "name" not in data:
        return jsonify(status="ERR", error="The data must be in JSON format!"), 400

    user = users.get_current_user()
    user_db = model.User.query(model.User.google_id == user.user_id()).get()
    if user_db is None:
        return jsonify(status="ERR", error="There is no user information stored! Create an user entry with GET /user."), 403

    existing_feed = model.Feed.query(model.Feed.url == data["url"]).get()

    # If a feed alread exists in the DB, there is no need to read it
    if existing_feed is not None:
        existing_feed_key = existing_feed.key.urlsafe()
        
        # Check if the user already subscribed to the feed
        if next(( feed for feed in user_db.feeds if feed["feed"] == existing_feed_key ), None) is not None:
            return jsonify(user_db.feeds)
        
        user_db.feeds.append({
            "feed": existing_feed_key,
            "name": data["name"]
        })

    # Otherwise, we must read the RSS feed to confirm its validity
    else:
        try:
            # Try to read the RSS feed first
            # Check the validity of the feed by downloading it once
            rss = download_feed(data["url"])

            new_feed = model.Feed()
            new_feed.url = data["url"]
            new_feed.latest_items = []
            # Write the feed once to obtain the key
            feed_key = new_feed.put()

            new_feed.feed_data = {
                "title": rss["title"],
                "link": rss["link"],
                "description": rss["description"]
            }
            
            safe_key = feed_key.urlsafe()

            for item in rss["items"]:
                # Add a feed key to each item to make item referencing easier for clients
                item["feed"] = safe_key 
                date = email.utils.parsedate_tz(item["pubDate"])
                if date is not None:
                    item["pubDate"] = datetime.datetime.fromtimestamp(email.utils.mktime_tz(date)).isoformat()

            new_feed.latest_items = sorted(rss["items"], key=lambda i: i["pubDate"], reverse=True)[:20]

            for item in new_feed.latest_items:
                item["key"] = hash_item(item, feed_key.urlsafe())

            # Compute the next update time if RSS feed has a TTL value
            # If there is no TLL set by the feed, use our own minimal TTL to reduce server's workload
            if rss["ttl"] is not None:
                timedelta_ttl = datetime.timedelta(minutes=int(rss["ttl"]))
            else:
                timedelta_ttl = datetime.timedelta(minutes=MIN_TTL)
            new_feed.next_update = datetime.datetime.now() + timedelta_ttl

            feed_key = new_feed.put()

            user_db.feeds.append({
                "feed": feed_key.urlsafe(),
                "name": data["name"]
            })
        except RssParseError, rssErr:
            return jsonify(status="ERR", error=rssErr.message), 400
        except Exception, e:
            logging.error(traceback.format_exc())
            return jsonify(status="ERR", error="The provided feed is not a valid RSS feed!\nPlease provide a URL to a valid RSS 2.0 feed."), 400
    
    if not user_db.feeds_custom_order:
        user_db.feeds = sorted(user_db.feeds, key=lambda f: f["name"])
    
    user_db.put()

    return jsonify(user_db.feeds)

@app.route("/api/user/favourites/add", methods=["POST"])
def add_favourite():
    """
    Adds a feed item to favourites.

    Accepts a JSON object with the following properties:

    'feed' : <string> -- Feed key
    'title' : <string> -- Name of the story
    'description' : <string> -- Description of the story
    'link' : <string> -- Link to the story
    'pubDate' : <string> -- Publication date in ISO format
    """
    data = request.get_json(silent=True)
    if data is None:
        return jsonify(status="ERR", error="The data must be in JSON format!"), 400

    user = users.get_current_user()
    user_db = model.User.query(model.User.google_id == user.user_id()).get()
    if user_db is None:
        return jsonify(status="ERR", error="There is no user information stored! Create an user entry with GET /user."), 403    

    feed = ndb.Key(urlsafe=data["feed"]).get()

    if feed is None:
        return jsonify(status="ERR", error="There is no such feed item with the speficied key!"), 404

    try:
        fav_item = {
            "feed": data["feed"],
            "title" : data["title"],
            "description": data["description"],
            "link": data["link"],
            "pubDate": data["pubDate"]
        }
    except:
        return jsonify(status="ERR", error="Missing needed parameters!"), 400

    item_hash = hash_item(fav_item, feed.key.urlsafe())
    fav_item["key"] = item_hash

    # Check if the item is not favourited yet
    if next((item for item in user_db.favourite_stories if item["key"] == fav_item["key"]), None) is None:
        user_db.favourite_stories.append(fav_item)
        
        if not user_db.favourite_stories_custom_order:
            user_db.favourite_stories = sorted(user_db.favourite_stories, key=lambda s: s["title"])
        
        user_db.put()

    return jsonify(user_db.favourite_stories)

@app.route("/api/user/favourites/<string:key>", methods=["DELETE"])
def delete_favourite(key):
    """
    Deletes the specified favourite story based on story key.
    """
    user = users.get_current_user()
    user_db = model.User.query(model.User.google_id == user.user_id()).get()
    if user_db is None:
        return jsonify(status="ERR", error="There is no user information stored! Create an user entry with GET /user."), 403

    story_index = next((index for index, story in enumerate(user_db.favourite_stories) if story["key"] == key), None)

    if story_index is None:
        return jsonify(status="ERR", error="There is no such favourite item present!"), 404
    
    del user_db.favourite_stories[story_index]
    
    if not user_db.favourite_stories_custom_order:
        user_db.favourite_stories = sorted(user_db.favourite_stories, key=lambda s: s["title"])
    
    user_db.put()

    return jsonify(user_db.favourite_stories)

@app.route("/api/user/favourites/order", methods=["POST"])
def order_favourites():
    """
    Sets the order of favourite stories.

    Accepts a JSON object with the following arguments:

    'new_order' : array<number> | null -- An array of indices that specifies the new order compared to the current one.
                                          If null, order is reset to alphabetical
    """
    data = request.get_json(silent=True)
    if data is None or "new_order" not in data:
        return jsonify(status="ERR", error="The data must be in JSON format!"), 400

    user = users.get_current_user()
    user_db = model.User.query(model.User.google_id == user.user_id()).get()
    if user_db is None:
        return jsonify(status="ERR", error="There is no user information stored! Create an user entry with GET /user."), 403

    if data["new_order"] is not None:
        new_favourite_stories = [ user_db.favourite_stories[index] for index in data["new_order"] ]
        user_db.favourite_stories_custom_order = True
    else:
        new_favourite_stories = sorted(user_db.favourite_stories, key=lambda f: f["title"])
        user_db.favourite_stories_custom_order = False

    user_db.favourite_stories = new_favourite_stories
    user_db.put()

    return jsonify(user_db.favourite_stories)


@app.route("/api/user/read_items/<string:key>", methods=["PUT"])
def set_read(key):
    """Sets the given item key as read
    
    Arguments:
        key {string} -- Key of the item
    """

    user = users.get_current_user()
    user_db = model.User.query(model.User.google_id == user.user_id()).get()
    if user_db is None:
        return jsonify(status="ERR", error="There is no user information stored! Create an user entry with GET /user."), 403

    if next((item for item in user_db.read_items if item == key), None) is None:
        user_db.read_items.append(key)
        user_db.put()

    return jsonify(user_db.read_items)

@app.route("/api/user/read_items/clear", methods=["POST"])
def clear_read():
    """
    Clear read items history.
    """

    user = users.get_current_user()
    user_db = model.User.query(model.User.google_id == user.user_id()).get()
    if user_db is None:
        return jsonify(status="ERR", error="There is no user information stored! Create an user entry with GET /user."), 403

    user_db.read_items = []
    user_db.put()

    return jsonify(status="OK")


@app.route("/api/feeds/latest", methods=["GET"])
def get_latest_stories():

    user = users.get_current_user()
    user_db = model.User.query(model.User.google_id == user.user_id()).get()
    if user_db is None:
        return jsonify(status="ERR", error="Couldn't find user information (perhaps slow servers). Please refresh the page!"), 403

    feed_items = []

    # Iterate through all subscribed feeds, update them (if needed) and get the keys
    for subscription in user_db.feeds:
        feed_key = subscription["feed"]
        feed = ndb.Key(urlsafe=feed_key).get()

        if feed.next_update is None or datetime.datetime.now() > feed.next_update:
            try:
                rss = download_feed(feed.url)

                feed.feed_data = {
                    "title": rss["title"],
                    "link": rss["link"],
                    "description": rss["description"]
                }

                for item in rss["items"]:
                    item["feed"] = feed_key
                    date = email.utils.parsedate_tz(item["pubDate"])
                    if date is not None:
                        item["pubDate"] = datetime.datetime.fromtimestamp(email.utils.mktime_tz(date)).isoformat()

                # We'll try to sort by date, even though there is no guarantee a feed has it.
                # In that case there is really nothing we can do :(
                # (well, unless we assume the items are in chronological order, that is. But then we still can't decide the age between feeds...)
                feed.latest_items = sorted(rss["items"], key=lambda ri: ri["pubDate"], reverse=True)[:20]

                # We shall also add the hash key to easily differentiate between items
                for item in feed.latest_items:
                    item["key"] = hash_item(item, feed_key)

                # Compute the next update time if RSS feed has a TTL value
                # If there is no TLL set by the feed, use our own minimal TTL to reduce server's workload
                if rss["ttl"] is not None:
                    timedelta_ttl = datetime.timedelta(minutes=int(rss["ttl"]))
                else:
                    timedelta_ttl = datetime.timedelta(minutes=MIN_TTL)
                feed.next_update = datetime.datetime.now() + timedelta_ttl

                feed.put()

                feed_items.append(feed.latest_items)
            except Exception, e:
                logging.error(traceback.format_exc())
                return jsonify(status="ERR", error=str(e)), 500
        else:
            feed_items.append(feed.latest_items)
    
    latest_items = []

    # Get first 20 of the latest items
    # We use merging, since it should be faster (about O(n)) than concatinating, timsorting and splicing
    if len(feed_items) != 0:
        for i in range(0, 20):
            
            item = None
            list_index = None
            for index, item_list in enumerate(feed_items):
                # No more items in the item lsit
                if len(item_list) == 0:
                    continue
                
                if item is None or item_list[0]["pubDate"] > item["pubDate"]:
                    item = item_list[0]
                    list_index = index
            
            # No more items in any of the list
            if item is None:
                break
            
            latest_items.append(item)
            feed_items[list_index] = feed_items[list_index][1:]


    return jsonify(latest_items)

""" @app.route("/api/dell")
def dell():
    for item in model.FeedItem.query().fetch():
        item.key.delete() """