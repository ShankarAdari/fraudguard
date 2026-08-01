from typing import Any, Dict, Optional

class Node:
    """Node for Doubly Linked List."""
    def __init__(self, key: str, value: Any):
        self.key: str = key
        self.value: Any = value
        self.prev: Optional['Node'] = None
        self.next: Optional['Node'] = None

class LRUCache:
    """
    Custom LRU (Least Recently Used) Cache using a Doubly Linked List and Hash Map.
    Provides O(1) time complexity for get and put operations.
    Used in FraudGuard feature store caching to showcase DSA without relying on functools.lru_cache.
    """
    def __init__(self, capacity: int = 1000):
        if capacity <= 0:
            raise ValueError("Capacity must be greater than 0")
        self.capacity: int = capacity
        self.cache: Dict[str, Node] = {}
        
        # Dummy head and tail nodes to simplify edge insertions/removals
        self.head: Node = Node("", None)
        self.tail: Node = Node("", None)
        self.head.next = self.tail
        self.tail.prev = self.head

    def _remove(self, node: Node) -> None:
        """Remove an existing node from the doubly linked list."""
        prev_node = node.prev
        next_node = node.next
        if prev_node:
            prev_node.next = next_node
        if next_node:
            next_node.prev = prev_node

    def _add_to_head(self, node: Node) -> None:
        """Add a node right after head (Most Recently Used position)."""
        node.next = self.head.next
        node.prev = self.head
        if self.head.next:
            self.head.next.prev = node
        self.head.next = node

    def get(self, key: str) -> Optional[Any]:
        """
        Fetch value by key and move the accessed node to the MRU position.
        Time Complexity: O(1)
        """
        if key in self.cache:
            node = self.cache[key]
            self._remove(node)
            self._add_to_head(node)
            return node.value
        return None

    def put(self, key: str, value: Any) -> None:
        """
        Insert or update key-value pair. If capacity is exceeded, evict the LRU node.
        Time Complexity: O(1)
        """
        if key in self.cache:
            node = self.cache[key]
            node.value = value
            self._remove(node)
            self._add_to_head(node)
        else:
            if len(self.cache) >= self.capacity:
                # Evict tail's prev (Least Recently Used node)
                lru_node = self.tail.prev
                if lru_node and lru_node != self.head:
                    self._remove(lru_node)
                    del self.cache[lru_node.key]

            new_node = Node(key, value)
            self.cache[key] = new_node
            self._add_to_head(new_node)

    def size(self) -> int:
        return len(self.cache)

    def clear(self) -> None:
        self.cache.clear()
        self.head.next = self.tail
        self.tail.prev = self.head
