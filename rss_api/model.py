from google.appengine.ext import ndb

# We make an extensive use of JSON properties to vastly reduce write operations on the DB
# If we used structured properties, lists -- and other native types -- we would need to do ~50 writes per user.
# With JSON, we have to do only ~8-10 operations.
# We could reduce it even more put serializing everything into JSON.

class Feed(ndb.Model):
    url = ndb.StringProperty(required=True)
    next_update = ndb.DateTimeProperty()
    feed_data = ndb.JsonProperty()
    latest_items = ndb.JsonProperty()

class User(ndb.Model):
    google_id = ndb.StringProperty(required=True, indexed=True)
    favourite_stories = ndb.JsonProperty() # We'll save fav items on per-user basis, since we don't want to have them deleted
    feeds = ndb.JsonProperty()
    favourite_stories_custom_order = ndb.BooleanProperty()
    feeds_custom_order = ndb.BooleanProperty()
    read_items = ndb.JsonProperty()