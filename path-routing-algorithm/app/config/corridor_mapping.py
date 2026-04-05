"""
Corridor Mapping - Converts node paths to corridor IDs for navigation
"""

import json
from typing import List, Optional

class CorridorMapper:
    def __init__(self, mapping_file_path: str = "data/corridor_mapping.json"):
        with open(mapping_file_path, 'r') as f:
            self.mapping = json.load(f)
    
    def get_corridor_id(self, node_u: str, node_v: str) -> Optional[str]:
        """Get corridor ID for an edge between two nodes (order independent)"""
        key = f"{node_u}-{node_v}"
        if key in self.mapping:
            return self.mapping[key]
        key_reverse = f"{node_v}-{node_u}"
        if key_reverse in self.mapping:
            return self.mapping[key_reverse]
        return None
    
    def node_path_to_corridor_path(self, node_path: List[str]) -> List[str]:
        """Convert a node path to a corridor path for navigation"""
        corridor_path = []
        for i in range(len(node_path) - 1):
            corridor_id = self.get_corridor_id(node_path[i], node_path[i + 1])
            if corridor_id:
                corridor_path.append(corridor_id)
            else:
                corridor_path.append(f"{node_path[i]}→{node_path[i+1]}")
        
        # Remove consecutive duplicates
        unique_path = []
        prev = None
        for c in corridor_path:
            if c != prev:
                unique_path.append(c)
                prev = c
        return unique_path