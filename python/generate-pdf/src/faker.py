from faker import Faker
import random

fake = Faker()

def generate_fake_order():
    items_count = random.randint(1, 5)
    items = [
        {
            "description": fake.product_name(),
            "quantity": random.randint(1, 10),
            "cost": float(fake.price())
        } for _ in range(items_count)
    ]
    
    total = sum(item['cost'] for item in items)
    
    return {
        "id": fake.uuid4(),
        "date": fake.past_date(),
        "name": fake.name(),
        "items": items,
        "total": total
    }
