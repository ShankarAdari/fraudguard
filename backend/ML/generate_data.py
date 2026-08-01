import random
import json
import time

def generate_synthetic_transactions(count=200):
    categories = ["retail", "travel", "groceries", "electronics", "crypto", "wire_transfer", "digital_goods"]
    devices = ["dev_iphone_15", "dev_macbook_pro", "dev_pixel_8", "dev_unknown_linux", "dev_android_tablet"]
    users = [f"usr_{i:03d}" for i in range(101, 130)]
    
    transactions = []
    
    for i in range(count):
        user_id = random.choice(users)
        # Induce fraud patterns
        is_fraud_scenario = random.random() < 0.15
        
        if is_fraud_scenario:
            amount = round(random.uniform(800.0, 4900.0), 2)
            merchant_category = random.choice(["crypto", "wire_transfer", "electronics"])
            device_id = "dev_unknown_linux"
            location = random.choice(["Lagos, NG", "Bucharest, RO", "Unknown Location"])
        else:
            amount = round(random.uniform(10.0, 250.0), 2)
            merchant_category = random.choice(categories)
            device_id = random.choice(devices[:3])
            location = random.choice(["New York, US", "San Francisco, US", "London, UK", "Toronto, CA"])
            
        txn = {
            "transaction_id": f"tx_{int(time.time()*1000)}_{i:04d}",
            "user_id": user_id,
            "amount": amount,
            "merchant_id": f"merch_{random.randint(100, 999)}",
            "merchant_category": merchant_category,
            "device_id": device_id,
            "location": location,
            "ip_address": f"{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}",
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(time.time() - random.randint(0, 86400)))
        }
        transactions.append(txn)
        
    return transactions

if __name__ == "__main__":
    txns = generate_synthetic_transactions(150)
    with open("backend/ML/synthetic_transactions.json", "w") as f:
        json.dump(txns, f, indent=2)
    print(f"Generated {len(txns)} synthetic transactions saved to backend/ML/synthetic_transactions.json")
