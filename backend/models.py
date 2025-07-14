
from app import db

class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    type = db.Column(db.String(10), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(200), nullable=True)
    date = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    def to_dict(self):
        return {
            'id': self.id,
            'amount': self.amount,
            'type': self.type,
            'category': self.category,
            'description': self.description,
            'date': self.date,
            'createdAt': self.created_at.isoformat()
        }
