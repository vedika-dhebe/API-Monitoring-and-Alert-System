import requests
import pandas as pd
import time
from prophet import Prophet
# import os

# ==============================
# CONFIG
# ==============================
PROMETHEUS = "http://prometheus:9090"   # inside docker

# SLACK_WEBHOOK = os.getenv("SLACK_WEBHOOK_URL")
SLEEP_INTERVAL = 600   # 2 hours

# ==============================
# FETCH ALL SERVICES
# ==============================
def get_services():
    try:
        res = requests.get(f"{PROMETHEUS}/api/v1/label/exported_job/values")
        data = res.json()

        services = data.get("data", [])

        if not services:
            print("⚠️ No services via exported_job, trying 'job' label...")

            res = requests.get(f"{PROMETHEUS}/api/v1/label/job/values")
            data = res.json()
            services = data.get("data", [])

        return services

    except Exception as e:
        print("Error fetching services:", e)
        return []




# ==============================
# GENERIC METRIC FETCHER
# ==============================
def fetch_timeseries(query):
    end = int(time.time())
    start = end - 3600  # last 1 hour

    res = requests.get(
        f"{PROMETHEUS}/api/v1/query_range",
        params={
            "query": query,
            "start": start,
            "end": end,
            "step": "30"
        }
    )

    data = res.json()["data"]["result"]

    if not data:
        return None

    values = data[0]["values"]

    df = pd.DataFrame(values, columns=["ds", "y"])
    df["ds"] = pd.to_datetime(df["ds"], unit="s")
    df["y"] = df["y"].astype(float)

    return df


# ==============================
# METRIC QUERIES
# ==============================
def latency_query(service):
    return f'''
    histogram_quantile(0.95,
      sum(rate(bank_http_client_duration_milliseconds_bucket{{exported_job="{service}"}}[5m])) by (le)
    )
    '''

def error_query(service):
    return f'''
    sum(rate(bank_http_client_duration_milliseconds_count{{exported_job="{service}", http_status_code=~"5.."}}[5m]))
    /
    sum(rate(bank_http_client_duration_milliseconds_count{{exported_job="{service}"}}[5m]))
    '''

def traffic_query(service):
    return f'''
    sum(rate(bank_http_client_duration_milliseconds_count{{exported_job="{service}"}}[1m]))
    '''


# ==============================
# FORECAST FUNCTION
# ==============================
def forecast(df):
    try:
        model = Prophet()
        model.fit(df)

        future = model.make_future_dataframe(periods=10, freq="min")
        forecast = model.predict(future)

        return forecast["yhat"].iloc[-1]

    except Exception as e:
        print("Forecast error:", e)
        return None


# ==============================
# ANOMALY DETECTION
# ==============================
def anomaly_score(series, predicted):
    mean = series.mean()
    std = series.std()

    score = 0

    if predicted is None:
        return 0

    # future anomaly
    if predicted > mean + 2 * std:
        score += 1

    # current anomaly
    if series.iloc[-1] > mean + 2 * std:
        score += 1

    return score


# ==============================
# RISK ENGINE
# ==============================
def evaluate(service, latency_df, error_df, traffic_df):
    pred_latency = forecast(latency_df)
    pred_error = forecast(error_df)
    pred_traffic = forecast(traffic_df)

    score = 0

    score += anomaly_score(latency_df["y"], pred_latency)
    score += anomaly_score(error_df["y"], pred_error)

    # traffic drop detection
    if pred_traffic is not None:
        if pred_traffic < traffic_df["y"].mean() * 0.5:
            score += 1

    if score >= 2:
        return {
            "service": service,
            "risk": "HIGH",
            "latency": pred_latency,
            "error": pred_error,
            "traffic": pred_traffic
        }

    return None


# ==============================
# ALERTING
# ==============================
def send_alert(data):
    try:
        message = f"""
⚠️ *PREDICTION ALERT*

Service: {data['service']}

Predicted Issues:
- Latency: {data['latency']:.2f} ms
- Error Rate: {data['error']:.4f}
- Traffic: {data['traffic']:.2f}

Risk Level: {data['risk']}
"""

        requests.post(SLACK_WEBHOOK, json={"text": message})

    except Exception as e:
        print("Slack error:", e)


# ==============================
# MAIN LOOP
# ==============================
def run():
    print("Prediction cycle started")

    services = get_services()
    print("DEBUG services:", services)

    if not services:
        print("No services found")
        return

    for service in services:
        print(f"Analyzing {service}")

        latency_df = fetch_timeseries(latency_query(service))
        error_df = fetch_timeseries(error_query(service))
        traffic_df = fetch_timeseries(traffic_query(service))

        if latency_df is None or error_df is None or traffic_df is None:
            print(f"Skipping {service} (no data)")
            continue

        pred_latency = forecast(latency_df)
        pred_error = forecast(error_df)
        pred_traffic = forecast(traffic_df)

        print(f"""
            DEBUG {service}:
            Latency: {pred_latency}
            Error: {pred_error}
            Traffic: {pred_traffic}
            """)

        #FORCE ALERT (no condition)
        send_alert({
            "service": service,
            "risk": "TEST",
            "latency": pred_latency or 0,
            "error": pred_error or 0,
            "traffic": pred_traffic or 0
        })



# ==============================
# SCHEDULER
# ==============================
if __name__ == "__main__":
    while True:
        run()
        print(f"Sleeping for {SLEEP_INTERVAL} seconds...\n")
        time.sleep(SLEEP_INTERVAL)
