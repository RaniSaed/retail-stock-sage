from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db, Product, RestockLog
from config import Config
from datetime import datetime, timedelta

app = Flask(__name__)
app.url_map.strict_slashes = False  # מאפשר גישה גם עם וגם בלי סלש בסוף
app.config.from_object(Config)

# אפשר גישה ל-CORS מהפרונטאנד שלך בlocalhost:8080
CORS(app, resources={r"/api/*": {"origins": "http://localhost:8080"}})

db.init_app(app)

@app.route('/api/products', methods=['GET', 'POST'])
def manage_products():
    if request.method == 'GET':
        return get_products()
    elif request.method == 'POST':
        return add_product()
    else:
        return jsonify({'error': 'Method Not Allowed'}), 405

def get_products():
    products = Product.query.all()
    return jsonify([product.to_dict() for product in products]), 200

def add_product():
    data = request.get_json()
    try:
        new_product = Product(
            name=data['name'],
            sku=data['sku'],
            stock_level=data.get('stock_level', 0),
            category=data.get('category'),
            price=data.get('price'),
            cost=data.get('cost')
        )
        db.session.add(new_product)
        db.session.commit()
        return jsonify(new_product.to_dict()), 201
    except KeyError as e:
        return jsonify({"error": f"Missing field {e}"}), 400

@app.route('/api/products/<int:product_id>', methods=['GET', 'PUT', 'DELETE'])
def product_detail(product_id):
    product = Product.query.get_or_404(product_id)
    if request.method == 'GET':
        return jsonify(product.to_dict()), 200
    elif request.method == 'PUT':
        return update_product(product)
    elif request.method == 'DELETE':
        return delete_product(product)
    else:
        return jsonify({'error': 'Method Not Allowed'}), 405

def update_product(product):
    data = request.get_json()
    try:
        product.name = data['name']
        product.sku = data['sku']
        product.category = data.get('category')
        product.price = data.get('price')
        product.cost = data.get('cost')
        product.stock_level = data.get('stock_level', product.stock_level)
        db.session.commit()
        return jsonify(product.to_dict()), 200
    except KeyError as e:
        return jsonify({"error": f"Missing field {e}"}), 400

def delete_product(product):
    db.session.delete(product)
    db.session.commit()
    return jsonify({'result': True}), 204

@app.route('/api/products/<int:product_id>/restock', methods=['POST'])
def restock_product(product_id):
    data = request.get_json()
    product = Product.query.get_or_404(product_id)
    try:
        quantity = data['quantity']
        product.stock_level += quantity
        db.session.add(product)
        db.session.add(RestockLog(product_id=product_id, quantity=quantity))
        db.session.commit()
        return jsonify(product.to_dict()), 200
    except KeyError as e:
        return jsonify({"error": f"Missing field {e}"}), 400

@app.route('/api/restocks', methods=['GET'])
def get_restock_logs():
    logs = RestockLog.query.all()
    return jsonify([log.to_dict() for log in logs]), 200

@app.route('/api/products/low-stock', methods=['GET'])
def low_stock_products():
    threshold = 10  # סף מלאי נמוך
    low_stock = Product.query.filter(Product.stock_level < threshold).all()
    return jsonify([product.to_dict() for product in low_stock]), 200

@app.route('/api/products/analytics', methods=['GET'])
def stock_analytics():
    return jsonify({'message': 'Analytics data will be here.'}), 200


# --- הוספת API חדש לסיכום Dashboard ---

@app.route('/api/dashboard/summary', methods=['GET'])
def dashboard_summary():
    products = Product.query.all()
    totalProducts = len(products)
    totalValue = sum((p.price or 0) * (p.stock_level or 0) for p in products)
    lowStockThreshold = 10
    lowStockProducts = len([p for p in products if (p.stock_level or 0) < lowStockThreshold])

    since = datetime.utcnow() - timedelta(days=1)
    restocksPendingCount = RestockLog.query.filter(RestockLog.timestamp >= since).count()

    return jsonify({
        "totalProducts": totalProducts,
        "totalValue": totalValue,
        "lowStockProducts": lowStockProducts,
        "restocksPending": restocksPendingCount
    })


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='localhost', port=5000, debug=True)
