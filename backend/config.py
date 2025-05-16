import os

class Config:
    """Configuration class for Flask application."""
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'postgresql://username:password@localhost/shop_inventory'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
