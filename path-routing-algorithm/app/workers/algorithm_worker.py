"""
Algorithm Worker - Background path computation loop
"""

import time
import threading
import httpx
from typing import Dict, Any, Optional, List
from app.utils.logger import get_logger
from app.config.constants import INTERVAL_SECONDS, SENSOR_DATA_URL
from app.config.graph import Graph
from app.config.corridor_mapping import CorridorMapper
from app.core.risk_calculator import calculate_node_risk
from app.core.goal_selector import select_available_goals
from app.core.source_prioritizer import prioritize_sources
from app.core.path_router import find_optimal_path
from app.core.path_validator import compute_path_metrics
from app.config.node_types import PRIMARY_GOALS, SOURCE_NODES
from app.api.routes import update_results

logger = get_logger(__name__)


class AlgorithmWorker:
    def __init__(self):
        self.running = False
        self.thread = None
        self.graph = Graph("data/graph.json")
        self.corridor_mapper = CorridorMapper("data/corridor_mapping.json")
        self.previous_sensor_data = None
    
    def start(self):
        """Start the background worker thread"""
        self.running = True
        self.thread = threading.Thread(target=self._run, daemon=True)
        self.thread.start()
        logger.info(f"Algorithm worker started - checking sensor data every {INTERVAL_SECONDS} seconds")
    
    def stop(self):
        """Stop the background worker"""
        self.running = False
        if self.thread:
            self.thread.join(timeout=5)
        logger.info("Algorithm worker stopped")
    
    def fetch_sensor_data(self) -> Optional[Dict[str, Any]]:
        """Fetch sensor data from the frontend API"""
        try:
            with httpx.Client(timeout=5.0) as client:
                response = client.get(SENSOR_DATA_URL)
                if response.status_code == 200:
                    logger.debug("Successfully fetched sensor data")
                    return response.json()
                else:
                    logger.warning(f"Failed to fetch sensor data: HTTP {response.status_code}")
                    return None
        except httpx.ConnectError:
            logger.warning(f"Cannot connect to sensor data endpoint: {SENSOR_DATA_URL}")
            return None
        except Exception as e:
            logger.error(f"Error fetching sensor data: {e}")
            return None
    
    def has_data_changed(self, current_data: Dict[str, Any]) -> bool:
        """Detect if ANY hazard values have changed (flame, smoke, temperature)"""
        if self.previous_sensor_data is None:
            logger.info("First run - computing initial paths")
            return True
        
        current_nodes = current_data.get("nodes", {})
        previous_nodes = self.previous_sensor_data.get("nodes", {})
        
        for node_id, current_values in current_nodes.items():
            if node_id not in previous_nodes:
                logger.info(f"New node detected: {node_id}")
                return True
            
            previous_values = previous_nodes[node_id]
            
            if current_values[0] != previous_values[0]:
                logger.info(f"Flame changed at {node_id}: {previous_values[0]} → {current_values[0]}")
                return True
            
            if current_values[1] != previous_values[1]:
                logger.info(f"Smoke changed at {node_id}: {previous_values[1]} → {current_values[1]}")
                return True
            
            if current_values[2] != previous_values[2]:
                logger.info(f"Temperature changed at {node_id}: {previous_values[2]} → {current_values[2]}")
                return True
        
        logger.debug("No changes detected in sensor data")
        return False
    
    def compute_risk_map(self, sensor_data: Dict[str, Any]) -> Dict[str, float]:
        """Compute risk for all nodes"""
        risk_map = {}
        nodes = sensor_data.get("nodes", {})
        
        for node_id, values in nodes.items():
            flame = values[0] if len(values) > 0 else 0
            smoke = values[1] if len(values) > 1 else 0
            temp = values[2] if len(values) > 2 else 30
            risk_map[node_id] = calculate_node_risk(flame, smoke, temp)
        
        return risk_map
    
    def get_occupancy_map(self, sensor_data: Dict[str, Any]) -> Dict[str, int]:
        """Extract occupancy from sensor data"""
        occupancy_map = {}
        nodes = sensor_data.get("nodes", {})
        
        for node_id, values in nodes.items():
            occupancy_map[node_id] = int(values[3]) if len(values) > 3 else 0
        
        return occupancy_map
    
    def get_safe_source_nodes(self, risk_map: Dict[str, float]) -> List[str]:
        """Return only source nodes that are NOT blocked"""
        safe_sources = []
        for source in SOURCE_NODES:
            if risk_map.get(source, 0) != float('inf'):
                safe_sources.append(source)
            else:
                logger.info(f"Source {source} is BLOCKED (high risk) - skipping")
        return safe_sources
    
    def compute_all_paths(self, sensor_data: Dict[str, Any]) -> tuple:
        """Compute evacuation paths for all safe source nodes"""
        logger.info("=" * 50)
        logger.info("RUNNING PATH ROUTING ALGORITHM")
        logger.info("=" * 50)
        
        risk_map = self.compute_risk_map(sensor_data)
        occupancy_map = self.get_occupancy_map(sensor_data)
        
        blocked_nodes = [n for n, r in risk_map.items() if r == float('inf')]
        if blocked_nodes:
            logger.warning(f"Blocked nodes (impassable): {blocked_nodes}")
        
        available_goals = select_available_goals(sensor_data.get("nodes", {}))
        logger.info(f"Available goals (safe destinations): {available_goals}")
        
        if not available_goals:
            logger.warning("No safe goals available! No paths can be computed.")
            return {}, {}
        
        safe_sources = self.get_safe_source_nodes(risk_map)
        logger.info(f"Safe source nodes: {safe_sources}")
        
        if not safe_sources:
            logger.warning("No safe source nodes! No paths can be computed.")
            return {}, {}
        
        source_priorities = prioritize_sources(risk_map, occupancy_map)
        logger.info(f"Source priority order: {source_priorities}")
        
        paths = {}
        metrics = {}
        paths_found = 0
        
        for source in source_priorities:
            if source not in safe_sources:
                logger.info(f"Skipping {source} - source node is blocked")
                continue
                
            logger.info(f"Computing path from {source}...")
            
            node_path = find_optimal_path(
                source, available_goals, self.graph,
                risk_map, occupancy_map
            )
            
            if node_path:
                goal_node = node_path[-1]
                goal_type = "primary" if goal_node in PRIMARY_GOALS else "secondary"
                
                logger.info(f"  Path found: {' → '.join(node_path)}")
                logger.info(f"  Goal: {goal_node} ({goal_type})")
                
                if goal_type == "primary":
                    corridor_path = self.corridor_mapper.node_path_to_corridor_path(node_path)
                    path_metrics = compute_path_metrics(node_path, risk_map, occupancy_map, self.graph)
                    
                    paths[source] = {
                        "node_path": node_path,
                        "corridor_path": corridor_path,
                        "goal_node": goal_node,
                        "goal_type": goal_type
                    }
                    metrics[source] = path_metrics
                    paths_found += 1
                    
                    logger.info(f"  ✓ ACCEPTED - Evacuation route to primary goal")
                else:
                    logger.info(f"  ✗ REJECTED - Path ends in secondary goal, but primary goals are available")
            else:
                logger.warning(f"  ✗ No path found from {source}")
        
        logger.info("=" * 50)
        logger.info(f"COMPUTATION COMPLETE: {paths_found} evacuation paths found")
        logger.info("=" * 50)
        
        return paths, metrics
    
    def _run(self):
        """Main worker loop - runs every INTERVAL_SECONDS"""
        logger.info(f"Will fetch sensor data from: {SENSOR_DATA_URL}")
        logger.info(f"Checking every {INTERVAL_SECONDS} seconds")
        
        cycle_count = 0
        
        while self.running:
            cycle_count += 1
            logger.info(f"--- Cycle {cycle_count} ---")
            
            try:
                sensor_data = self.fetch_sensor_data()
                
                if not sensor_data:
                    logger.warning(f"No sensor data available from {SENSOR_DATA_URL}")
                    time.sleep(INTERVAL_SECONDS)
                    continue
                
                if self.has_data_changed(sensor_data):
                    logger.info(">>> CHANGE DETECTED - Running path routing algorithm <<<")
                    
                    paths, metrics = self.compute_all_paths(sensor_data)
                    update_results(paths, metrics, time.time(), "sensor_change")
                    self.previous_sensor_data = sensor_data
                    
                    logger.info(f"Results updated: {len(paths)} evacuation paths available")
                else:
                    logger.info("No changes detected - Skipping recomputation")
                
                time.sleep(INTERVAL_SECONDS)
                
            except Exception as e:
                logger.error(f"Algorithm worker error: {e}")
                import traceback
                traceback.print_exc()
                time.sleep(INTERVAL_SECONDS)
        
        logger.info("Algorithm worker loop ended")