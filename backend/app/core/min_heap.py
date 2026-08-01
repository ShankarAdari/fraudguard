from typing import Any, Dict, List, Optional
import time

class AlertItem:
    """
    Data structure representing an alert item in the priority queue.
    Primary ordering key is priority_score (higher risk = higher priority in min-heap inverted scale or max-heap equivalence).
    Here, risk_score is converted to priority priority_val = -risk_score to implement Max-Priority via Min-Heap.
    """
    def __init__(self, alert_id: str, transaction_id: str, risk_score: float, payload: Dict[str, Any]):
        self.alert_id: str = alert_id
        self.transaction_id: str = transaction_id
        self.risk_score: float = risk_score
        # For Min-Heap: lower priority value comes out first. We want higher risk score first, so priority_key = -risk_score
        self.priority_key: float = -risk_score
        self.timestamp: float = time.time()
        self.payload: Dict[str, Any] = payload

    def __repr__(self) -> str:
        return f"<AlertItem id={self.alert_id} risk={self.risk_score:.4f}>"


class MinHeapPriorityQueue:
    """
    Hand-implemented 0-indexed array-based Min-Heap Priority Queue.
    Does not use standard library `heapq`. Demonstrates sift-up and sift-down operations.
    Used for FraudGuard risk-based alert triage system so highest risk items are processed first.
    """
    def __init__(self):
        self.heap: List[AlertItem] = []

    def _parent(self, index: int) -> int:
        return (index - 1) // 2

    def _left_child(self, index: int) -> int:
        return 2 * index + 1

    def _right_child(self, index: int) -> int:
        return 2 * index + 2

    def _swap(self, i: int, j: int) -> None:
        self.heap[i], self.heap[j] = self.heap[j], self.heap[i]

    def _sift_up(self, index: int) -> None:
        """Move element up to restore heap invariant (parent.priority_key <= child.priority_key)."""
        while index > 0:
            parent_idx = self._parent(index)
            if self.heap[index].priority_key < self.heap[parent_idx].priority_key:
                self._swap(index, parent_idx)
                index = parent_idx
            else:
                break

    def _sift_down(self, index: int) -> None:
        """Move element down to restore heap invariant."""
        size = len(self.heap)
        while True:
            smallest = index
            left = self._left_child(index)
            right = self._right_child(index)

            if left < size and self.heap[left].priority_key < self.heap[smallest].priority_key:
                smallest = left
            if right < size and self.heap[right].priority_key < self.heap[smallest].priority_key:
                smallest = right

            if smallest != index:
                self._swap(index, smallest)
                index = smallest
            else:
                break

    def push(self, item: AlertItem) -> None:
        """
        Insert an item into the priority queue.
        Time Complexity: O(log N)
        """
        self.heap.append(item)
        self._sift_up(len(self.heap) - 1)

    def pop(self) -> Optional[AlertItem]:
        """
        Remove and return the highest priority item (highest risk score).
        Time Complexity: O(log N)
        """
        if not self.heap:
            return None
        if len(self.heap) == 1:
            return self.heap.pop()

        root = self.heap[0]
        self.heap[0] = self.heap.pop()
        self._sift_down(0)
        return root

    def peek(self) -> Optional[AlertItem]:
        """
        Return the highest priority item without removing it.
        Time Complexity: O(1)
        """
        return self.heap[0] if self.heap else None

    def size(self) -> int:
        return len(self.heap)

    def is_empty(self) -> bool:
        return len(self.heap) == 0

    def to_list(self) -> List[Dict[str, Any]]:
        """Return array representation of alert payloads ordered by risk."""
        sorted_heap = sorted(self.heap, key=lambda x: x.priority_key)
        return [
            {
                "alert_id": item.alert_id,
                "transaction_id": item.transaction_id,
                "risk_score": item.risk_score,
                "timestamp": item.timestamp,
                "payload": item.payload
            }
            for item in sorted_heap
        ]
