import numpy as np
import pandas as pd
n_normal = 1000
normal_data = pd.DataFrame({
    "tilt": np.random.normal(0.3, 0.15, n_normal),
    "vibration": np.random.normal(0.05, 0.02, n_normal),
    "displacement": np.random.normal(1.0, 0.4, n_normal),
    "strain": np.random.normal(100, 15, n_normal)
})
normal_data = normal_data.clip(lower=0)
normal_data.to_csv("normal_data.csv", index=False)
n_abnormal = 200
abnormal_data = pd.DataFrame({
    "tilt": np.random.uniform(3, 12, n_abnormal),
    "vibration": np.random.uniform(0.3, 1.0, n_abnormal),
    "displacement": np.random.uniform(8, 40, n_abnormal),
    "strain": np.random.uniform(250, 600, n_abnormal)
})
abnormal_data.to_csv("abnormal_data.csv", index=False)
print("Data generated successfully!")