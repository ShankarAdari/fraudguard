# Unit tests for custom LRU Cache and Min-Heap Priority Queue algorithms.
from app.core.lru_cache import LRUCache
from app.core.min_heap import MinHeapPriorityQueue, AlertItem


def test_lru_cache_operations():
    cache = LRUCache(capacity=2)
    cache.put("k1", "v1")
    cache.put("k2", "v2")
    assert cache.get("k1") == "v1"
    
    # Exceed capacity, k2 should be LRU (since k1 was accessed)
    cache.put("k3", "v3")
    assert cache.get("k2") is None
    assert cache.get("k1") == "v1"
    assert cache.get("k3") == "v3"

def test_min_heap_priority_queue():
    pq = MinHeapPriorityQueue()
    item1 = AlertItem("a1", "t1", 0.45, {})
    item2 = AlertItem("a2", "t2", 0.95, {})
    item3 = AlertItem("a3", "t3", 0.70, {})

    pq.push(item1)
    pq.push(item2)
    pq.push(item3)

    # Highest risk score (0.95) should be popped first
    popped1 = pq.pop()
    assert popped1.risk_score == 0.95
    assert popped1.alert_id == "a2"

    popped2 = pq.pop()
    assert popped2.risk_score == 0.70

    popped3 = pq.pop()
    assert popped3.risk_score == 0.45

if __name__ == "__main__":
    test_lru_cache_operations()
    test_min_heap_priority_queue()
    print("ALL DSA TESTS PASSED SUCCESSFULLY!")
