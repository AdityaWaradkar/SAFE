"""
Graph Loader and Accessor Functions
"""

import json
from typing import List, Tuple, Dict

class Graph:
    def __init__(self, graph_file_path: str = "data/graph.json"):
        with open(graph_file_path, 'r') as f:
            data = json.load(f)
        
        self.size = data['size']
        self.matrix = data['matrix']
        self.adjacency_list = self._build_adjacency_list()
    
    def _build_adjacency_list(self) -> Dict[str, List[Tuple[str, float]]]:
        """Convert matrix to adjacency list with node names N_1 to N_20"""
        adjacency = {}
        for i in range(self.size):
            node_u = f"N_{i+1}"
            adjacency[node_u] = []
            for j in range(self.size):
                weight = self.matrix[i][j]
                if weight != 0:
                    node_v = f"N_{j+1}"
                    adjacency[node_u].append((node_v, float(weight)))
        return adjacency
    
    def get_neighbors(self, node_id: str) -> List[Tuple[str, float]]:
        """Return list of (neighbor_id, distance) for given node"""
        return self.adjacency_list.get(node_id, [])
    
    def get_distance(self, node_u: str, node_v: str) -> float:
        """Get distance between two nodes"""
        for neighbor, dist in self.adjacency_list.get(node_u, []):
            if neighbor == node_v:
                return dist
        return float('inf')
    
    def get_all_nodes(self) -> List[str]:
        """Return list of all node IDs"""
        return [f"N_{i+1}" for i in range(self.size)]
    
    def get_adjacency_list(self) -> Dict[str, List[Tuple[str, float]]]:
        """Return full adjacency list"""
        return self.adjacency_list