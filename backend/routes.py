
from flask import request, jsonify
from app import app, db
from models import Transaction

@app.route('/api/transactions', methods=['GET', 'POST'])
def handle_transactions():
    if request.method == 'POST':
        data = request.get_json()
        new_transaction = Transaction(
            amount=data['amount'],
            type=data['type'],
            category=data['category'],
            description=data.get('description'),
            date=data['date']
        )
        db.session.add(new_transaction)
        db.session.commit()
        return jsonify(new_transaction.to_dict()), 201
    
    transactions = Transaction.query.all()
    return jsonify([t.to_dict() for t in transactions])

@app.route('/api/transactions/<int:id>', methods=['DELETE'])
def delete_transaction(id):
    transaction = Transaction.query.get_or_404(id)
    db.session.delete(transaction)
    db.session.commit()
    return '', 204

@app.route('/api/dashboard-stats', methods=['GET'])
def get_dashboard_stats():
    # This is a placeholder. Actual implementation will require calculations.
    stats = {
        'totalBalance': 10000,
        'monthlyIncome': 5000,
        'monthlyExpenses': 2500,
        'transactionCount': 50
    }
    return jsonify(stats)
