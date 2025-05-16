from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db, Product, RestockLog
from config import Config

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)
db.init_app(app)

@app.before_first_request
def create_tables():
    db.create_all()

@app.route('/api/products', methods=['GET', 'POST'])
def manage_products():
    """Handle GET and POST requests for products."""
    if request.method == 'GET':
        return get_products()
    elif request.method == 'POST':
        return add_product()

def get_products():
    """Retrieve all products."""
    products = Product.query.all()
    return jsonify([product.to_dict() for product in products]), 200

def add_product():
    """Add a new product."""
    data = request.get_json()
    new_product = Product(name=data['name'], sku=data['sku'], stock_level=data['stock_level'])
    db.session.add(new_product)
    db.session.commit()
    return jsonify(new_product.to_dict()), 201

@app.route('/api/products/<int:product_id>', methods=['GET', 'PUT', 'DELETE'])
def product_detail(product_id):
    """Handle GET, PUT, and DELETE requests for a specific product."""
    product = Product.query.get_or_404(product_id)
    if request.method == 'GET':
        return jsonify(product.to_dict()), 200
    elif request.method == 'PUT':
        return update_product(product)
    elif request.method == 'DELETE':
        return delete_product(product)

def update_product(product):
    """Update an existing product."""
    data = request.get_json()
    product.name = data['name']
    product.sku = data['sku']
    product.stock_level = data['stock_level']
    db.session.commit()
    return jsonify(product.to_dict()), 200

def delete_product(product):
    """Delete a product."""
    db.session.delete(product)
    db.session.commit()
    return jsonify({'result': True}), 204

@app.route('/api/products/<int:product_id>/restock', methods=['POST'])
def restock_product(product_id):
    """Restock a specific product."""
    data = request.get_json()
    product = Product.query.get_or_404(product_id)
    product.stock_level += data['quantity']
    db.session.add(RestockLog(product_id=product_id, quantity=data['quantity']))
    db.session.commit()
    return jsonify(product.to_dict()), 200

@app.route('/api/restocks', methods=['GET'])
def get_restock_logs():
    """Retrieve all restock logs."""
    logs = RestockLog.query.all()
    return jsonify([log.to_dict() for log in logs]), 200

@app.route('/api/products/low-stock', methods=['GET'])
def low_stock_products():
    """Retrieve products with stock below a defined threshold."""
    threshold = 10  # Define your threshold here
    low_stock = Product.query.filter(Product.stock_level < threshold).all()
    return jsonify([product.to_dict() for product in low_stock]), 200

@app.route('/api/products/analytics', methods=['GET'])
def stock_analytics():
    """Placeholder for stock analytics logic."""
    return jsonify({'message': 'Analytics data will be here.'}), 200

if __name__ == '__main__':
    app.run(debug=True)
