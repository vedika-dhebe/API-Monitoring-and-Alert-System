# 🚀 AI-Powered API Monitoring & Anomaly Detection System

## 📹 Demo Video
[![Watch the Demo](https://img.youtube.com/vi/IVdGLp2Uwyk/0.jpg)](https://www.youtube.com/watch?v=IVdGLp2Uwyk&ab_channel=Aakash11Mokani)

**Click above to watch the full system demonstration**

---

## 🧠 Problem It Solves

The **AI-Powered API Monitoring and Anomaly Detection System** tackles performance issues in large-scale, distributed API platforms spread across on-premise, cloud, and multi-cloud environments. It provides intelligent monitoring, predictive analytics, and automated incident response to ensure optimal API performance and reliability.

## 🚀 Key Features & Benefits

### 🤖 AI Phone Alert & Automation System
- Sends **automated phone alerts** triggered by logs, metrics, and traces
- **Automates recovery tasks** based on predefined workflows
- Delivers **Root Cause Analysis (RCA)** reports to engineers on-demand
- Voice-enabled incident reporting and status updates

### 🔍 Intelligent Root Cause Analysis Engine
- Correlates logs, metrics, and traces using **Prophet** for time-series forecasting
- **Isolation Forest** algorithm for real-time anomaly detection
- Identifies root causes of issues including predicted anomalies
- Generates comprehensive RCA reports automatically

### ✅ Real-time Monitoring Stack
- **Grafana** for unified dashboards and visualization
- **Loki** for centralized log aggregation and analysis
- **Tempo** for distributed tracing across microservices
- **Mimir** for long-term metrics storage and querying

### 🔥 Advanced Anomaly Detection
- **Isolation Forest** ML algorithm for unsupervised anomaly detection
- Detects latency spikes, error rate anomalies, and unusual patterns
- Environment-aware alerts with context-specific thresholds
- Real-time scoring and classification of anomalous behavior

### 📈 Predictive Analytics
- **Prophet** forecasting model for trend analysis
- Predicts potential failures using historical data patterns
- Proactive alerting before issues impact users
- Capacity planning and resource optimization insights

### 🧭 End-to-End API Tracking
- Complete API request journey tracking across environments
- Cross-service correlation and dependency mapping
- Performance bottleneck identification
- Service mesh observability

### 📊 Centralized Visualization
- Unified Grafana dashboards for platform health overview
- Custom alerting rules and notification channels
- Real-time metrics, logs, and traces correlation
- Historical trend analysis and reporting

---

## 🏗️ System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Node.js API   │───▶│ OpenTelemetry    │───▶│     Grafana     │
│   Application   │    │    Collector     │    │   (Dashboard)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │  Observability   │
                       │     Stack        │
                       ├──────────────────┤
                       │ • Loki (Logs)    │
                       │ • Tempo (Traces) │
                       │ • Mimir (Metrics)│
                       └──────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   AI/ML Engine   │
                       ├──────────────────┤
                       │ • Prophet        │
                       │ • Isolation      │
                       │   Forest         │
                       └──────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │  Alert System    │
                       ├──────────────────┤
                       │ • Phone Calls    │
                       │ • RCA Reports    │
                       │ • Automation     │
                       └──────────────────┘
```

---

## 🛠️ Components

- **Node.js Express API**: Sample API that generates telemetry data
- **OpenTelemetry SDK**: Collects metrics, logs, and traces from applications
- **OpenTelemetry Collector**: Processes and routes telemetry data
- **Grafana**: Visualization and dashboarding platform
- **Loki**: Log aggregation system for centralized logging
- **Tempo**: Distributed tracing backend
- **Mimir**: Long-term storage for Prometheus metrics
- **Prophet**: Time-series forecasting for predictive analytics
- **Isolation Forest**: Machine learning algorithm for anomaly detection
- **AI Alert System**: Automated phone calling and RCA generation

---

## 📋 Prerequisites

- **Node.js** (v16 or later)
- **Docker** and **Docker Compose**
- **Python** (v3.8+) for AI/ML components
- **Twilio Account** (for phone alerts)
- **GEMINI    API Key** (for RCA generation)

---

## 🚀 Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd ai-api-monitoring-system

# Install Node.js dependencies
npm install

# Install Python dependencies for AI components
pip install -r requirements.txt
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# Twilio Configuration (for phone alerts)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# gemini Configuration (for RCA generation)
GEMINI_API_KEY=_gemini_api_key

# Alert Configuration
ALERT_PHONE_NUMBERS=+1234567890,+0987654321

# Application Configuration
NODE_ENV=production
API_PORT=8080
```

### 3. Start the Infrastructure

```bash
# Start all services using Docker Compose
docker-compose up -d

# Verify all services are running
docker-compose ps
```

### 4. Initialize the Observability Stack

```bash
# Wait for services to be ready (30-60 seconds)
sleep 60

# Initialize Grafana dashboards
./scripts/setup-dashboards.sh

# Configure Loki data sources
./scripts/setup-datasources.sh
```

### 5. Start the Application

```bash
# Start the Node.js API application
npm start

# Or run in development mode
npm run dev
```

### 6. Start AI/ML Components

```bash
# Start the anomaly detection service
python ai/anomaly_detector.py &

# Start the predictive analytics service
python ai/prophet_forecaster.py &

# Start the alert system
python ai/alert_system.py &

# Start the RCA engine
python ai/rca_engine.py &
```

### 7. Generate Test Traffic

```bash
# Run the load tester to generate traffic
docker-compose run load-tester

# Or use the custom traffic generator
python scripts/traffic_generator.py
```

---

## 🧪 Testing the System

### API Endpoints

Test the following endpoints to generate telemetry data:

```bash
# Roll a dice (generates random response times)
curl http://localhost:8080/rolldice

# Health check endpoint
curl http://localhost:8080/health

# Error simulation endpoint
curl http://localhost:8080/error

# Heavy computation endpoint (for latency testing)
curl http://localhost:8080/heavy

# Database operation simulation
curl http://localhost:8080/db-query
```

### Load Testing

```bash
# Generate sustained load for anomaly detection
artillery run load-test.yml

# Or use the Python load tester
python scripts/load_test.py --duration 300 --rps 50
```

---

## 📊 Accessing the Dashboards

### Grafana Dashboards

Access Grafana at **http://localhost:3000** (admin/admin)

**Pre-configured Dashboards:**
- **API Overview**: High-level metrics and health status
- **Anomaly Detection**: Real-time anomaly scores and alerts
- **Predictive Analytics**: Prophet forecasts and trends
- **Distributed Tracing**: Request flow visualization
- **Infrastructure Monitoring**: System resource usage

### Key Metrics to Monitor

1. **Response Time Percentiles** (P50, P95, P99)
2. **Error Rate** (4xx, 5xx responses)
3. **Request Throughput** (requests per second)
4. **Anomaly Scores** (Isolation Forest output)
5. **Prediction Accuracy** (Prophet model performance)

---

## 🔧 Configuration Files

### Core Configuration
- `instrumentation.js`: OpenTelemetry SDK configuration
- `otel-collector-config.yaml`: Collector pipeline configuration
- `docker-compose.yaml`: Infrastructure orchestration

### AI/ML Configuration
- `ai/config.py`: ML model parameters and thresholds
- `ai/prophet_config.json`: Prophet model configuration
- `ai/isolation_forest_config.json`: Anomaly detection parameters

### Monitoring Configuration
- `grafana/dashboards/`: Pre-built dashboard definitions
- `grafana/provisioning/`: Data source configurations
- `loki/config.yaml`: Log aggregation settings
- `tempo/config.yaml`: Distributed tracing configuration

---

## 🚨 Alert System Configuration

### Phone Alert Setup

Configure phone alerts in `ai/alert_system.py`:

```python
# Alert thresholds
ANOMALY_THRESHOLD = 0.7  # Isolation Forest score threshold
ERROR_RATE_THRESHOLD = 0.05  # 5% error rate threshold
LATENCY_THRESHOLD = 2000  # 2 seconds response time threshold

# Alert cooldown (prevent spam)
ALERT_COOLDOWN = 300  # 5 minutes between similar alerts
```

### RCA Report Generation

The system automatically generates RCA reports when:
- Anomaly score exceeds threshold
- Error rate spikes detected
- Latency anomalies identified
- Manual request via phone interface

---

## 🤖 AI/ML Components

### Prophet Forecasting

```python
# Prophet model predicts:
# - Future traffic patterns
# - Expected response times
# - Resource utilization trends
# - Potential failure windows
```

### Isolation Forest Anomaly Detection

```python
# Detects anomalies in:
# - Response time distributions
# - Error rate patterns
# - Request volume fluctuations
# - Cross-service correlation anomalies
```

---

## 🔍 Troubleshooting

### Check Service Health

```bash
# OpenTelemetry Collector
docker logs otel-collector

# Grafana
docker logs grafana

# Loki
docker logs loki

# Tempo
docker logs tempo

# Mimir
docker logs mimir

# AI Services
tail -f logs/anomaly_detector.log
tail -f logs/prophet_forecaster.log
tail -f logs/alert_system.log
```

### Common Issues

#### 1. Services Not Starting
```bash
# Check Docker resources
docker system prune
docker-compose down && docker-compose up -d
```

#### 2. No Metrics in Grafana
```bash
# Verify OpenTelemetry Collector configuration
curl http://localhost:8889/metrics
```

#### 3. Phone Alerts Not Working
```bash
# Check Twilio configuration
python -c "from ai.alert_system import test_twilio; test_twilio()"
```

#### 4. AI Models Not Loading
```bash
# Check Python dependencies
pip install -r requirements.txt --upgrade
```

---

## 📈 Performance Optimization

### Scaling Recommendations

1. **High Traffic Environments**:
   - Increase Collector replicas in `docker-compose.yaml`
   - Configure Mimir with object storage backend
   - Use Loki clustering for log ingestion

2. **Resource Optimization**:
   - Adjust retention policies in Loki and Mimir
   - Configure sampling rates in Tempo
   - Optimize AI model inference intervals

3. **Alert Tuning**:
   - Fine-tune anomaly detection thresholds
   - Implement alert suppression rules
   - Configure escalation policies

---

## 🛡️ Security Considerations

- Store sensitive credentials in environment variables
- Use TLS for all inter-service communication
- Implement authentication for Grafana dashboards
- Secure AI model endpoints with API keys
- Regular security updates for all components

---

## 📚 Additional Resources

- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Prophet Documentation](https://facebook.github.io/prophet/)
- [Isolation Forest Algorithm](https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.IsolationForest.html)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 💡 Value Proposition

✅ **Reduces MTTD and MTTR** with AI-powered alerts and automated RCA  
✅ **Improves system reliability** through proactive anomaly detection  
✅ **Simplifies debugging** with cross-environment correlation  
✅ **Minimizes disruptions** by predicting and resolving issues early  
✅ **Provides actionable insights** for capacity planning and optimization  

**Acts as the intelligent core of your distributed API system — alerting, analyzing, and automating for a seamless, reliable experience.**
