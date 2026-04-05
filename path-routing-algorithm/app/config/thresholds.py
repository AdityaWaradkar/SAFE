"""
Sensor Thresholds and Risk Weights
"""

# ============================================================
# HARD BLOCK THRESHOLDS (Risk = infinity)
# ============================================================
FLAME_BLOCK_THRESHOLD = 30      # % - Lowered from 40 to 30
SMOKE_BLOCK_THRESHOLD = 50      # % - Lowered from 60 to 50
TEMP_BLOCK_THRESHOLD = 55       # °C - Lowered from 60 to 55

# ============================================================
# FLAME RISK WEIGHTS
# ============================================================
FLAME_WEIGHT_LOW = 1.0      # 1-10%
FLAME_WEIGHT_MEDIUM = 4.0   # 10-20%
FLAME_WEIGHT_HIGH = 8.0     # 20-30%

# ============================================================
# SMOKE RISK WEIGHTS
# ============================================================
SMOKE_WEIGHT_LOW = 0.5      # 10-20%
SMOKE_WEIGHT_MEDIUM = 2.0   # 20-40%
SMOKE_WEIGHT_HIGH = 4.0     # 40-50%

# ============================================================
# TEMPERATURE RISK WEIGHTS (Indian Context)
# ============================================================
TEMP_WEIGHT_LOW = 0.5       # 45-50°C
TEMP_WEIGHT_MEDIUM = 2.0    # 50-55°C
TEMP_WEIGHT_HIGH = 5.0      # 55-60°C