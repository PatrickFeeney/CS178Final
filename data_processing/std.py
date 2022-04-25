import numpy as np
import pandas as pd


static_data = pd.read_csv("MC2/data/StaticSensorReadings.csv")
times = np.array(static_data["Timestamp"], dtype="datetime64[h]")
delta_times = (times - np.min(times)).astype(int)
ids = np.array(static_data["Sensor-id"], dtype=int)
vals = np.array(static_data["Value"], dtype=float)
output = []
for id in np.unique(ids):
    for delta_time in range(np.min(delta_times), np.max(delta_times) + 1):
        std = np.std(vals[np.logical_and(id == ids, delta_time == delta_times)])
        output.append([
            "Static:%i" % (id,),
            delta_time,
            std if not np.isnan(std) else 0,
        ])
output_df = pd.DataFrame(output, columns=["Tag", "DeltaTime", "STD"])
output_df.to_csv("data_processing/StaticSensorSTD.csv", index=False)

mobile_data = pd.read_csv("MC2/data/MobileSensorReadings.csv")
times = np.array(mobile_data["Timestamp"], dtype="datetime64[h]")
delta_times = (times - np.min(times)).astype(int)
ids = np.array(mobile_data["Sensor-id"], dtype=int)
users = np.array(mobile_data[" User-id"], dtype=str)
vals = np.array(mobile_data["Value"], dtype=float)
output = []
for id in np.unique(ids):
    for delta_time in range(np.min(delta_times), np.max(delta_times) + 1):
        std = np.std(vals[np.logical_and(id == ids, delta_time == delta_times)])
        output.append([
            "%s:%i" % (users[id == ids][0].strip(), id,),
            delta_time,
            std if not np.isnan(std) else 0,
        ])
output_df = pd.DataFrame(output, columns=["Tag", "DeltaTime", "STD"])
output_df.to_csv("data_processing/MobileSensorSTD.csv", index=False)
